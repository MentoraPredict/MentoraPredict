import { Controller, Put, Post, Param, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { CreateUserProfileUseCase } from "../../application/use-cases/create-user-profile.use-case";
import { CreateUserProfileDto } from "../../application/dtos/create-user-profile.dto";
import { InternalServiceGuard } from "../guards/internal-service.guard";
import { UpdateUserProfileDto } from "../../application/dtos/update-user.dto";
import { UpdateUserUseCase } from "../../application/use-cases/update-user.use-case";

@ApiTags("user-internal")
@ApiBearerAuth("JWT")
@Controller("api/v1/users/internal")
@UseGuards(InternalServiceGuard)
export class InternalUsersController {
  constructor(
    private readonly createProfileUC: CreateUserProfileUseCase,
    private readonly updateProfileUC: UpdateUserUseCase,
  ) {}

  @Post("profiles")
  @ApiOperation({
    summary:
      "Internal: create user_profile row right after auth-service registers a user",
  })
  create(@Body() dto: CreateUserProfileDto) {
    return this.createProfileUC.execute(dto);
  }

  @Put("profiles/:id")
  update(@Param("id") id: string, @Body() dto: UpdateUserProfileDto) {
    return this.updateProfileUC.execute(id, dto);
  }
}
