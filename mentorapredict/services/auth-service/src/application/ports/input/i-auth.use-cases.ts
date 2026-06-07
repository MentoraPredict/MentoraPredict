import { RegisterDto, LoginDto, RefreshDto, ResetPasswordDto } from '../../dtos';

export interface IRegisterUseCase {
  execute(dto: RegisterDto): Promise<{ id: string; email: string; role: string; createdAt: Date }>;
}
export interface ILoginUseCase {
  execute(dto: LoginDto, ip: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number; tokenType: string }>;
}
export interface ILogoutUseCase {
  execute(userId: string, refreshToken: string): Promise<void>;
}
export interface IRefreshUseCase {
  execute(dto: RefreshDto): Promise<{ accessToken: string; expiresIn: number }>;
}
export interface IResetPasswordUseCase {
  execute(dto: ResetPasswordDto): Promise<void>;
}
