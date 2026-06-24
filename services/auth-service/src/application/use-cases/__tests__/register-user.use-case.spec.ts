import { ConflictException } from "@nestjs/common";
import { RegisterUserUseCase } from "../register-user.use-case";
import { IUserRepository } from "../../ports/output/i-user.repository";
import { IPasswordHasher } from "../../ports/output/i-password.hasher";
import { UserEntity, UserRole } from "../../../domain/entities/user.entity";
import { IUserProfileClient } from "../../ports/output/i-user-profile.client";

const mockRepo = (): jest.Mocked<IUserRepository> => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

const mockUserProfileClient: IUserProfileClient = {
  createProfile: jest.fn().mockResolvedValue(undefined),
};

const mockHasher = (): jest.Mocked<IPasswordHasher> => ({
  hash: jest.fn(),
  compare: jest.fn(),
});

describe("RegisterUserUseCase", () => {
  let useCase: RegisterUserUseCase;
  let repo: jest.Mocked<IUserRepository>;
  let hasher: jest.Mocked<IPasswordHasher>;

  beforeEach(() => {
    repo = mockRepo();
    hasher = mockHasher();
    useCase = new RegisterUserUseCase(repo, hasher, mockUserProfileClient);
  });

  it("registers a new user and returns id, email, role", async () => {
    repo.findByEmail.mockResolvedValue(null);
    hasher.hash.mockResolvedValue("hashed_pw");
    repo.save.mockImplementation(async (u) => u);

    const result = await useCase.execute({
      firstName: "Victor",
      lastName: "Cañar",
      email: "victor@uce.edu.ec",
      password: "SecurePass123!",
    });

    expect(result.email).toBe("victor@uce.edu.ec");
    expect(result.role).toBe(UserRole.STUDENT);
    expect(hasher.hash).toHaveBeenCalledWith("SecurePass123!");
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it("throws ConflictException when email already exists", async () => {
    const existing = new UserEntity(
      "uuid-1",
      "victor@uce.edu.ec",
      "hash",
      UserRole.STUDENT,
      true,
      false,
      new Date(),
      new Date(),
    );
    repo.findByEmail.mockResolvedValue(existing);

    await expect(
      useCase.execute({
        firstName: "V",
        lastName: "C",
        email: "victor@uce.edu.ec",
        password: "SecurePass123!",
      }),
    ).rejects.toThrow(ConflictException);

    expect(repo.save).not.toHaveBeenCalled();
  });

  it("throws error if email is invalid", async () => {
    await expect(
      useCase.execute({
        firstName: "V",
        lastName: "C",
        email: "not-an-email",
        password: "SecurePass123!",
      }),
    ).rejects.toThrow();
  });

  it("throws error if password is too short", async () => {
    repo.findByEmail.mockResolvedValue(null);
    await expect(
      useCase.execute({
        firstName: "V",
        lastName: "C",
        email: "v@uce.edu.ec",
        password: "short",
      }),
    ).rejects.toThrow();
  });
});
