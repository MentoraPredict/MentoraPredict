import { Body, Controller, Param, Patch, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ResolveAlertUseCase } from '../../application/use-cases/resolve-alert.use-case';
import { ResolveAlertDto } from '../../application/dtos/resolve-alert.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';

interface JwtRequest {
  user?: { sub?: string; role?: string };
}

@ApiTags('alerts')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/analytics/alerts')
export class AlertsController {
  constructor(private readonly resolveAlertUC: ResolveAlertUseCase) {}

  @Patch(':alertId/resolve')
  @Roles('TEACHER')
  @ApiOperation({ summary: "Manually resolve an alert (TEACHER owner of the alert's subject)" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: 'Teacher does not own this course' })
  @ApiResponse({ status: 404 })
  async resolve(
    @Param('alertId') alertId: string,
    @Body() dto: ResolveAlertDto,
    @Req() req: JwtRequest,
  ) {
    const teacherId = req.user?.sub;
    if (!teacherId) throw new UnauthorizedException('Missing teacher identity');
    return this.resolveAlertUC.execute(alertId, teacherId, dto.note);
  }
}
