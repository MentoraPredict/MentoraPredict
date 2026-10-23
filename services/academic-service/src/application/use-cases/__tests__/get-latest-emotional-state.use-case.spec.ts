import { GetLatestEmotionalStateUseCase } from '../get-latest-emotional-state.use-case';
import { IWeeklyCheckInRepository } from '../../ports/output/i-weekly-check-in.repository';

const repoWith = (items: unknown[]) =>
  ({
    findByStudentSubjectPaginated: jest.fn().mockResolvedValue({ items, total: items.length }),
  }) as unknown as IWeeklyCheckInRepository;

describe('GetLatestEmotionalStateUseCase', () => {
  it('devuelve el estado emocional del registro más reciente', async () => {
    const useCase = new GetLatestEmotionalStateUseCase(
      repoWith([{ emotionalState: 'BAD', academicWeek: 7, academicYear: 2026 }]),
    );

    await expect(useCase.execute('s1', 'subj-1')).resolves.toEqual({
      emotionalState: 'BAD',
      academicWeek: 7,
      academicYear: 2026,
    });
  });

  it('devuelve null si el estudiante no tiene registros', async () => {
    const useCase = new GetLatestEmotionalStateUseCase(repoWith([]));

    await expect(useCase.execute('s1', 'subj-1')).resolves.toBeNull();
  });
});