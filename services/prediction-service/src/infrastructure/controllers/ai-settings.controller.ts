import { Body, Controller, Get, Post, Put, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  GetAiSettingsUseCase,
  GetAiUsageUseCase,
  TestAiConnectionUseCase,
  UpdateAiSettingsUseCase,
  UpdateAiSettingsInput,
} from '../../application/use-cases/ai-settings.use-cases';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';

interface JwtRequest {
  user?: { sub?: string; role?: string };
}

@ApiTags('prediction-service')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('api/v1/prediction/ai-settings')
export class AiSettingsController {
  constructor(
    private readonly getSettingsUC: GetAiSettingsUseCase,
    private readonly updateSettingsUC: UpdateAiSettingsUseCase,
    private readonly testConnectionUC: TestAiConnectionUseCase,
    private readonly getUsageUC: GetAiUsageUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Estado de la configuración de IA (la clave nunca se devuelve completa)' })
  get() {
    return this.getSettingsUC.execute();
  }

  @Put()
  @ApiOperation({ summary: 'Guarda la clave de OpenAI, el modelo y el interruptor general' })
  update(@Body() body: UpdateAiSettingsInput, @Req() req: JwtRequest) {
    const adminId = req.user?.sub;
    if (!adminId) throw new UnauthorizedException('Missing admin identity');
    return this.updateSettingsUC.execute(body ?? {}, adminId);
  }

  @Post('test')
  @ApiOperation({ summary: 'Prueba la conexión con OpenAI sin consumir tokens' })
  test(@Body() body?: { apiKey?: string; model?: string }) {
    return this.testConnectionUC.execute(body);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Uso registrado por la plataforma: llamadas y tokens' })
  usage(@Query('days') days?: string) {
    return this.getUsageUC.execute(days);
  }
}