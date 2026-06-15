import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IPasswordHasher } from '../../application/ports/output/i-password.hasher';

const SALT_ROUNDS = 12; // RNF-002

@Injectable()
export class BcryptAdapter implements IPasswordHasher {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
