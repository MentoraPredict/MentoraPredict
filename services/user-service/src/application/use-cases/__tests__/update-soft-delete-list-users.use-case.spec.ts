import { NotFoundException } from "@nestjs/common";
import { UpdateUserUseCase } from "../update-user.use-case";
import { SoftDeleteUserUseCase } from "../soft-delete-user.use-case";
import { ListUsersUseCase } from "../list-users.use-case";
import { IUserProfileRepository } from "../../../domain/ports/i-user-profile.repository";
import {
  AuthProvider,
  UserProfileEntity,
} from "../../../domain/entities/user-profile.entity";

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

// ─── UpdateUserUseCase ───────────────────────────────────────────────────────

describe("UpdateUserUseCase", () => {
  it("returns updated profile when user exists", async () => {
    const repo = mockRepo();
    const original = makeProfile();
    const updated = { ...original, bio: "Nueva bio" } as UserProfileEntity;
    repo.findById.mockResolvedValue(original);
    repo.update.mockResolvedValue(updated);

    const useCase = new UpdateUserUseCase(repo);
    const result = await useCase.execute("uid-1", { bio: "Nueva bio" });

    expect(repo.update).toHaveBeenCalledWith("uid-1", { bio: "Nueva bio" });
    expect(result.bio).toBe("Nueva bio");
  });

  it("throws NotFoundException when user does not exist", async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(null);

    const useCase = new UpdateUserUseCase(repo);
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
    const profiles = [makeProfile("u1"), makeProfile("u2")];
    repo.findAll.mockResolvedValue(profiles);

    const useCase = new ListUsersUseCase(repo);
    const result = await useCase.execute({});

    expect(repo.findAll).toHaveBeenCalledWith({});
    expect(result).toHaveLength(2);
  });

  it("passes role and status filters to the repository", async () => {
    const repo = mockRepo();
    repo.findAll.mockResolvedValue([makeProfile()]);

    const useCase = new ListUsersUseCase(repo);
    await useCase.execute({ role: "TEACHER", status: "ACTIVE" });

    expect(repo.findAll).toHaveBeenCalledWith({
      role: "TEACHER",
      status: "ACTIVE",
    });
  });

  it("returns empty array when no users match filters", async () => {
    const repo = mockRepo();
    repo.findAll.mockResolvedValue([]);

    const useCase = new ListUsersUseCase(repo);
    const result = await useCase.execute({ role: "ADMIN" });

    expect(result).toHaveLength(0);
  });
});
