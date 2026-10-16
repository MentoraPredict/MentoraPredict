import { BadRequestException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { SubmitSurveyResponseUseCase } from '../submit-survey-response.use-case';
import { ISurveyResponseRepository } from '../../ports/output/i-survey-response.repository';
import { ISurveyQuestionRepository } from '../../ports/output/i-survey-question.repository';
import { IAcademicPeriodRepository } from '../../ports/output/i-academic-period.repository';
import { IUserProfilePort } from '../../ports/output/i-user-profile.port';
import { SurveyQuestionEntity } from '../../../domain/entities/survey-question.entity';
import { AcademicPeriodEntity } from '../../../domain/entities/academic-period.entity';

const mockResponseRepo = (): jest.Mocked<ISurveyResponseRepository> => ({
  save: jest.fn().mockImplementation(async (r) => r),
  findByStudentId: jest.fn(),
});

const mockQuestionRepo = (): jest.Mocked<ISurveyQuestionRepository> => ({
  findById: jest.fn(),
  findByCode: jest.fn(),
  findActiveByCategory: jest.fn(),
  save: jest.fn(),
});

const mockPeriodRepo = (): jest.Mocked<IAcademicPeriodRepository> => ({
  findById: jest.fn(),
  findActive: jest.fn(),
  findAll: jest.fn(),
  findByCode: jest.fn(),
  findByName: jest.fn(),
  findBySchoolYear: jest.fn(),
  countActive: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  hasRecords: jest.fn(),
  delete: jest.fn(),
});

const mockUserProfilePort = (): jest.Mocked<IUserProfilePort> => ({
  getProfile: jest.fn(),
});

const makePeriod = () =>
  new AcademicPeriodEntity('period-1', '2026-A', '2026-1', '', new Date(), new Date(), 'ACTIVE', 'SEMESTER', new Date(), new Date());

const makeQuestion = (id: string) =>
  new SurveyQuestionEntity(id, `Q-${id}`, 'SOCIOECONOMIC', '¿...?', 'SINGLE_CHOICE', ['A', 'B'], true, 0);

const dto = {
  surveyCode: 'SOCIOECONOMIC',
  periodId: 'period-1',
  answers: [{ questionId: 'q-1', answerValue: 'A' }],
};

describe('SubmitSurveyResponseUseCase', () => {
  let useCase: SubmitSurveyResponseUseCase;
  let responseRepo: jest.Mocked<ISurveyResponseRepository>;
  let questionRepo: jest.Mocked<ISurveyQuestionRepository>;
  let periodRepo: jest.Mocked<IAcademicPeriodRepository>;
  let userProfilePort: jest.Mocked<IUserProfilePort>;

  beforeEach(() => {
    responseRepo = mockResponseRepo();
    questionRepo = mockQuestionRepo();
    periodRepo = mockPeriodRepo();
    userProfilePort = mockUserProfilePort();
    useCase = new SubmitSurveyResponseUseCase(responseRepo, questionRepo, periodRepo, userProfilePort);
  });

  it('submits a response when the period, questions and profile all resolve', async () => {
    periodRepo.findById.mockResolvedValue(makePeriod());
    questionRepo.findActiveByCategory.mockResolvedValue([makeQuestion('q-1')]);
    userProfilePort.getProfile.mockResolvedValue({
      id: 'student-1', firstName: 'A', lastName: 'B', email: 'a@b.com', role: 'STUDENT', status: 'ACTIVE',
    });

    const result = await useCase.execute('student-1', dto);

    expect(result.studentId).toBe('student-1');
    expect(result.answers).toEqual([{ questionId: 'q-1', answerValue: 'A' }]);
    expect(responseRepo.save).toHaveBeenCalledTimes(1);
  });

  it('throws NotFoundException when the period does not exist', async () => {
    periodRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('student-1', dto)).rejects.toThrow(NotFoundException);
    expect(responseRepo.save).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when a question does not belong to the survey', async () => {
    periodRepo.findById.mockResolvedValue(makePeriod());
    questionRepo.findActiveByCategory.mockResolvedValue([makeQuestion('other-question')]);

    await expect(useCase.execute('student-1', dto)).rejects.toThrow(BadRequestException);
    expect(responseRepo.save).not.toHaveBeenCalled();
  });

  it('throws ServiceUnavailableException when the student profile cannot be synced', async () => {
    periodRepo.findById.mockResolvedValue(makePeriod());
    questionRepo.findActiveByCategory.mockResolvedValue([makeQuestion('q-1')]);
    userProfilePort.getProfile.mockResolvedValue(null);

    await expect(useCase.execute('student-1', dto)).rejects.toThrow(ServiceUnavailableException);
    expect(responseRepo.save).not.toHaveBeenCalled();
  });
});
