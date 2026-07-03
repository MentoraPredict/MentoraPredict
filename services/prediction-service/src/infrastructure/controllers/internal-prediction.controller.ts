import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RecalculateSubjectPredictionUseCase } from '../../application/use-cases/recalculate-subject-prediction.use-case';
import { InternalServiceGuard } from '../guards/internal-service.guard';

@ApiTags('prediction-internal')
@Controller('api/v1/prediction/internal')
@UseGuards(InternalServiceGuard)
export class InternalPredictionController {
  constructor(private readonly recalculateUC: RecalculateSubjectPredictionUseCase) {}

  @Post('recalculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Internal: recalculate the per-subject prediction after a metrics/alert update' })
  recalculate(@Body() body: { studentId: string; subjectId: string; periodId: string }) {
    return this.recalculateUC.execute(body.studentId, body.subjectId, body.periodId);
  }
}
