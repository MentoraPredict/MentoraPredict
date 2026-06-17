import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateCareerUseCase } from '../create-career.use-case';
import { ICareerRepository } from '../../ports/output/i-career.repository';
import { IFacultyRepository } from '../../ports/output/i-faculty.repository';
import { CareerEntity } from '../../../domain/entities/career.entity';
import { FacultyEntity } from '../../../domain/entities/faculty.entity';

const mockCareerRepo = (): jest.Mocked<ICareerRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByFaculty: jest.fn(),
  findByCode: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  hasSubjects: jest.fn(),
  delete: jest.fn(),
});

const mockFacultyRepo = (): jest.Mocked<IFacultyRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByCode: jest.fn(),
  findByName: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  hasCareer: jest.fn(),
  delete: jest.fn(),
});

const makeFaculty = () =>
  new FacultyEntity('faculty-1', 'Facultad de Ingeniería', 'FI', '', 'ACTIVE', new Date(), new Date());

describe('CreateCareerUseCase', () => {
  let useCase: CreateCareerUseCase;
  let careerRepo: jest.Mocked<ICareerRepository>;
  let facultyRepo: jest.Mocked<IFacultyRepository>;

  beforeEach(() => {
    careerRepo = mockCareerRepo();
    facultyRepo = mockFacultyRepo();
    useCase = new CreateCareerUseCase(careerRepo, facultyRepo);
  });

  it('creates career correctly when faculty exists and code is unique', async () => {
    facultyRepo.findById.mockResolvedValue(makeFaculty());
    careerRepo.findByCode.mockResolvedValue(null);
    careerRepo.save.mockImplementation(async (c) => c);

    const result = await useCase.execute({
      name: 'Ingeniería de Sistemas',
      code: 'IS',
      facultyId: 'faculty-1',
      durationSemesters: 10,
    });

    expect(result.name).toBe('Ingeniería de Sistemas');
    expect(result.code).toBe('IS');
    expect(result.status).toBe('ACTIVE');
    expect(result.facultyId).toBe('faculty-1');
    expect(result.id).toBeDefined();
    expect(careerRepo.save).toHaveBeenCalledTimes(1);
  });

  it('throws NotFoundException when faculty does not exist', async () => {
    facultyRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        name: 'Ingeniería de Sistemas',
        code: 'IS',
        facultyId: 'nonexistent-faculty',
        durationSemesters: 10,
      }),
    ).rejects.toThrow(NotFoundException);

    expect(careerRepo.save).not.toHaveBeenCalled();
  });

  it('throws ConflictException when code already exists', async () => {
    const existingCareer = new CareerEntity(
      'existing-id', 'Existing Career', 'IS', '', 'ACTIVE', 'faculty-1', 8, new Date(), new Date(),
    );
    facultyRepo.findById.mockResolvedValue(makeFaculty());
    careerRepo.findByCode.mockResolvedValue(existingCareer);

    await expect(
      useCase.execute({
        name: 'Ingeniería de Sistemas',
        code: 'IS',
        facultyId: 'faculty-1',
        durationSemesters: 10,
      }),
    ).rejects.toThrow(ConflictException);

    expect(careerRepo.save).not.toHaveBeenCalled();
  });
});
