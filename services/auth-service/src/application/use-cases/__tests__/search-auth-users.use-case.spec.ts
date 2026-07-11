import { SearchAuthUsersUseCase } from '../search-auth-users.use-case';
import { IUserRepository } from '../../ports/output/i-user.repository';
import { UserEntity, UserRole } from '../../../domain/entities/user.entity';

const makeUser = (id = 'uid-1') =>
  new UserEntity(
    id,
    `${id}@example.com`,
    null,
    UserRole.STUDENT,
    true,
    true,
    new Date(),
    new Date(),
    'Ada',
    'Lovelace',
  );

const mockRepo = (): jest.Mocked<IUserRepository> => ({
  findById: jest.fn(),
  findByIds: jest.fn(),
  searchByText: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

describe('SearchAuthUsersUseCase', () => {
  it('returns basic auth user data for search matches', async () => {
    const repo = mockRepo();
    repo.searchByText.mockResolvedValue([makeUser('u1')]);

    const useCase = new SearchAuthUsersUseCase(repo);
    const result = await useCase.execute('ada', 20);

    expect(repo.searchByText).toHaveBeenCalledWith('ada', 20);
    expect(result).toEqual([
      {
        id: 'u1',
        email: 'u1@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        isActive: true,
      },
    ]);
  });
});
