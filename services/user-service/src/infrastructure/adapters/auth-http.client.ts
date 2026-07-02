import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { AxiosResponse } from "axios";
import { ConfigService } from "@nestjs/config";
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
  }

  async getUserById(userId: string): Promise<AuthUserResponse> {
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
      this.logger.error(
        `Could not fetch auth user ${userId} from auth-service`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
