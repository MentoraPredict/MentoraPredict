import { UnauthorizedException } from '@nestjs/common';
import { RefreshTokenUseCase } from '../refresh-token.use-case';
import { IUserRepository } from '../../ports/output/i-user.repository';
import { ITokenGenerator } from '../../ports/output/i-token.generator';
import { ITokenCache } from '../../ports/output/i-token.cache';
import { UserEntity, UserRole } from '../../../domain/entities/user.entity';

const makeUser = (active = true) =>
  new UserEntity('uid-1', 'v@uce.edu.ec', 'hash', UserRole.STUDENT, active, true, new Date(), new Date());

const mockRepo    = (): jest.Mocked<IUserRepository>  => ({ findById: jest.fn(), findByEmail: jest.fn(), save: jest.fn(), update: jest.fn() });
const mockTokens  = (): jest.Mocked<ITokenGenerator>  => ({ generatePair: jest.fn(), verifyAccess: jest.fn(), verifyRefresh: jest.fn() });
const mockCache   = (): jest.Mocked<ITokenCache>      => ({
  setRefreshToken: jest.fn(), getRefreshToken: jest.fn(), deleteRefreshToken: jest.fn(),
  setResetToken: jest.fn(), getResetToken: jest.fn(), deleteResetToken: jest.fn(),
  incrementLoginAttempts: jest.fn(), deleteLoginAttempts: jest.fn(),
});

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let repo: jest.Mocked<IUserRepository>;
  let tokenGen: jest.Mocked<ITokenGenerator>;
  let cache: jest.Mocked<ITokenCache>;

  beforeEach(() => {
    repo     = mockRepo();
    tokenGen = mockTokens();
    cache    = mockCache();
    useCase  = new RefreshTokenUseCase(repo, tokenGen, cache);
  });

  it('returns a new access token for a valid refresh token', async () => {
    tokenGen.verifyRefresh.mockReturnValue({ sub: 'uid-1' });
    cache.getRefreshToken.mockResolvedValue('valid-rt');
    repo.findById.mockResolvedValue(makeUser());
    tokenGen.generatePair.mockReturnValue({ accessToken: 'new-at', refreshToken: 'new-rt', expiresIn: 900 });

    const result = await useCase.execute({ refreshToken: 'valid-rt' });

    expect(result.accessToken).toBe('new-at');
    expect(result.refreshToken).toBe('new-rt');
    expect(result.expiresIn).toBe(900);
    expect(cache.setRefreshToken).toHaveBeenCalledWith('uid-1', 'new-rt', expect.any(Number));
  });

  it('throws if verifyRefresh returns null (expired or tampered token)', async () => {
    tokenGen.verifyRefresh.mockReturnValue(null);

    await expect(useCase.execute({ refreshToken: 'bad-token' }))
      .rejects.toThrow(UnauthorizedException);
    expect(cache.getRefreshToken).not.toHaveBeenCalled();
  });

  it('throws if stored token does not match (token already rotated)', async () => {
    tokenGen.verifyRefresh.mockReturnValue({ sub: 'uid-1' });
    cache.getRefreshToken.mockResolvedValue('different-rt');

    await expect(useCase.execute({ refreshToken: 'old-rt' }))
      .rejects.toThrow(UnauthorizedException);
  });

  it('throws if Redis has no stored token (logout already happened)', async () => {
    tokenGen.verifyRefresh.mockReturnValue({ sub: 'uid-1' });
    cache.getRefreshToken.mockResolvedValue(null);

    await expect(useCase.execute({ refreshToken: 'any-rt' }))
      .rejects.toThrow(UnauthorizedException);
  });

  it('throws if user is disabled', async () => {
    tokenGen.verifyRefresh.mockReturnValue({ sub: 'uid-1' });
    cache.getRefreshToken.mockResolvedValue('valid-rt');
    repo.findById.mockResolvedValue(makeUser(false));

    await expect(useCase.execute({ refreshToken: 'valid-rt' }))
      .rejects.toThrow(UnauthorizedException);
  });
});
