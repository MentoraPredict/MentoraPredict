import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from "@nestjs/swagger";
import { Request } from "express";
import { RegisterUserUseCase } from "../../application/use-cases/register-user.use-case";
import { LoginUserUseCase } from "../../application/use-cases/login-user.use-case";
import { LogoutUserUseCase } from "../../application/use-cases/logout-user.use-case";
import { RefreshTokenUseCase } from "../../application/use-cases/refresh-token.use-case";
import { ForgotPasswordUseCase } from "../../application/use-cases/forgot-password.use-case";
import { ResetPasswordUseCase } from "../../application/use-cases/reset-password.use-case";
import {
  RegisterDto,
  LoginDto,
  RefreshDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "../../application/dtos";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

@ApiTags("auth-service")
@Controller("api/v1/auth")
export class AuthController {
  constructor(
    private readonly registerUC: RegisterUserUseCase,
    private readonly loginUC: LoginUserUseCase,
    private readonly logoutUC: LogoutUserUseCase,
    private readonly refreshUC: RefreshTokenUseCase,
    private readonly forgotPasswordUC: ForgotPasswordUseCase,
    private readonly resetPasswordUC: ResetPasswordUseCase,
  ) {}

  @Post("register")
  @ApiOperation({ summary: "RF-001: Register new user" })
  @ApiResponse({ status: 201, description: "User registered successfully" })
  @ApiResponse({ status: 409, description: "Email already registered" })
  async register(@Body() dto: RegisterDto) {
    return this.registerUC.execute(dto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "RF-002: Login — returns JWT RS256 + refresh token",
  })
  @ApiResponse({ status: 200, description: "Authentication successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ip = req.ip ?? "unknown";
    return this.loginUC.execute(dto, ip);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "RF-002.4: Refresh access token" })
  async refresh(@Body() dto: RefreshDto) {
    return this.refreshUC.execute(dto);
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "RF-004: Request password reset email" })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.forgotPasswordUC.execute(dto);
    return result || { message: "If the email is registered, you will receive a reset link shortly" };
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "RF-004: Reset password with token" })
  @ApiResponse({ status: 400, description: "Invalid or expired token" })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.resetPasswordUC.execute(dto);
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "RF-003: Logout — invalidates refresh token" })
  async logout(@Body() dto: RefreshDto, @Req() req: Request) {
    const userId = (req as unknown as { user: { sub: string } }).user.sub;
    await this.logoutUC.execute(userId, dto.refreshToken);
  }
}
