import { ForgotPasswordUseCase } from '../forgot-password.use-case';
import { IUserRepository } from '../../ports/output/i-user.repository';
import { ICachePort } from '../../ports/output/i-cache.port';
import { IEmailPort } from '../../ports/output/i-email.port';
import { UserEntity, UserRole } from '../../../domain/entities/user.entity';

const makeUser = () =>
  new UserEntity('uid-1', 'v@uce.edu.ec', 'hash', UserRole.STUDENT, true, true, new Date(), new Date());

const mockRepo = (): jest.Mocked<IUserRepository> => ({
  findById: jest.fn(), findByEmail: jest.fn(), save: jest.fn(), update: jest.fn(),
});

const mockCache = (): jest.Mocked<ICachePort> => ({
  setResetToken: jest.fn(), getResetToken: jest.fn(), deleteResetToken: jest.fn(),
});

const mockEmail = (): jest.Mocked<IEmailPort> => ({
  sendPasswordReset: jest.fn(),
});

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;
  let repo: jest.Mocked<IUserRepository>;
  let cache: jest.Mocked<ICachePort>;
  let email: jest.Mocked<IEmailPort>;

  beforeEach(() => {
    repo = mockRepo();
    cache = mockCache();
    email = mockEmail();
    useCase = new ForgotPasswordUseCase(repo, cache, email);
  });

  it('stores reset token and sends email when user exists', async () => {
    repo.findByEmail.mockResolvedValue(makeUser());

    await useCase.execute({ email: 'v@uce.edu.ec' });

    expect(cache.setResetToken).toHaveBeenCalledWith(expect.any(String), 'uid-1', 3600);
    expect(email.sendPasswordReset).toHaveBeenCalledWith('v@uce.edu.ec', expect.any(String));
  });

  it('does nothing when email is not registered', async () => {
    repo.findByEmail.mockResolvedValue(null);

    await useCase.execute({ email: 'unknown@uce.edu.ec' });

    expect(cache.setResetToken).not.toHaveBeenCalled();
    expect(email.sendPasswordReset).not.toHaveBeenCalled();
  });
});
