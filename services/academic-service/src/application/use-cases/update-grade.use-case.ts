import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { GradeEntity } from '../../domain/entities/grade.entity';
import { GradeHistoryEntity } from '../../domain/entities/grade-history.entity';
import { IGradeRepository } from '../ports/output/i-grade.repository';
import { IGradeHistoryRepository } from '../ports/output/i-grade-history.repository';
import { UpdateGradeDto } from '../dtos/update-grade.dto';

@Injectable()
export class UpdateGradeUseCase {
  constructor(
    @Inject('IGradeRepository')        private readonly gradeRepo: IGradeRepository,
    @Inject('IGradeHistoryRepository') private readonly historyRepo: IGradeHistoryRepository,
  ) {}

  async execute(gradeId: string, dto: UpdateGradeDto, changedBy: string): Promise<GradeEntity> {
    const grade = await this.gradeRepo.findById(gradeId);
    if (!grade) throw new NotFoundException('Grade not found');

    if (dto.grade < 0 || dto.grade > 10) {
      throw new BadRequestException('Grade must be between 0 and 10');
    }

    const previousValue = grade.value;
    if (previousValue === dto.grade) return grade;

    const history = new GradeHistoryEntity(
      randomUUID(),
      grade.id,
      previousValue,
      dto.grade,
      changedBy,
      new Date(),
    );
    await this.historyRepo.save(history);

    grade.update(dto.grade);
    return this.gradeRepo.update(grade);
  }
}
