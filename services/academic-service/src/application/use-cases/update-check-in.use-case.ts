import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IWeeklyCheckInRepository } from '../ports/output/i-weekly-check-in.repository';
import { WeeklyCheckInEntity } from '../../domain/entities/weekly-check-in.entity';
import { UpdateCheckInDto } from '../dtos/update-check-in.dto';

@Injectable()
export class UpdateCheckInUseCase {
  constructor(
    @Inject('IWeeklyCheckInRepository') private readonly checkInRepo: IWeeklyCheckInRepository,
  ) {}

  async execute(
    checkInId: string,
    studentId: string,
    dto: UpdateCheckInDto,
  ): Promise<WeeklyCheckInEntity> {
    const checkIn = await this.checkInRepo.findById(checkInId);
    if (!checkIn) throw new NotFoundException('Check-in no encontrado');
    if (checkIn.studentId !== studentId) {
      throw new ForbiddenException('No puedes editar el check-in de otro estudiante');
    }

    checkIn.applyPartialUpdate({
      attendance: dto.attendance,
      taskCompletion: dto.taskCompletion,
      studyHours: dto.studyHours,
      emotionalState: dto.emotionalState,
      generalComprehension: dto.generalComprehension,
      topicResponses: dto.topicResponses,
      notes: dto.notes,
    });

    return this.checkInRepo.update(checkIn);
  }
}
