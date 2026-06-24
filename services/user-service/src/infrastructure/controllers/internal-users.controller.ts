import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserProfileUseCase } from '../../application/use-cases/create-user-profile.use-case';
import { CreateUserProfileDto } from '../../application/dtos/create-user-profile.dto';
import { InternalServiceGuard } from '../guards/internal-service.guard';

@ApiTags('user-internal')
@ApiBearerAuth('JWT')
@Controller('api/v1/users/internal')
@UseGuards(InternalServiceGuard)
export class InternalUsersController {
  constructor(private readonly createProfileUC: CreateUserProfileUseCase) {}

  @Post('profiles')
  @ApiOperation({ summary: 'Internal: create user_profile row right after auth-service registers a user' })
  create(@Body() dto: CreateUserProfileDto) {
    return this.createProfileUC.execute(dto);
  }
}
