import { Inject, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { randomUUID as uuidv4 } from "crypto";
import { UserEntity, UserRole } from "../../domain/entities/user.entity";
import { IUserRepository } from "../ports/output/i-user.repository";
import { ITokenGenerator } from "../ports/output/i-token.generator";
import { ITokenCache } from "../ports/output/i-token.cache";
import { IUserProfileClient } from "../ports/output/i-user-profile.client";
import { LoginEventProducer } from "../../infrastructure/messaging/login-event.producer";
import { MicrosoftOAuthProfile } from "../../infrastructure/adapters/microsoft-oauth.client";
import { REDIS_TTL } from "../../shared-types-local";

@Injectable()
export class OAuthLoginUseCase {
  private readonly logger = new Logger(OAuthLoginUseCase.name);

  constructor(
    @Inject("IUserRepository") private readonly userRepo: IUserRepository,
    @Inject("ITokenGenerator") private readonly tokenGen: ITokenGenerator,
    @Inject("ITokenCache") private readonly cache: ITokenCache,
    @Inject("IUserProfileClient") private readonly userProfileClient: IUserProfileClient,
    private readonly eventProducer: LoginEventProducer,
  ) {}

  async execute(profile: MicrosoftOAuthProfile, ip: string) {
    let user = await this.userRepo.findByEmail(profile.email);

    if (!user) {
      const now = new Date();
      user = await this.userRepo.save(
        new UserEntity(
          uuidv4(),
          profile.email,
          null,
          UserRole.STUDENT,
          true,
          true,
          now,
          now,
          profile.firstName,
          profile.lastName,
          "MICROSOFT",
        ),
      );

      const newUserId = user.id;
      this.userProfileClient.createProfile(newUserId).catch((err) => {
        this.logger.error(
          `Failed to trigger profile creation for OAuth user ${newUserId}: ${err.message}`,
        );
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Account is disabled");
    }

    const tokens = this.tokenGen.generatePair(user.id, user.email, user.role);
    await this.cache.setRefreshToken(user.id, tokens.refreshToken, REDIS_TTL.REFRESH_TOKEN);

    await this.eventProducer.studentLoggedIn({
      studentId: user.id,
      occurredAt: new Date(),
      ip,
    });

    return { ...tokens, tokenType: "Bearer" as const };
  }
}
