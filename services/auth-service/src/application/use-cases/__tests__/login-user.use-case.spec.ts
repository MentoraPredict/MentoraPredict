import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { LoginUserUseCase } from '../login-user.use-case';
import { IUserRepository } from '../../ports/output/i-user.repository';
import { IPasswordHasher } from '../../ports/output/i-password.hasher';
import { ITokenGenerator } from '../../ports/output/i-token.generator';
import { ITokenCache } from '../../ports/output/i-token.cache';
import { UserEntity, UserRole } from '../../../domain/entities/user.entity';

const makeUser = (active = true) =>
  new UserEntity('uid-1', 'v@uce.edu.ec', 'hash', UserRole.STUDENT, active, true, new Date(), new Date());

const mockRepo    = (): jest.Mocked<IUserRepository>   => ({ findById: jest.fn(), findByEmail: jest.fn(), save: jest.fn(), update: jest.fn() });
const mockHasher  = (): jest.Mocked<IPasswordHasher>   => ({ hash: jest.fn(), compare: jest.fn() });
const mockTokens  = (): jest.Mocked<ITokenGenerator>   => ({ generatePair: jest.fn(), verifyAccess: jest.fn(), verifyRefresh: jest.fn() });
const mockCache   = (): jest.Mocked<ITokenCache>       => ({
  setRefreshToken: jest.fn(), getRefreshToken: jest.fn(), deleteRefreshToken: jest.fn(),
  setResetToken: jest.fn(), getResetToken: jest.fn(), deleteResetToken: jest.fn(),
  incrementLoginAttempts: jest.fn(), deleteLoginAttempts: jest.fn(),
});

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let repo: jest.Mocked<IUserRepository>;
  let hasher: jest.Mocked<IPasswordHasher>;
  let tokenGen: jest.Mocked<ITokenGenerator>;
  let cache: jest.Mocked<ITokenCache>;

  beforeEach(() => {
    repo     = mockRepo();
    hasher   = mockHasher();
    tokenGen = mockTokens();
    cache    = mockCache();
    useCase  = new LoginUserUseCase(repo, hasher, tokenGen, cache);
  });

  it('returns token pair on valid credentials', async () => {
    cache.incrementLoginAttempts.mockResolvedValue(1);
    repo.findByEmail.mockResolvedValue(makeUser());
    hasher.compare.mockResolvedValue(true);
    tokenGen.generatePair.mockReturnValue({ accessToken: 'at', refreshToken: 'rt', expiresIn: 900 });

    const result = await useCase.execute({ email: 'v@uce.edu.ec', password: 'pass' }, '127.0.0.1');

    expect(result.accessToken).toBe('at');
    expect(result.tokenType).toBe('Bearer');
    expect(cache.setRefreshToken).toHaveBeenCalledWith('uid-1', 'rt', expect.any(Number));
  });

  it('throws UnauthorizedException for wrong password', async () => {
    cache.incrementLoginAttempts.mockResolvedValue(1);
    repo.findByEmail.mockResolvedValue(makeUser());
    hasher.compare.mockResolvedValue(false);

    await expect(useCase.execute({ email: 'v@uce.edu.ec', password: 'wrong' }, '127.0.0.1'))
      .rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException for disabled account', async () => {
    cache.incrementLoginAttempts.mockResolvedValue(1);
    repo.findByEmail.mockResolvedValue(makeUser(false));

    await expect(useCase.execute({ email: 'v@uce.edu.ec', password: 'pass' }, '127.0.0.1'))
      .rejects.toThrow(UnauthorizedException);
  });

  it('resets the rate limit counter after a successful login', async () => {
    cache.incrementLoginAttempts.mockResolvedValue(3);
    repo.findByEmail.mockResolvedValue(makeUser());
    hasher.compare.mockResolvedValue(true);
    tokenGen.generatePair.mockReturnValue({ accessToken: 'at', refreshToken: 'rt', expiresIn: 900 });

    await useCase.execute({ email: 'v@uce.edu.ec', password: 'pass' }, '127.0.0.1');

    expect(cache.deleteLoginAttempts).toHaveBeenCalledWith('127.0.0.1');
  });

  it('throws ForbiddenException after 10 failed attempts', async () => {
    cache.incrementLoginAttempts.mockResolvedValue(11);

    await expect(useCase.execute({ email: 'v@uce.edu.ec', password: 'pass' }, '1.2.3.4'))
      .rejects.toThrow(ForbiddenException);
    expect(repo.findByEmail).not.toHaveBeenCalled();
  });
});
