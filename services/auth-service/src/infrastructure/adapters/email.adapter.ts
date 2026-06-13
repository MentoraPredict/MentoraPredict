import { Injectable, Logger } from '@nestjs/common';
import { IEmailPort } from '../../application/ports/output/i-email.port';

@Injectable()
export class EmailAdapter implements IEmailPort {
  private readonly logger = new Logger(EmailAdapter.name);

  async sendPasswordReset(email: string, token: string): Promise<void> {
    this.logger.log(`Password reset requested for ${email} — token: ${token}`);
  }
}
