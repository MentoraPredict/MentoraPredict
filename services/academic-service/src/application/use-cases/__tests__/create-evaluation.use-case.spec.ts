import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CreateEvaluationUseCase } from "../create-evaluation.use-case";
import { IEvaluationRepository } from "../../ports/output/i-evaluation.repository";
import { ISubjectRepository } from "../../ports/output/i-subject.repository";
import { IAcademicPeriodRepository } from "../../ports/output/i-academic-period.repository";
import { SubjectEntity } from "../../../domain/entities/subject.entity";
import { AcademicPeriodEntity } from "../../../domain/entities/academic-period.entity";

const makeSubject = (active = true) =>
  new SubjectEntity(
    "subj-1",
    "Prog Web",
    "",
    "PW-701",
    4,
    "career-1",
    "period-1",
    30,
    null,
    active,
    new Date(),
    new Date(),
  );

const makePeriod = () =>
  new AcademicPeriodEntity(
    "period-1",
    "2025-1",
    "2025-1",
    "",
    new Date(),
    new Date(),
    "ACTIVE",
    "SEMESTER",
    new Date(),
    new Date(),
  );

const mockEvalRepo = (): jest.Mocked<IEvaluationRepository> => ({
  findById: jest.fn(),
  findBySubjectId: jest.fn(),
  getTotalWeightForSubject: jest.fn(),
  getTotalWeightExcluding: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

const mockSubjectRepo = (): jest.Mocked<ISubjectRepository> => ({
  findById: jest.fn(),
  findByAcademicPeriodId: jest.fn(),
  findAll: jest.fn(),
  findByCode: jest.fn(),
  findByNameAndPeriod: jest.fn(),
  hasAcademicRecords: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockPeriodRepo = (): jest.Mocked<IAcademicPeriodRepository> => ({
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

describe("CreateEvaluationUseCase", () => {
  let useCase: CreateEvaluationUseCase;
  let evalRepo: jest.Mocked<IEvaluationRepository>;
  let subjectRepo: jest.Mocked<ISubjectRepository>;
  let periodRepo: jest.Mocked<IAcademicPeriodRepository>;

  beforeEach(() => {
    evalRepo = mockEvalRepo();
    subjectRepo = mockSubjectRepo();
    periodRepo = mockPeriodRepo();
    useCase = new CreateEvaluationUseCase(evalRepo, subjectRepo, periodRepo);
  });

  it("creates evaluation when total weight stays below or equal to 100", async () => {
    subjectRepo.findById.mockResolvedValue(makeSubject());
    periodRepo.findById.mockResolvedValue(makePeriod());
    evalRepo.getTotalWeightForSubject.mockResolvedValue(50);
    evalRepo.save.mockImplementation(async (e) => e);

    const result = await useCase.execute({
      name: "Parcial 2",
      weight: 30,
      subjectId: "subj-1",
    });

    expect(result.name).toBe("Parcial 2");
    expect(result.weight).toBe(30);
  });

  it("throws BadRequestException when weight would exceed 100", async () => {
    subjectRepo.findById.mockResolvedValue(makeSubject());
    periodRepo.findById.mockResolvedValue(makePeriod());
    evalRepo.getTotalWeightForSubject.mockResolvedValue(80);

    await expect(
      useCase.execute({ name: "Extra", weight: 30, subjectId: "subj-1" }),
    ).rejects.toThrow(BadRequestException);
  });

  it("throws NotFoundException for inactive subject", async () => {
    subjectRepo.findById.mockResolvedValue(makeSubject(false));

    await expect(
      useCase.execute({ name: "P1", weight: 30, subjectId: "subj-1" }),
    ).rejects.toThrow(NotFoundException);
  });

  it("allows exactly 100% total weight", async () => {
    subjectRepo.findById.mockResolvedValue(makeSubject());
    periodRepo.findById.mockResolvedValue(makePeriod());
    evalRepo.getTotalWeightForSubject.mockResolvedValue(70);
    evalRepo.save.mockImplementation(async (e) => e);

    const result = await useCase.execute({
      name: "Final",
      weight: 30,
      subjectId: "subj-1",
    });

    expect(result.weight).toBe(30);
  });
});
