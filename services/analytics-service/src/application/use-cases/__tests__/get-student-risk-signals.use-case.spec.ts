import { ForbiddenException } from '@nestjs/common';
import { GetStudentRiskSignalsUseCase } from '../get-student-risk-signals.use-case';
import { IAcademicServiceClient } from '../../../domain/ports/i-academic-service.client';
import { IStudentSignalsClient } from '../../../domain/ports/i-student-signals.client';

const setup = (isOwner = true) => {
  const academic = {
    getSubjectOwnership: jest.fn().mockResolvedValue({ isOwner }),
  } as unknown as jest.Mocked<IAcademicServiceClient>;
  const signals: jest.Mocked<IStudentSignalsClient> = {
    getEmotionalState: jest
      .fn()
      .mockResolvedValue({ emotionalState: 'BAD', academicWeek: 3, academicYear: 2026 }),
    getLoginActivity: jest
      .fn()
      .mockResolvedValue({ lastLoginAt: '2026-10-17T08:00:00.000Z', loginCountLast30Days: 6 }),
  };

  return { academic, signals, useCase: new GetStudentRiskSignalsUseCase(academic, signals) };
};

describe('GetStudentRiskSignalsUseCase', () => {
  it('devuelve el estado emocional y la actividad de ingresos al docente dueño del curso', async () => {
    const { useCase, academic } = setup();

    const result = await useCase.execute('subj-1', 'student-1', 'teacher-1', 'TEACHER');

    expect(result.emotional?.emotionalState).toBe('BAD');
    expect(result.loginActivity?.loginCountLast30Days).toBe(6);
    expect(academic.getSubjectOwnership).toHaveBeenCalledWith('teacher-1', 'subj-1', undefined);
  });

  it('rechaza a un docente que no es dueño del curso', async () => {
    const { useCase, signals } = setup(false);

    await expect(
      useCase.execute('subj-1', 'student-1', 'teacher-2', 'TEACHER'),
    ).rejects.toThrow(ForbiddenException);
    expect(signals.getLoginActivity).not.toHaveBeenCalled();
  });

  it('un administrador no necesita ser dueño', async () => {
    const { useCase, academic } = setup(false);

    await useCase.execute('subj-1', 'student-1', 'admin-1', 'ADMIN');

    expect(academic.getSubjectOwnership).not.toHaveBeenCalled();
  });

  it('devuelve null en la señal que falla sin romper la otra', async () => {
    const { useCase, signals } = setup();
    signals.getLoginActivity.mockRejectedValue(new Error('auth down'));

    const result = await useCase.execute('subj-1', 'student-1', 'teacher-1', 'TEACHER');

    expect(result.loginActivity).toBeNull();
    expect(result.emotional).not.toBeNull();
  });
});