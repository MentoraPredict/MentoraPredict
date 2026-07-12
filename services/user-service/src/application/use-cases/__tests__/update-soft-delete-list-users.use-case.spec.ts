import { ConflictException, NotFoundException } from "@nestjs/common";
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
import { IAcademicStatusClient } from "../../ports/output/i-academic-status.client";
import { INotificationClient } from "../../ports/output/i-notification-client";

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
  findPaginated: jest.fn(),
});

const mockAuthClient = (): jest.Mocked<IAuthServiceClient> => ({
  getUserById: jest.fn(),
  getUsersByIds: jest.fn().mockResolvedValue([]),
  searchUsers: jest.fn().mockResolvedValue([]),
});

const mockAuthSyncClient = (): jest.Mocked<IAuthSyncClient> => ({
  syncRole: jest.fn().mockResolvedValue(undefined),
  syncStatus: jest.fn().mockResolvedValue(undefined),
  syncProfile: jest.fn().mockResolvedValue(undefined),
});

const mockAcademicStatusClient = (): jest.Mocked<IAcademicStatusClient> => ({
  getDeactivationEligibility: jest.fn().mockResolvedValue({ canDeactivate: true }),
});

const mockNotificationClient = (): jest.Mocked<INotificationClient> => ({
  notify: jest.fn().mockResolvedValue(undefined),
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
    const useCase = new UpdateUserUseCase(
      repo,
      authSync,
      mockAcademicStatusClient(),
      mockNotificationClient(),
    );
    const result = await useCase.execute("uid-1", { bio: "Nueva bio" });

    expect(repo.update).toHaveBeenCalledWith("uid-1", { bio: "Nueva bio" });
    expect(authSync.syncRole).not.toHaveBeenCalled();
    expect(authSync.syncStatus).not.toHaveBeenCalled();
    expect(authSync.syncProfile).not.toHaveBeenCalled();
    expect(result.bio).toBe("Nueva bio");
  });

  it("throws NotFoundException when user does not exist", async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(null);

    const useCase = new UpdateUserUseCase(
      repo,
      mockAuthSyncClient(),
      mockAcademicStatusClient(),
      mockNotificationClient(),
    );
    await expect(useCase.execute("missing", { bio: "x" })).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("does not allow deactivating an administrator", async () => {
    const repo = mockRepo();
    const admin = makeProfile();
    admin.role = "ADMIN";
    repo.findById.mockResolvedValue(admin);
    const academicStatus = mockAcademicStatusClient();
    const useCase = new UpdateUserUseCase(
      repo,
      mockAuthSyncClient(),
      academicStatus,
      mockNotificationClient(),
    );

    await expect(useCase.execute("uid-1", { status: "INACTIVE" })).rejects.toThrow(
      ConflictException,
    );
    expect(academicStatus.getDeactivationEligibility).not.toHaveBeenCalled();
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("blocks deactivation when the user has active academic dependencies", async () => {
    const repo = mockRepo();
    const teacher = makeProfile();
    teacher.role = "TEACHER";
    repo.findById.mockResolvedValue(teacher);
    const academicStatus = mockAcademicStatusClient();
    academicStatus.getDeactivationEligibility.mockResolvedValue({
      canDeactivate: false,
      reason: "Tiene un curso activo.",
    });
    const useCase = new UpdateUserUseCase(
      repo,
      mockAuthSyncClient(),
      academicStatus,
      mockNotificationClient(),
    );

    await expect(useCase.execute("uid-1", { status: "INACTIVE" })).rejects.toThrow(
      "Tiene un curso activo.",
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("deactivates a user without active academic dependencies", async () => {
    const repo = mockRepo();
    const student = makeProfile();
    const updated = { ...student, status: "INACTIVE" } as UserProfileEntity;
    repo.findById.mockResolvedValue(student);
    repo.update.mockResolvedValue(updated);
    const authSync = mockAuthSyncClient();
    const academicStatus = mockAcademicStatusClient();
    const useCase = new UpdateUserUseCase(
      repo,
      authSync,
      academicStatus,
      mockNotificationClient(),
    );

    const result = await useCase.execute("uid-1", { status: "INACTIVE" });

    expect(academicStatus.getDeactivationEligibility).toHaveBeenCalledWith(
      "uid-1",
      "STUDENT",
    );
    expect(repo.update).toHaveBeenCalled();
    expect(result.status).toBe("INACTIVE");
  });

  it("blocks changing a teacher with an active course to student", async () => {
    const repo = mockRepo();
    const teacher = makeProfile();
    teacher.role = "TEACHER";
    repo.findById.mockResolvedValue(teacher);
    const academicStatus = mockAcademicStatusClient();
    academicStatus.getDeactivationEligibility.mockResolvedValue({ canDeactivate: false });
    const authSync = mockAuthSyncClient();
    const useCase = new UpdateUserUseCase(
      repo,
      authSync,
      academicStatus,
      mockNotificationClient(),
    );

    await expect(useCase.execute("uid-1", { role: "STUDENT" })).rejects.toThrow(
      "curso activo",
    );
    expect(repo.update).not.toHaveBeenCalled();
    expect(authSync.syncRole).not.toHaveBeenCalled();
  });

  it("blocks changing a student with an active enrollment to teacher", async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(makeProfile());
    const academicStatus = mockAcademicStatusClient();
    academicStatus.getDeactivationEligibility.mockResolvedValue({ canDeactivate: false });
    const useCase = new UpdateUserUseCase(
      repo,
      mockAuthSyncClient(),
      academicStatus,
      mockNotificationClient(),
    );

    await expect(useCase.execute("uid-1", { role: "TEACHER" })).rejects.toThrow(
      "matrícula activa",
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("changes role and waits for auth-service when there are no active dependencies", async () => {
    const repo = mockRepo();
    const student = makeProfile();
    const updated = { ...student, role: "TEACHER" } as UserProfileEntity;
    repo.findById.mockResolvedValue(student);
    repo.update.mockResolvedValue(updated);
    const authSync = mockAuthSyncClient();
    const notifications = mockNotificationClient();
    const useCase = new UpdateUserUseCase(
      repo,
      authSync,
      mockAcademicStatusClient(),
      notifications,
    );

    await useCase.execute("uid-1", { role: "TEACHER" });

    expect(authSync.syncRole).toHaveBeenCalledWith("uid-1", "TEACHER");
    expect(notifications.notify).toHaveBeenCalledWith({
      recipientId: "uid-1",
      recipientRole: "TEACHER",
      type: "ROLE_CHANGED",
      title: "Tu rol ha cambiado",
      message: expect.stringContaining("estudiante a docente"),
    });
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
    authClient.getUsersByIds.mockResolvedValue(
      ["u1", "u2"].map((id) => ({
        id,
        email: `${id}@example.com`,
        firstName: `First ${id}`,
        lastName: `Last ${id}`,
        isActive: true,
      })),
    );

    const useCase = new ListUsersUseCase(repo, authClient);
    const result = await useCase.execute({});

    expect(repo.findAll).toHaveBeenCalledWith({});
    expect(authClient.getUsersByIds).toHaveBeenCalledWith(["u1", "u2"]);
    expect(result).toHaveLength(2);
    expect(result[0].email).toBe("u1@example.com");
  });

  it("passes role and status filters to the repository", async () => {
    const repo = mockRepo();
    const authClient = mockAuthClient();
    repo.findAll.mockResolvedValue([makeProfile()]);
    authClient.getUsersByIds.mockResolvedValue([
      {
        id: "uid-1",
        email: "student@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
        isActive: true,
      },
    ]);

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

  it("degrades gracefully when a user is missing from the auth-service batch response", async () => {
    const repo = mockRepo();
    const authClient = mockAuthClient();
    const profiles = [makeProfile("u1"), makeProfile("u2")];
    repo.findAll.mockResolvedValue(profiles);
    // u1 has no matching auth-service record (e.g. an orphaned profile);
    // the batch call still succeeds and returns what it can find.
    authClient.getUsersByIds.mockResolvedValue([
      {
        id: "u2",
        email: "u2@example.com",
        firstName: "First u2",
        lastName: "Last u2",
        isActive: true,
      },
    ]);

    const useCase = new ListUsersUseCase(repo, authClient);
    const result = await useCase.execute({});

    expect(result).toHaveLength(2);
    expect(result[0].email).toBe("");
    expect(result[1].email).toBe("u2@example.com");
  });

  it("makes a single batched auth-service call regardless of how many profiles are listed", async () => {
    const repo = mockRepo();
    const authClient = mockAuthClient();
    const profiles = [makeProfile("u1"), makeProfile("u2"), makeProfile("u3")];
    repo.findAll.mockResolvedValue(profiles);
    authClient.getUsersByIds.mockResolvedValue([]);

    const useCase = new ListUsersUseCase(repo, authClient);
    await useCase.execute({});

    expect(authClient.getUsersByIds).toHaveBeenCalledTimes(1);
    expect(authClient.getUserById).not.toHaveBeenCalled();
  });

  it("returns paginated users with metadata", async () => {
    const repo = mockRepo();
    const authClient = mockAuthClient();
    const profiles = [makeProfile("u1")];
    repo.findPaginated.mockResolvedValue({ items: profiles, total: 21 });
    authClient.getUsersByIds.mockResolvedValue([
      {
        id: "u1",
        email: "u1@example.com",
        firstName: "First u1",
        lastName: "Last u1",
        isActive: true,
      },
    ]);

    const useCase = new ListUsersUseCase(repo, authClient);
    const result = await useCase.executePaginated(
      { role: "STUDENT", status: "ACTIVE" },
      { page: 2, limit: 10 },
    );

    expect(repo.findPaginated).toHaveBeenCalledWith(
      { role: "STUDENT", status: "ACTIVE" },
      { page: 2, limit: 10 },
    );
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(21);
    expect(result.totalPages).toBe(3);
  });

  it("filters paginated users by auth-service search matches", async () => {
    const repo = mockRepo();
    const authClient = mockAuthClient();
    const profiles = [makeProfile("u2")];
    authClient.searchUsers.mockResolvedValue([
      {
        id: "u2",
        email: "ada@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
        isActive: true,
      },
    ]);
    repo.findPaginated.mockResolvedValue({ items: profiles, total: 1 });
    authClient.getUsersByIds.mockResolvedValue([
      {
        id: "u2",
        email: "ada@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
        isActive: true,
      },
    ]);

    const useCase = new ListUsersUseCase(repo, authClient);
    const result = await useCase.executePaginated(
      { role: "STUDENT" },
      { page: 1, limit: 10 },
      "ada",
    );

    expect(authClient.searchUsers).toHaveBeenCalledWith("ada", 500);
    expect(repo.findPaginated).toHaveBeenCalledWith(
      { role: "STUDENT", ids: ["u2"] },
      { page: 1, limit: 10 },
    );
    expect(result.data[0].email).toBe("ada@example.com");
  });
});
