import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import { IUserProfileClient } from "../../application/ports/output/i-user-profile.client";
import { InternalJwtService } from "../auth/internal-jwt.service";

const TIMEOUT_MS = 5000;
const MAX_RETRIES = 2;

@Injectable()
export class UserProfileHttpClient implements IUserProfileClient {
  private readonly logger = new Logger(UserProfileHttpClient.name);
  private readonly baseUrl: string;

  constructor(
    config: ConfigService,
    private readonly internalJwt: InternalJwtService,
  ) {
    this.baseUrl = config.get<string>(
      "USER_SERVICE_URL",
      "http://user-service:3002",
    );
  }

  async createProfile(userId: string): Promise<void> {
    const url = `${this.baseUrl}/api/v1/users/internal/profiles`;
    const corrId = randomUUID();
    let lastError: unknown;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.internalJwt.createServiceToken()}`,
            "x-correlation-id": corrId,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (!res.ok) {
          const bodyText = await res.text().catch(() => "");
          console.log(
            `[UserProfileHttpClient Error] Status: ${res.status}, Body: ${bodyText}`,
          );
          this.logger.error(
            `user-service responded ${res.status} creating profile for ${userId}. Response body: ${bodyText}`,
          );
          throw new Error(
            `user-service responded ${res.status} creating profile for ${userId}`,
          );
        }
        return;
      } catch (err) {
        lastError = err;
        this.logger.warn(
          `createProfile attempt ${attempt + 1} failed for user ${userId}`,
        );
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
        }
      }
    }

    this.logger.error(
      `Could not create user_profile for ${userId} after ${MAX_RETRIES + 1} attempts`,
      lastError as Error,
    );
    throw lastError;
  }

  async updateProfile(userId: string, dto: any): Promise<void> {
    const url = `${this.baseUrl}/api/v1/users/internal/profiles/${userId}`;
    const corrId = randomUUID();

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.internalJwt.createServiceToken()}`,
        "x-correlation-id": corrId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      throw new Error(`user-service update failed`);
    }
  }
}
