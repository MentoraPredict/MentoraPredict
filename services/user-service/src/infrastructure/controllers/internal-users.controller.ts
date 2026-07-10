import { Controller, Get, Put, Post, Param, Body, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { CreateUserProfileUseCase } from "../../application/use-cases/create-user-profile.use-case";
import { CreateUserProfileDto } from "../../application/dtos/create-user-profile.dto";
import { InternalServiceGuard } from "../guards/internal-service.guard";
import { UpdateUserProfileDto } from "../../application/dtos/update-user.dto";
import { UpdateUserUseCase } from "../../application/use-cases/update-user.use-case";
import { GetUserUseCase } from "../../application/use-cases/get-user.use-case";
import { ListUsersUseCase } from "../../application/use-cases/list-users.use-case";

@ApiTags("user-internal")
@ApiBearerAuth("JWT")
@Controller("api/v1/users/internal")
@UseGuards(InternalServiceGuard)
export class InternalUsersController {
  constructor(
    private readonly createProfileUC: CreateUserProfileUseCase,
    private readonly updateProfileUC: UpdateUserUseCase,
    private readonly getProfileUC: GetUserUseCase,
    private readonly listUsersUC: ListUsersUseCase,
  ) {}

  @Post("profiles")
  @ApiOperation({
    summary:
      "Internal: create user_profile row right after auth-service registers a user",
  })
  create(@Body() dto: CreateUserProfileDto) {
    return this.createProfileUC.execute(dto);
  }

  @Get("profiles/:id")
  @ApiOperation({ summary: "Internal: get user profile by id (role check)" })
  getProfile(@Param("id") id: string) {
    return this.getProfileUC.execute(id);
  }

  @Put("profiles/:id")
  update(@Param("id") id: string, @Body() dto: UpdateUserProfileDto) {
    return this.updateProfileUC.executeWithOptions(id, dto, {
      skipAuthSync: true,
    });
  }

  @Get("by-role")
  @ApiOperation({
    summary: "Internal: list active user ids by role (e.g. broadcasting a notification to every ADMIN)",
  })
  @ApiQuery({ name: "role", required: true })
  async listByRole(@Query("role") role: string) {
    const users = await this.listUsersUC.execute({ role, status: "ACTIVE" });
    return users.map((user) => user.id);
  }
}
