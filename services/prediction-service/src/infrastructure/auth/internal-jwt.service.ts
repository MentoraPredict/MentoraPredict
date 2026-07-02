import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class InternalJwtService {
  constructor(private readonly jwt: JwtService) {}

  createServiceToken(): string {
    return this.jwt.sign(
      { sub: 'prediction-service', scope: 'service:internal' },
      { expiresIn: '5m' },
    );
  }
}
