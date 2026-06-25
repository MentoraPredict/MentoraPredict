import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { GetAuthUserUseCase } from "../../application/use-cases/get-auth-user.use-case";
import { InternalServiceGuard } from "../guards/internal-service.guard";

@ApiTags("auth-internal")
@Controller("api/v1/auth/internal/users")
@UseGuards(InternalServiceGuard)
export class InternalUsersController {
  constructor(private readonly getAuthUserUC: GetAuthUserUseCase) {}

  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.getAuthUserUC.execute(id);
  }
}
