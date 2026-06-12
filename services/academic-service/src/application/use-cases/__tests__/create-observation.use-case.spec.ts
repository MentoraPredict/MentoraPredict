import { CreateObservationUseCase } from '../create-observation.use-case';
import { ITeacherObservationRepository } from '../../ports/output/i-teacher-observation.repository';
import { ObservationType } from '../../../domain/entities/teacher-observation.entity';

const mockRepo = (): jest.Mocked<ITeacherObservationRepository> => ({
  save: jest.fn(),
  findByStudentId: jest.fn(),
});

describe('CreateObservationUseCase', () => {
  it('persists teacher observation', async () => {
    const repo = mockRepo();
    repo.save.mockImplementation(async (o) => o);
    const useCase = new CreateObservationUseCase(repo);

    const result = await useCase.execute({
      studentId: 'stud-1',
      teacherId: 'teach-1',
      subjectId: 'subj-1',
      type: ObservationType.ACADEMIC,
      content: 'Needs improvement in assignments',
    });

    expect(result.studentId).toBe('stud-1');
    expect(result.type).toBe(ObservationType.ACADEMIC);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });
});
