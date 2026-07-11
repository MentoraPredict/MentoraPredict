import { GetAuthUsersByIdsUseCase } from '../get-auth-users-by-ids.use-case';
import { IUserRepository } from '../../ports/output/i-user.repository';
import { UserEntity, UserRole } from '../../../domain/entities/user.entity';

const makeUser = (id: string) =>
  new UserEntity(id, `${id}@uce.edu.ec`, 'hash', UserRole.STUDENT, true, true, new Date(), new Date());

const mockRepo = (): jest.Mocked<IUserRepository> => ({
  findById: jest.fn(),
  findByIds: jest.fn(),
  searchByText: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

describe('GetAuthUsersByIdsUseCase', () => {
  let repo: jest.Mocked<IUserRepository>;
  let useCase: GetAuthUsersByIdsUseCase;

  beforeEach(() => {
    repo = mockRepo();
    useCase = new GetAuthUsersByIdsUseCase(repo);
  });

  it('returns the auth-facing shape for every user found by the repository', async () => {
    repo.findByIds.mockResolvedValue([makeUser('uid-1'), makeUser('uid-2')]);

    const result = await useCase.execute(['uid-1', 'uid-2']);

    expect(repo.findByIds).toHaveBeenCalledWith(['uid-1', 'uid-2']);
    expect(result).toEqual([
      { id: 'uid-1', email: 'uid-1@uce.edu.ec', firstName: '', lastName: '', isActive: true },
      { id: 'uid-2', email: 'uid-2@uce.edu.ec', firstName: '', lastName: '', isActive: true },
    ]);
  });

  it('does not fail the whole batch when some ids are missing from auth-service', async () => {
    repo.findByIds.mockResolvedValue([makeUser('uid-1')]);

    const result = await useCase.execute(['uid-1', 'uid-missing']);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('uid-1');
  });
});
