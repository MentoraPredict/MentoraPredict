import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class InternalServiceGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing service token");
    }

    const token = auth.slice(7);

    try {
      const payload = this.jwt.verify(token);

      if (payload.scope !== "service:internal") {
        throw new UnauthorizedException("Invalid scope");
      }

      return true;
    } catch {
      throw new UnauthorizedException("Invalid service token");
    }
  }
}
