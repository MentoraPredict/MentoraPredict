import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  Redirect,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
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
import { OAuthLoginUseCase } from "../../application/use-cases/oauth-login.use-case";
import { MicrosoftOAuthClient } from "../adapters/microsoft-oauth.client";
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
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly registerUC: RegisterUserUseCase,
    private readonly loginUC: LoginUserUseCase,
    private readonly logoutUC: LogoutUserUseCase,
    private readonly refreshUC: RefreshTokenUseCase,
    private readonly forgotPasswordUC: ForgotPasswordUseCase,
    private readonly resetPasswordUC: ResetPasswordUseCase,
    private readonly oauthLoginUC: OAuthLoginUseCase,
    private readonly microsoftOAuth: MicrosoftOAuthClient,
    private readonly config: ConfigService,
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
    return (
      result || {
        message:
          "If the email is registered, you will receive a reset link shortly",
      }
    );
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
  @ApiBearerAuth("JWT")
  @ApiOperation({ summary: "RF-003: Logout — invalidates refresh token" })
  async logout(@Body() dto: RefreshDto, @Req() req: Request) {
    const userId = (req as unknown as { user: { sub: string } }).user.sub;
    await this.logoutUC.execute(userId, dto.refreshToken);
  }

  @Get("microsoft")
  @Redirect()
  @ApiOperation({ summary: "Start Microsoft OAuth login" })
  microsoftLogin() {
    return { url: this.microsoftOAuth.getAuthorizationUrl(), statusCode: 302 };
  }

  @Get("microsoft/callback")
  @Redirect()
  @ApiOperation({ summary: "Microsoft OAuth callback — issues app JWTs and redirects to the SPA" })
  async microsoftCallback(
    @Req() req: Request,
    @Query("code") code?: string,
    @Query("state") state?: string,
    @Query("error") error?: string,
  ) {
    const frontendUrl = this.config.get<string>("FRONTEND_URL", "http://localhost:8000");

    if (error || !code || !state || !this.microsoftOAuth.verifyState(state)) {
      return { url: `${frontendUrl}/auth/callback?error=oauth_failed`, statusCode: 302 };
    }

    try {
      const profile = await this.microsoftOAuth.exchangeCodeForProfile(code);
      const ip = req.ip ?? "unknown";
      const tokens = await this.oauthLoginUC.execute(profile, ip);

      const params = new URLSearchParams({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: String(tokens.expiresIn),
      });

      return { url: `${frontendUrl}/auth/callback?${params.toString()}`, statusCode: 302 };
    } catch (err) {
      this.logger.error(`Microsoft OAuth callback failed: ${(err as Error).message}`);
      return { url: `${frontendUrl}/auth/callback?error=oauth_failed`, statusCode: 302 };
    }
  }
}
