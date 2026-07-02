import { NotFoundException } from "@nestjs/common";
import { UpdateUserUseCase } from "../update-user.use-case";
import { SoftDeleteUserUseCase } from "../soft-delete-user.use-case";
import { ListUsersUseCase } from "../list-users.use-case";
import { IUserProfileRepository } from "../../../domain/ports/i-user-profile.repository";
import {
  AuthProvider,
  UserProfileEntity,
} from "../../../domain/entities/user-profile.entity";
import { IAuthServiceClient } from "../../ports/output/i-auth-service.client";
import { IAuthSyncClient } from "../../ports/output/i-auth-sync.client";

const makeProfile = (id = "uid-1") =>
  new UserProfileEntity(
    id,
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

const mockAuthSyncClient = (): jest.Mocked<IAuthSyncClient> => ({
  syncRole: jest.fn().mockResolvedValue(undefined),
  syncStatus: jest.fn().mockResolvedValue(undefined),
});

// ─── UpdateUserUseCase ───────────────────────────────────────────────────────

describe("UpdateUserUseCase", () => {
  it("returns updated profile when user exists", async () => {
    const repo = mockRepo();
    const original = makeProfile();
    const updated = { ...original, bio: "Nueva bio" } as UserProfileEntity;
    repo.findById.mockResolvedValue(original);
    repo.update.mockResolvedValue(updated);

    const authSync = mockAuthSyncClient();
    const useCase = new UpdateUserUseCase(repo, authSync);
    const result = await useCase.execute("uid-1", { bio: "Nueva bio" });

    expect(repo.update).toHaveBeenCalledWith("uid-1", { bio: "Nueva bio" });
    expect(authSync.syncRole).not.toHaveBeenCalled();
    expect(authSync.syncStatus).not.toHaveBeenCalled();
    expect(result.bio).toBe("Nueva bio");
  });

  it("throws NotFoundException when user does not exist", async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(null);

    const useCase = new UpdateUserUseCase(repo, mockAuthSyncClient());
    await expect(useCase.execute("missing", { bio: "x" })).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });
});

// ─── SoftDeleteUserUseCase ───────────────────────────────────────────────────

describe("SoftDeleteUserUseCase", () => {
  it("calls softDelete on the repo when user exists", async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(makeProfile());
    repo.softDelete.mockResolvedValue(undefined);

    const useCase = new SoftDeleteUserUseCase(repo);
    await useCase.execute("uid-1");

    expect(repo.softDelete).toHaveBeenCalledWith("uid-1");
  });

  it("throws NotFoundException when user does not exist", async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(null);

    const useCase = new SoftDeleteUserUseCase(repo);
    await expect(useCase.execute("missing")).rejects.toThrow(NotFoundException);
    expect(repo.softDelete).not.toHaveBeenCalled();
  });
});

// ─── ListUsersUseCase ────────────────────────────────────────────────────────

describe("ListUsersUseCase", () => {
  it("returns all users when no filters are provided", async () => {
    const repo = mockRepo();
    const authClient = mockAuthClient();
    const profiles = [makeProfile("u1"), makeProfile("u2")];
    repo.findAll.mockResolvedValue(profiles);
    authClient.getUserById.mockImplementation(async (id: string) => ({
      id,
      email: `${id}@example.com`,
      firstName: `First ${id}`,
      lastName: `Last ${id}`,
      isActive: true,
    }));

    const useCase = new ListUsersUseCase(repo, authClient);
    const result = await useCase.execute({});

    expect(repo.findAll).toHaveBeenCalledWith({});
    expect(result).toHaveLength(2);
    expect(result[0].email).toBe("u1@example.com");
  });

  it("passes role and status filters to the repository", async () => {
    const repo = mockRepo();
    const authClient = mockAuthClient();
    repo.findAll.mockResolvedValue([makeProfile()]);
    authClient.getUserById.mockResolvedValue({
      id: "uid-1",
      email: "student@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
      isActive: true,
    });

    const useCase = new ListUsersUseCase(repo, authClient);
    await useCase.execute({ role: "TEACHER", status: "ACTIVE" });

    expect(repo.findAll).toHaveBeenCalledWith({
      role: "TEACHER",
      status: "ACTIVE",
    });
  });

  it("returns empty array when no users match filters", async () => {
    const repo = mockRepo();
    const authClient = mockAuthClient();
    repo.findAll.mockResolvedValue([]);

    const useCase = new ListUsersUseCase(repo, authClient);
    const result = await useCase.execute({ role: "ADMIN" });

    expect(result).toHaveLength(0);
  });
});
