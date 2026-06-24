import { NotFoundException } from "@nestjs/common";
import { GetUserUseCase } from "../get-user.use-case";
import { IUserProfileRepository } from "../../../domain/ports/i-user-profile.repository";
import {
  AuthProvider,
  UserProfileEntity,
} from "../../../domain/entities/user-profile.entity";

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

describe("GetUserUseCase", () => {
  it("returns user when found", async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(profile);
    const useCase = new GetUserUseCase(repo);

    const result = await useCase.execute("uid-1");
    expect(result.id).toBe("uid-1");
  });

  it("throws when user not found", async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(null);
    const useCase = new GetUserUseCase(repo);

    await expect(useCase.execute("missing")).rejects.toThrow(NotFoundException);
  });
});
