import { BadRequestException, ConflictException } from '@nestjs/common';
import {
  CreateSectionUseCase,
  GenerateSectionCoursesUseCase,
} from '../academic-structure.use-cases';

const section = {
  id: 'sec-1',
  schoolYearId: 'year-1',
  gradeLevelCode: 'EGB_8',
  name: 'A',
  shift: 'MATUTINA' as const,
  capacity: 30,
  tutorId: null,
  isActive: true,
};

const catalog = (id: string, name: string) => ({
  id,
  name,
  description: '',
  code: id.toUpperCase(),
  isActive: true,
  area: null,
});

const period = (id: string, startDate: string, endDate: string) => ({
  id,
  startDate: new Date(`${startDate}T00:00:00.000Z`),
  endDate: new Date(`${endDate}T00:00:00.000Z`),
});

describe('GenerateSectionCoursesUseCase', () => {
  const build = (offered: string[], curriculum = [
    { gradeLevelCode: 'EGB_8', subjectCatalogId: 'mat', weeklyHours: 5 },
    { gradeLevelCode: 'EGB_8', subjectCatalogId: 'len', weeklyHours: 4 },
  ]) => {
    const structureRepo: any = {
      findSection: jest.fn().mockResolvedValue(section),
      getCurriculum: jest.fn().mockResolvedValue(curriculum),
      listOfferedCatalogIds: jest.fn().mockResolvedValue(offered),
    };
    const yearRepo: any = {
      findById: jest.fn().mockResolvedValue({ id: 'year-1', status: 'ACTIVE' }),
    };
    const periodRepo: any = {
      findBySchoolYear: jest.fn().mockResolvedValue([
        period('p1', '2000-01-01', '2000-06-30'),
        period('p2', '2000-07-01', '2099-12-31'),
      ]),
    };
    const catalogRepo: any = {
      findById: jest.fn((id: string) => Promise.resolve(catalog(id, id === 'mat' ? 'Matemática' : 'Lengua'))),
    };
    const subjectRepo: any = { save: jest.fn((s) => Promise.resolve(s)) };
    const subjectTeacherRepo: any = { save: jest.fn() };
    const studentEnrollments: any = {
      listBySection: jest.fn().mockResolvedValue([{ studentId: 'stu-1' }]),
    };
    const enrollmentRepo: any = {
      findByStudentAndSubject: jest.fn().mockResolvedValue(null),
      save: jest.fn((e) => Promise.resolve(e)),
      update: jest.fn(),
    };

    return {
      useCase: new GenerateSectionCoursesUseCase(
        structureRepo, yearRepo, periodRepo, catalogRepo, subjectRepo, subjectTeacherRepo,
        studentEnrollments, enrollmentRepo,
      ),
      subjectRepo,
      subjectTeacherRepo,
      enrollmentRepo,
    };
  };

  it('crea una asignatura por cada materia de la malla, ligada al paralelo', async () => {
    const { useCase, subjectRepo, subjectTeacherRepo } = build([]);

    const result = await useCase.execute('sec-1');

    expect(result.created).toBe(2);
    expect(subjectRepo.save).toHaveBeenCalledTimes(2);
    const saved = subjectRepo.save.mock.calls[0][0];
    expect(saved.sectionId).toBe('sec-1');
    expect(saved.weeklyHours).toBe(5);
    expect(saved.teacherId).toBeNull();
    expect(saved.academicPeriodId).toBe('p2');
    expect(subjectTeacherRepo.save).not.toHaveBeenCalled();
  });

  it('matricula a los estudiantes del paralelo en los cursos nuevos', async () => {
    const { useCase, enrollmentRepo } = build([]);

    await useCase.execute('sec-1');

    expect(enrollmentRepo.save).toHaveBeenCalledTimes(2);
    expect(enrollmentRepo.save.mock.calls[0][0]).toMatchObject({ studentId: 'stu-1', status: 'ACTIVE' });
  });

  it('no duplica las asignaturas ya ofertadas', async () => {
    const { useCase, subjectRepo } = build(['mat']);

    const result = await useCase.execute('sec-1');

    expect(result).toMatchObject({ created: 1, alreadyOffered: 1 });
    expect(subjectRepo.save).toHaveBeenCalledTimes(1);
  });

  it('rechaza un grado sin malla curricular', async () => {
    const { useCase } = build([], []);
    await expect(useCase.execute('sec-1')).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('CreateSectionUseCase', () => {
  const build = (levels = [{ levelCode: 'EGB_SUPERIOR', isActive: true, shifts: ['MATUTINA'] }]) => {
    const repo: any = {
      findGradeLevel: jest.fn().mockResolvedValue({ code: 'EGB_8', levelCode: 'EGB_SUPERIOR' }),
      findSectionByKey: jest.fn().mockResolvedValue(null),
      saveSection: jest.fn((s) => Promise.resolve(s)),
    };
    const yearRepo: any = {
      findById: jest.fn().mockResolvedValue({ id: 'year-1', status: 'PLANNED' }),
    };
    const configRepo: any = { getLevels: jest.fn().mockResolvedValue(levels) };
    const teacherRole: any = { isTeacher: jest.fn().mockResolvedValue(true) };
    return { useCase: new CreateSectionUseCase(repo, yearRepo, configRepo, teacherRole), repo, teacherRole };
  };

  const dto = {
    schoolYearId: 'year-1',
    gradeLevelCode: 'EGB_8',
    name: ' a ',
    shift: 'MATUTINA' as const,
    capacity: 30,
  };

  it('normaliza el nombre y crea el paralelo', async () => {
    const { useCase, repo } = build();
    const created = await useCase.execute(dto);
    expect(created.name).toBe('A');
    expect(repo.saveSection).toHaveBeenCalledTimes(1);
  });

  it('rechaza una jornada que el nivel no ofrece', async () => {
    const { useCase } = build();
    await expect(useCase.execute({ ...dto, shift: 'NOCTURNA' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rechaza un paralelo duplicado', async () => {
    const { useCase, repo } = build();
    repo.findSectionByKey.mockResolvedValue({ id: 'otro' });
    await expect(useCase.execute(dto)).rejects.toBeInstanceOf(ConflictException);
  });

  it('rechaza un tutor sin rol de docente', async () => {
    const { useCase, teacherRole } = build();
    teacherRole.isTeacher.mockResolvedValue(false);
    await expect(useCase.execute({ ...dto, tutorId: 't-1' })).rejects.toBeInstanceOf(BadRequestException);
  });
});
