import { ConflictException, NotFoundException } from '@nestjs/common';
import { ChangeAcademicPeriodStatusUseCase } from '../change-academic-period-status.use-case';
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

const makePeriod = (status: 'PLANNED' | 'ACTIVE' | 'FINISHED' | 'CANCELLED') =>
  new AcademicPeriodEntity(
    'period-1', '2025-I', '2025-1', '',
    new Date('2025-02-01'), new Date('2025-06-30'),
    status, 'SEMESTER', new Date(), new Date(),
  );

describe('ChangeAcademicPeriodStatusUseCase', () => {
  let useCase: ChangeAcademicPeriodStatusUseCase;
  let repo: jest.Mocked<IAcademicPeriodRepository>;

  beforeEach(() => {
    repo = mockRepo();
    useCase = new ChangeAcademicPeriodStatusUseCase(repo);
  });

  it('activates period correctly when no other active period exists', async () => {
    const period = makePeriod('PLANNED');
    repo.findById.mockResolvedValue(period);
    repo.countActive.mockResolvedValue(0);
    repo.update.mockImplementation(async (p) => p);

    const result = await useCase.execute('period-1', 'ACTIVE');

    expect(result.status).toBe('ACTIVE');
    expect(result.isActive).toBe(true);
    expect(repo.update).toHaveBeenCalledTimes(1);
  });

  it('throws ConflictException when trying to activate while another period is already active', async () => {
    const period = makePeriod('PLANNED');
    repo.findById.mockResolvedValue(period);
    repo.countActive.mockResolvedValue(1);

    await expect(
      useCase.execute('period-1', 'ACTIVE'),
    ).rejects.toThrow(ConflictException);

    expect(repo.update).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when period does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('nonexistent', 'ACTIVE'),
    ).rejects.toThrow(NotFoundException);
  });

  it('finishes period without checking active count', async () => {
    const period = makePeriod('ACTIVE');
    repo.findById.mockResolvedValue(period);
    repo.update.mockImplementation(async (p) => p);

    const result = await useCase.execute('period-1', 'FINISHED');

    expect(result.status).toBe('FINISHED');
    expect(repo.countActive).not.toHaveBeenCalled();
  });
});
