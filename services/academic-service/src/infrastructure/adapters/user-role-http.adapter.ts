import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "node:crypto";
import { correlationContext } from "@mentorapredict/shared-logger";
import { ITeacherRolePort } from "../../application/ports/output/i-teacher-role.port";
import { IUserRolePort } from "../../application/ports/output/i-user-role.port";
import { InternalJwtService } from "../auth/internal-jwt.service";

const TIMEOUT_MS = 5000;

@Injectable()
export class UserRoleHttpAdapter implements ITeacherRolePort, IUserRolePort {
  private readonly logger = new Logger(UserRoleHttpAdapter.name);
  private readonly baseUrl: string;

  constructor(
    private readonly config: ConfigService,
    private readonly internalJwt: InternalJwtService,
  ) {
    this.baseUrl = config.get<string>(
      "USER_SERVICE_URL",
      "http://user-service:3002",
    );
  }

  async isTeacher(userId: string): Promise<boolean> {
    return (await this.getRole(userId)) === "TEACHER";
  }

  async getRole(userId: string): Promise<string | null> {
    const url = `${this.baseUrl}/api/v1/users/internal/profiles/${userId}`;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.internalJwt.createServiceToken()}`,
          "x-correlation-id": correlationContext.getId() ?? randomUUID(),
        },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) return null;
      const data = (await res.json()) as { role?: string };
      return data.role ?? null;
    } catch (err) {
      this.logger.warn(`Failed to resolve role for ${userId}`, err);
      return null;
    }
  }
}
