import { UserProfileEntity } from "../../domain/entities/user-profile.entity";
import { AuthUserResponse } from "../ports/output/i-auth-service.client";
import { UserProfileResponseDto } from "../dtos/user-profile.response.dto";

export class GetUserMapper {
  static toResponse(
    profile: UserProfileEntity,
    auth?: AuthUserResponse,
  ): UserProfileResponseDto {
    return {
      id: profile.id,

      // profile (user-service)
      photo: profile.photo,
      bio: profile.bio,
      cedula: profile.cedula ?? "",
      role: profile.role,
      status: profile.status,
      deletedAt: profile.deletedAt,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,

      // auth-service
      email: auth?.email ?? "",
      firstName: auth?.firstName ?? "",
      lastName: auth?.lastName ?? "",
      isActive: auth?.isActive ?? profile.status === "ACTIVE",
    };
  }
}
