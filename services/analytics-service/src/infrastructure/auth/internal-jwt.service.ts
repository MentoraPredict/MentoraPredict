import { Injectable } from '@nestjs/common';

@Injectable()
export class InternalJwtService {
  getServiceKey(): string {
    const key = process.env.INTERNAL_API_KEY;
    if (!key) throw new Error('INTERNAL_API_KEY is not set');
    return key;
  }
}
