import { BadRequestException } from '@nestjs/common';
import { ResetPasswordUseCase } from '../reset-password.use-case';
import { IUserRepository } from '../../ports/output/i-user.repository';
import { ICachePort } from '../../ports/output/i-cache.port';
import { IPasswordHasher } from '../../ports/output/i-password.hasher';
import { UserEntity, UserRole } from '../../../domain/entities/user.entity';

const makeUser = () =>
  new UserEntity('uid-1', 'v@uce.edu.ec', 'old-hash', UserRole.STUDENT, true, true, new Date(), new Date());

const mockRepo = (): jest.Mocked<IUserRepository> => ({
  findById: jest.fn(), findByEmail: jest.fn(), save: jest.fn(), update: jest.fn(),
});

const mockCache = (): jest.Mocked<ICachePort> => ({
  setResetToken: jest.fn(), getResetToken: jest.fn(), deleteResetToken: jest.fn(),
});

const mockHasher = (): jest.Mocked<IPasswordHasher> => ({
  hash: jest.fn(), compare: jest.fn(),
});

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let repo: jest.Mocked<IUserRepository>;
  let cache: jest.Mocked<ICachePort>;
  let hasher: jest.Mocked<IPasswordHasher>;

  beforeEach(() => {
    repo = mockRepo();
    cache = mockCache();
    hasher = mockHasher();
    useCase = new ResetPasswordUseCase(repo, cache, hasher);
  });

  it('resets password and invalidates token', async () => {
    const user = makeUser();
    cache.getResetToken.mockResolvedValue('uid-1');
    repo.findById.mockResolvedValue(user);
    hasher.hash.mockResolvedValue('new-hash');

    await useCase.execute({ token: 'reset-token', newPassword: 'newpassword1' });

    expect(hasher.hash).toHaveBeenCalledWith('newpassword1');
    expect(user.passwordHash).toBe('new-hash');
    expect(repo.update).toHaveBeenCalledWith(user);
    expect(cache.deleteResetToken).toHaveBeenCalledWith('reset-token');
  });

  it('throws when token is invalid', async () => {
    cache.getResetToken.mockResolvedValue(null);

    await expect(
      useCase.execute({ token: 'bad-token', newPassword: 'newpassword1' }),
    ).rejects.toThrow(BadRequestException);
  });
});
