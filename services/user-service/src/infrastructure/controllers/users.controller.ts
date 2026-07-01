import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UpdateUserUseCase } from "../../application/use-cases/update-user.use-case";
import { SoftDeleteUserUseCase } from "../../application/use-cases/soft-delete-user.use-case";
import { ListUsersUseCase } from "../../application/use-cases/list-users.use-case";
import { UpdateUserDto } from "../../application/dtos/update-user.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../guards/roles.guard";
import { GetUserUseCase } from "../../application/use-cases/get-user.use-case";

interface AuthenticatedRequest {
  user?: {
    sub?: string;
    role?: string;
  };
}

@ApiTags("user-service")
@ApiBearerAuth("JWT")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/users")
export class UsersController {
  constructor(
    private readonly getUserUC: GetUserUseCase,
    private readonly updateUserUC: UpdateUserUseCase,
    private readonly softDeleteUserUC: SoftDeleteUserUseCase,
    private readonly listUsersUC: ListUsersUseCase,
  ) {}

  @Get()
  @Roles("ADMIN", "TEACHER")
  @ApiOperation({ summary: "List users with optional filters" })
  @ApiQuery({ name: "role", required: false })
  @ApiQuery({ name: "status", required: false })
  list(
    @Req() req: AuthenticatedRequest,
    @Query("role") role?: string,
    @Query("status") status?: string,
  ) {
    const callerRole = req.user?.role;

    if (callerRole === "TEACHER") {
      if (role && role !== "STUDENT") {
        throw new ForbiddenException("Teachers can only list students");
      }

      return this.listUsersUC.execute({
        role: "STUDENT",
        status: status ?? "ACTIVE",
      });
    }

    return this.listUsersUC.execute({ role, status });
  }

  @Get("me")
  @ApiOperation({ summary: "Get current authenticated user profile" })
  getMe(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException("Invalid authorization token");
    return this.getUserUC.execute(userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user profile by id" })
  get(@Param("id") id: string) {
    return this.getUserUC.execute(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update user profile" })
  update(
    @Param("id") id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const caller = req.user;
    if (!caller?.sub) throw new UnauthorizedException("Invalid authorization token");

    if (caller.role !== "ADMIN") {
      if (caller.sub !== id) {
        throw new ForbiddenException("Cannot edit another user's profile");
      }
      if (dto.role !== undefined || dto.status !== undefined) {
        throw new ForbiddenException("Only ADMIN can change role or status");
      }
    }

    return this.updateUserUC.execute(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Soft delete user profile (ADMIN only)" })
  @Roles("ADMIN")
  async remove(@Param("id") id: string) {
    await this.softDeleteUserUC.execute(id);
  }
}
