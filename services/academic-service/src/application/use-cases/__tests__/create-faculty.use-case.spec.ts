import { ConflictException } from '@nestjs/common';
import { CreateFacultyUseCase } from '../create-faculty.use-case';
import { IFacultyRepository } from '../../ports/output/i-faculty.repository';
import { FacultyEntity } from '../../../domain/entities/faculty.entity';

const mockRepo = (): jest.Mocked<IFacultyRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByCode: jest.fn(),
  findByName: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  hasCareer: jest.fn(),
  delete: jest.fn(),
});

describe('CreateFacultyUseCase', () => {
  let useCase: CreateFacultyUseCase;
  let repo: jest.Mocked<IFacultyRepository>;

  beforeEach(() => {
    repo = mockRepo();
    useCase = new CreateFacultyUseCase(repo);
  });

  it('creates faculty correctly when name and code are unique', async () => {
    repo.findByCode.mockResolvedValue(null);
    repo.findByName.mockResolvedValue(null);
    repo.save.mockImplementation(async (f) => f);

    const result = await useCase.execute({
      name: 'Facultad de Ingeniería',
      code: 'FI',
      description: 'Ingeniería y Tecnología',
    });

    expect(result.name).toBe('Facultad de Ingeniería');
    expect(result.code).toBe('FI');
    expect(result.status).toBe('ACTIVE');
    expect(result.id).toBeDefined();
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('throws ConflictException when code already exists', async () => {
    const existing = new FacultyEntity(
      'existing-id', 'Existing Faculty', 'FI', '', 'ACTIVE', new Date(), new Date(),
    );
    repo.findByCode.mockResolvedValue(existing);

    await expect(
      useCase.execute({ name: 'Nueva Facultad', code: 'FI' }),
    ).rejects.toThrow(ConflictException);

    expect(repo.save).not.toHaveBeenCalled();
  });

  it('throws ConflictException when name already exists', async () => {
    const existing = new FacultyEntity(
      'existing-id', 'Facultad de Ingeniería', 'OTHER', '', 'ACTIVE', new Date(), new Date(),
    );
    repo.findByCode.mockResolvedValue(null);
    repo.findByName.mockResolvedValue(existing);

    await expect(
      useCase.execute({ name: 'Facultad de Ingeniería', code: 'FI2' }),
    ).rejects.toThrow(ConflictException);

    expect(repo.save).not.toHaveBeenCalled();
  });
});
