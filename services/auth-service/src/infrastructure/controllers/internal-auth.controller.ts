import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetAuthUserUseCase } from '../../application/use-cases/get-auth-user.use-case';
import { SyncAuthUserUseCase } from '../../application/use-cases/sync-auth-user.use-case';
import { UpdateAuthUserUseCase } from '../../application/use-cases/update-user.use-case';
import { InternalServiceGuard } from '../guards/internal-service.guard';

class SyncRoleDto { role!: string; }
class SyncStatusDto { status!: string; }
class SyncProfileDto {
  email?: string;
  firstName?: string;
  lastName?: string;
}

@ApiTags('auth-internal')
@Controller('api/v1/auth/internal/users')
@UseGuards(InternalServiceGuard)
export class InternalUsersController {
  constructor(
    private readonly getAuthUserUC: GetAuthUserUseCase,
    private readonly syncAuthUserUC: SyncAuthUserUseCase,
    private readonly updateAuthUserUC: UpdateAuthUserUseCase,
  ) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.getAuthUserUC.execute(id);
  }

  @Patch(':id/role')
  async syncRole(@Param('id') id: string, @Body() dto: SyncRoleDto) {
    await this.syncAuthUserUC.execute(id, { role: dto.role });
  }

  @Patch(':id/status')
  async syncStatus(@Param('id') id: string, @Body() dto: SyncStatusDto) {
    await this.syncAuthUserUC.execute(id, { status: dto.status });
  }

  @Patch(':id/profile')
  async syncProfile(@Param('id') id: string, @Body() dto: SyncProfileDto) {
    return this.updateAuthUserUC.execute(id, dto);
  }
}
