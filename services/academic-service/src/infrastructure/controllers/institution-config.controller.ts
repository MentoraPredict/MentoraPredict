import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetInstitutionConfigUseCase,
  UpdateAttendanceRuleUseCase,
  UpdateGradingScaleUseCase,
  UpdateInstitutionLevelsUseCase,
  UpdateInstitutionUseCase,
  UpdatePromotionRulesUseCase,
} from '../../application/use-cases/institution-config.use-cases';
import {
  UpdateAttendanceRuleDto,
  UpdateGradingScaleDto,
  UpdateInstitutionDto,
  UpdateInstitutionLevelsDto,
  UpdatePromotionRulesDto,
} from '../../application/dtos/institution-config.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';

@ApiTags('institution-config')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/academic/institution')
export class InstitutionConfigController {
  constructor(
    private readonly getConfigUC: GetInstitutionConfigUseCase,
    private readonly updateInstitutionUC: UpdateInstitutionUseCase,
    private readonly updateLevelsUC: UpdateInstitutionLevelsUseCase,
    private readonly updateScaleUC: UpdateGradingScaleUseCase,
    private readonly updateAttendanceUC: UpdateAttendanceRuleUseCase,
    private readonly updatePromotionUC: UpdatePromotionRulesUseCase,
  ) {}

  @Get('config')
  @ApiOperation({
    summary:
      'Full institutional configuration (institution, levels, grading scale, attendance and promotion rules)',
  })
  @ApiResponse({ status: 200 })
  async getConfig() {
    return this.getConfigUC.execute();
  }

  @Put()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update institution profile (ADMIN only)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400 })
  async updateInstitution(@Body() dto: UpdateInstitutionDto) {
    return this.updateInstitutionUC.execute(dto);
  }

  @Put('levels')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Set the education levels and shifts offered (ADMIN only)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400 })
  async updateLevels(@Body() dto: UpdateInstitutionLevelsDto) {
    return this.updateLevelsUC.execute(dto);
  }

  @Put('grading-scale')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update the grading scale and qualitative bands (ADMIN only)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400 })
  async updateGradingScale(@Body() dto: UpdateGradingScaleDto) {
    return this.updateScaleUC.execute(dto);
  }

  @Put('attendance-rule')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update the attendance rule (ADMIN only)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400 })
  async updateAttendanceRule(@Body() dto: UpdateAttendanceRuleDto) {
    return this.updateAttendanceUC.execute(dto);
  }

  @Put('promotion-rules')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update promotion rules per education level (ADMIN only)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400 })
  async updatePromotionRules(@Body() dto: UpdatePromotionRulesDto) {
    return this.updatePromotionUC.execute(dto);
  }
}
