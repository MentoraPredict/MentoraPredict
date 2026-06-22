import {
  Controller, Get, Put, Delete, Param, Body, Query, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { GetUserUseCase } from '../../application/use-cases/get-user.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { SoftDeleteUserUseCase } from '../../application/use-cases/soft-delete-user.use-case';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { UpdateUserDto } from '../../application/dtos/update-user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('user-service')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/users')
export class UsersController {
  constructor(
    private readonly getUserUC: GetUserUseCase,
    private readonly updateUserUC: UpdateUserUseCase,
    private readonly softDeleteUserUC: SoftDeleteUserUseCase,
    private readonly listUsersUC: ListUsersUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List users with optional filters' })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'status', required: false })
  list(@Query('role') role?: string, @Query('status') status?: string) {
    return this.listUsersUC.execute({ role, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile by id' })
  get(@Param('id') id: string) {
    return this.getUserUC.execute(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user profile' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.updateUserUC.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete user profile' })
  async remove(@Param('id') id: string) {
    await this.softDeleteUserUC.execute(id);
  }
}
