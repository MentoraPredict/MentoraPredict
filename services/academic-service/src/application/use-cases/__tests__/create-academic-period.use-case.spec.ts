import { BadRequestException, ConflictException } from '@nestjs/common';
import { CreateAcademicPeriodUseCase } from '../create-academic-period.use-case';
import { IAcademicPeriodRepository } from '../../ports/output/i-academic-period.repository';
import { AcademicPeriodEntity } from '../../../domain/entities/academic-period.entity';

const mockRepo = (): jest.Mocked<IAcademicPeriodRepository> => ({
  findById: jest.fn(),
  findActive: jest.fn(),
  findAll: jest.fn(),
  findByCode: jest.fn(),
  findByName: jest.fn(),
  countActive: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  hasRecords: jest.fn(),
  delete: jest.fn(),
});

describe('CreateAcademicPeriodUseCase', () => {
  let useCase: CreateAcademicPeriodUseCase;
  let repo: jest.Mocked<IAcademicPeriodRepository>;

  beforeEach(() => {
    repo = mockRepo();
    useCase = new CreateAcademicPeriodUseCase(repo);
  });

  it('creates academic period correctly with valid data', async () => {
    repo.findByCode.mockResolvedValue(null);
    repo.findByName.mockResolvedValue(null);
    repo.save.mockImplementation(async (p) => p);

    const result = await useCase.execute({
      name: '2025-I',
      code: '2025-1',
      startDate: '2025-02-01',
      endDate: '2025-06-30',
      type: 'SEMESTER',
    });

    expect(result.name).toBe('2025-I');
    expect(result.code).toBe('2025-1');
    expect(result.status).toBe('PLANNED');
    expect(result.id).toBeDefined();
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('throws BadRequestException when startDate >= endDate', async () => {
    await expect(
      useCase.execute({
        name: '2025-I',
        code: '2025-1',
        startDate: '2025-06-30',
        endDate: '2025-02-01',
        type: 'SEMESTER',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(repo.save).not.toHaveBeenCalled();
  });

  it('throws ConflictException when code already exists', async () => {
    const existing = new AcademicPeriodEntity(
      'existing-id', '2024-II', '2025-1', '', new Date('2024-08-01'), new Date('2024-12-31'),
      'FINISHED', 'SEMESTER', new Date(), new Date(),
    );
    repo.findByCode.mockResolvedValue(existing);

    await expect(
      useCase.execute({
        name: '2025-I',
        code: '2025-1',
        startDate: '2025-02-01',
        endDate: '2025-06-30',
        type: 'SEMESTER',
      }),
    ).rejects.toThrow(ConflictException);

    expect(repo.save).not.toHaveBeenCalled();
  });

  it('throws ConflictException when name already exists', async () => {
    const existing = new AcademicPeriodEntity(
      'existing-id', '2025-I', 'OTHER', '', new Date('2024-08-01'), new Date('2024-12-31'),
      'FINISHED', 'SEMESTER', new Date(), new Date(),
    );
    repo.findByCode.mockResolvedValue(null);
    repo.findByName.mockResolvedValue(existing);

    await expect(
      useCase.execute({
        name: '2025-I',
        code: '2025-NEW',
        startDate: '2025-02-01',
        endDate: '2025-06-30',
        type: 'SEMESTER',
      }),
    ).rejects.toThrow(ConflictException);

    expect(repo.save).not.toHaveBeenCalled();
  });
});
