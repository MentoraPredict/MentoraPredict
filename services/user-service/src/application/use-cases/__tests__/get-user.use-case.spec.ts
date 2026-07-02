import { NotFoundException } from "@nestjs/common";
import { GetUserUseCase } from "../get-user.use-case";
import { IUserProfileRepository } from "../../../domain/ports/i-user-profile.repository";
import {
  AuthProvider,
  UserProfileEntity,
} from "../../../domain/entities/user-profile.entity";
import { IAuthServiceClient } from "../../ports/output/i-auth-service.client";

const profile = new UserProfileEntity(
  "uid-1",
  null,
  null,
  "1234567890",
  AuthProvider.LOCAL,
  "STUDENT",
  "ACTIVE",
  null,
  new Date(),
  new Date(),
);

const mockRepo = (): jest.Mocked<IUserProfileRepository> => ({
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  findAll: jest.fn(),
});

const mockAuthClient = (): jest.Mocked<IAuthServiceClient> => ({
  getUserById: jest.fn(),
});

describe("GetUserUseCase", () => {
  it("returns user when found", async () => {
    const repo = mockRepo();
    const authClient = mockAuthClient();
    repo.findById.mockResolvedValue(profile);
    authClient.getUserById.mockResolvedValue({
      id: "uid-1",
      email: "student@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
      isActive: true,
    });
    const useCase = new GetUserUseCase(repo, authClient);

    const result = await useCase.execute("uid-1");
    expect(result.id).toBe("uid-1");
    expect(result.email).toBe("student@example.com");
    expect(result.firstName).toBe("Ada");
  });

  it("throws when user not found", async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(null);
    const useCase = new GetUserUseCase(repo);

    await expect(useCase.execute("missing")).rejects.toThrow(NotFoundException);
  });
});
