import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { AxiosResponse } from "axios";
import { randomUUID } from "node:crypto";
import { ConfigService } from "@nestjs/config";
import { correlationContext } from "@mentorapredict/shared-logger";
import {
  IAuthServiceClient,
  AuthUserResponse,
} from "../../application/ports/output/i-auth-service.client";
import { InternalJwtService } from "../auth/internal-jwt.service";

@Injectable()
export class AuthHttpClient implements IAuthServiceClient {
  private readonly logger = new Logger(AuthHttpClient.name);
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
    private readonly internalJwt: InternalJwtService,
  ) {
    this.baseUrl = config.get<string>(
      "AUTH_SERVICE_URL",
      "http://auth-service:3001",
    );
    this.http.axiosRef.interceptors.request.use((requestConfig) => {
      requestConfig.headers.set(
        "x-correlation-id",
        correlationContext.getId() ?? randomUUID(),
      );
      return requestConfig;
    });
  }

  async getUserById(userId: string): Promise<AuthUserResponse | undefined> {
    const url = `${this.baseUrl}/api/v1/auth/internal/users/${userId}`;

    try {
      const response = (await firstValueFrom(
        this.http.get<AuthUserResponse>(url, {
          headers: {
            Authorization: `Bearer ${this.internalJwt.createServiceToken()}`,
          },
          timeout: 5000,
        }),
      )) as AxiosResponse<AuthUserResponse>;

      return response.data;
    } catch (error) {
      this.logger.warn(
        `Could not fetch auth user ${userId} from auth-service: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return undefined;
    }
  }

  async getUsersByIds(userIds: string[]): Promise<AuthUserResponse[]> {
    if (userIds.length === 0) {
      return [];
    }

    const url = `${this.baseUrl}/api/v1/auth/internal/users/batch`;

    try {
      const response = (await firstValueFrom(
        this.http.post<AuthUserResponse[]>(
          url,
          { ids: userIds },
          {
            headers: {
              Authorization: `Bearer ${this.internalJwt.createServiceToken()}`,
            },
            timeout: 5000,
          },
        ),
      )) as AxiosResponse<AuthUserResponse[]>;

      return response.data;
    } catch (error) {
      this.logger.warn(
        `Could not batch-fetch ${userIds.length} auth users from auth-service: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return [];
    }
  }

  async searchUsers(search: string, limit = 200): Promise<AuthUserResponse[]> {
    const normalizedSearch = search.trim();
    if (!normalizedSearch) {
      return [];
    }

    const url = `${this.baseUrl}/api/v1/auth/internal/users/search`;

    try {
      const response = (await firstValueFrom(
        this.http.get<AuthUserResponse[]>(url, {
          params: {
            q: normalizedSearch,
            limit,
          },
          headers: {
            Authorization: `Bearer ${this.internalJwt.createServiceToken()}`,
          },
          timeout: 5000,
        }),
      )) as AxiosResponse<AuthUserResponse[]>;

      return response.data;
    } catch (error) {
      this.logger.warn(
        `Could not search auth users from auth-service: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return [];
    }
  }
}
