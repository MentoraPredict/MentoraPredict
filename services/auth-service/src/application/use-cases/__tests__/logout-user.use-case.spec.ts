import { UnauthorizedException } from '@nestjs/common';
import { LogoutUserUseCase } from '../logout-user.use-case';
import { ITokenCache } from '../../ports/output/i-token.cache';

const mockCache = (): jest.Mocked<ITokenCache> => ({
  setRefreshToken: jest.fn(), getRefreshToken: jest.fn(), deleteRefreshToken: jest.fn(),
  setResetToken: jest.fn(), getResetToken: jest.fn(), deleteResetToken: jest.fn(),
  incrementLoginAttempts: jest.fn(), deleteLoginAttempts: jest.fn(),
});

describe('LogoutUserUseCase', () => {
  let useCase: LogoutUserUseCase;
  let cache: jest.Mocked<ITokenCache>;

  beforeEach(() => {
    cache   = mockCache();
    useCase = new LogoutUserUseCase(cache);
  });

  it('deletes refresh token when it matches stored token', async () => {
    cache.getRefreshToken.mockResolvedValue('my-rt');
    await useCase.execute('uid-1', 'my-rt');
    expect(cache.deleteRefreshToken).toHaveBeenCalledWith('uid-1');
  });

  it('still deletes if no token is stored (already logged out)', async () => {
    cache.getRefreshToken.mockResolvedValue(null);
    await useCase.execute('uid-1', 'any-rt');
    expect(cache.deleteRefreshToken).toHaveBeenCalledWith('uid-1');
  });

  it('throws if stored token does not match the provided one', async () => {
    cache.getRefreshToken.mockResolvedValue('other-rt');
    await expect(useCase.execute('uid-1', 'my-rt'))
      .rejects.toThrow(UnauthorizedException);
    expect(cache.deleteRefreshToken).not.toHaveBeenCalled();
  });
});
