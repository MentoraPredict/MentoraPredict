import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GeneratePredictionUseCase } from '../../application/use-cases/generate-prediction.use-case';
import { GetPredictionHistoryUseCase } from '../../application/use-cases/get-prediction-history.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('prediction-service')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/prediction')
export class PredictionController {
  constructor(
    private readonly generatePredictionUC: GeneratePredictionUseCase,
    private readonly getHistoryUC: GetPredictionHistoryUseCase,
  ) {}

  @Get('students/:studentId/periods/:periodId')
  @ApiOperation({
    summary: 'Generate a risk prediction + AI recommendations for a student in a period',
    description:
      'Risk is computed deterministically by analytics-service. OpenAI is used only to ' +
      'produce the natural-language summary and the actionable recommendation plan.',
  })
  generate(@Param('studentId') studentId: string, @Param('periodId') periodId: string) {
    return this.generatePredictionUC.execute(studentId, periodId);
  }

  @Get('students/:studentId/history')
  @ApiOperation({ summary: 'List past predictions generated for a student' })
  @ApiQuery({ name: 'limit', required: false })
  history(@Param('studentId') studentId: string, @Query('limit') limit?: string) {
    return this.getHistoryUC.execute(studentId, limit ? parseInt(limit, 10) : undefined);
  }
}
