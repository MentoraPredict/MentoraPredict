import { ForbiddenException } from '@nestjs/common';
import { GetMyGradeBreakdownUseCase } from '../grading.use-cases';

const PERIOD = { id: 'p1', name: 'Trimestre 1', number: 1 };

function setup(studentIds: string[]) {
  const subjectRepo = {
    findById: jest.fn().mockResolvedValue({ id: 's1', name: 'Matemática', code: 'MAT', sectionId: 'sec1' }),
  };
  const periodRepo = { findBySchoolYear: jest.fn().mockResolvedValue([PERIOD]) };
  const structure = { findSection: jest.fn().mockResolvedValue({ schoolYearId: 'y1' }) };
  const grading = {
    listActivities: jest.fn().mockResolvedValue([
      { id: 'a1', name: 'Lección 1', componentCode: 'FORMATIVE', dueDate: null, isActive: true },
      { id: 'a2', name: 'Prueba', componentCode: 'SUMMATIVE', dueDate: null, isActive: true },
      { id: 'a3', name: 'Anulada', componentCode: 'FORMATIVE', dueDate: null, isActive: false },
    ]),
  };
  const calculator = {
    coursePeriod: jest.fn().mockResolvedValue({
      config: {
        scale: { minValue: 0, maxValue: 10, passingGrade: 7, decimals: 2 },
        components: [
          { code: 'FORMATIVE', name: 'Formativa', weight: 70 },
          { code: 'SUMMATIVE', name: 'Sumativa', weight: 30 },
        ],
      },
      studentIds,
      rows: [
        { studentId: 'me', activityId: 'a1', value: 9 },
        { studentId: 'other', activityId: 'a1', value: 4 },
        { studentId: 'other', activityId: 'a2', value: 3 },
      ],
      byStudent: new Map([
        ['me', { value: 9, componentAverages: { FORMATIVE: 9, SUMMATIVE: null }, isComplete: false }],
        ['other', { value: 3.5, componentAverages: { FORMATIVE: 4, SUMMATIVE: 3 }, isComplete: true }],
      ]),
    }),
  };

  const useCase = new GetMyGradeBreakdownUseCase(
    subjectRepo as never,
    periodRepo as never,
    structure as never,
    grading as never,
    calculator as never,
  );
  return { useCase };
}

describe('GetMyGradeBreakdownUseCase', () => {
  it('devuelve solo las notas del estudiante que consulta', async () => {
    const { useCase } = setup(['me', 'other']);

    const result = await useCase.execute('s1', 'p1', 'me');

    expect(result.periodGrade).toBe(9);
    expect(result.components).toEqual([
      { code: 'FORMATIVE', name: 'Formativa', weight: 70, average: 9 },
      { code: 'SUMMATIVE', name: 'Sumativa', weight: 30, average: null },
    ]);
    expect(result.activities).toEqual([
      expect.objectContaining({ id: 'a1', grade: 9 }),
      expect.objectContaining({ id: 'a2', grade: null }),
    ]);
    expect(JSON.stringify(result)).not.toContain('other');
  });

  it('no deja ver el desglose de un curso donde no está matriculado', async () => {
    const { useCase } = setup(['other']);

    await expect(useCase.execute('s1', 'p1', 'me')).rejects.toBeInstanceOf(ForbiddenException);
  });
});