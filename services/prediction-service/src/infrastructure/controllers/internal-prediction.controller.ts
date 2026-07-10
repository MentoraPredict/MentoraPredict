import { Body, Controller, HttpCode, HttpStatus, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RecalculateSubjectPredictionUseCase } from '../../application/use-cases/recalculate-subject-prediction.use-case';
import { GeneratePredictionUseCase } from '../../application/use-cases/generate-prediction.use-case';
import { GenerateSubjectPredictionUseCase } from '../../application/use-cases/generate-subject-prediction.use-case';
import { InternalServiceGuard } from '../guards/internal-service.guard';

@ApiTags('prediction-internal')
@Controller('api/v1/prediction/internal')
@UseGuards(InternalServiceGuard)
export class InternalPredictionController {
  private readonly logger = new Logger(InternalPredictionController.name);

  constructor(
    private readonly recalculateUC: RecalculateSubjectPredictionUseCase,
    private readonly generatePredictionUC: GeneratePredictionUseCase,
    private readonly generateSubjectPredictionUC: GenerateSubjectPredictionUseCase,
  ) {}

  @Post('recalculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Internal: recalculate the per-subject prediction and refresh both AI-powered ' +
      'recommendations (global and the one scoped to this subject)',
    description:
      'Triggered after a weekly check-in save or a grade/attendance change. Not subject to the ' +
      'student-facing regeneration cooldown — that cooldown only guards the manual "generate now" button.',
  })
  async recalculate(@Body() body: { studentId: string; subjectId: string; periodId: string }) {
    const subjectPrediction = await this.recalculateUC.execute(body.studentId, body.subjectId, body.periodId);

    // Fire-and-forget: keeps this endpoint responsive (the caller in
    // analytics-service doesn't await the response either) and a failed AI
    // refresh must not fail the per-subject recalculation that already
    // succeeded above. Refreshes BOTH the global (all-subjects) and the
    // subject-scoped AI recommendation — a check-in/grade change for this
    // subject is exactly what the subject-scoped one is grounded in.
    this.generatePredictionUC
      .execute(body.studentId, body.periodId)
      .catch((err) =>
        this.logger.error(
          `Global AI prediction refresh failed for student ${body.studentId}: ${err instanceof Error ? err.message : String(err)}`,
        ),
      );

    this.generateSubjectPredictionUC
      .execute(body.studentId, body.subjectId)
      .catch((err) =>
        this.logger.error(
          `Subject AI prediction refresh failed for student ${body.studentId}/${body.subjectId}: ${err instanceof Error ? err.message : String(err)}`,
        ),
      );

    return subjectPrediction;
  }
}
