import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISecretCipher } from '../../application/ports/output/i-secret-cipher.port';

const DEV_FALLBACK = 'dev-only-ai-settings-key-change-in-prod';

/**
 * AES-256-GCM. La clave se deriva de AI_SETTINGS_ENCRYPTION_KEY; sin ella se
 * usa JWT_SECRET y, en último caso, un valor de desarrollo (con aviso).
 * El formato guardado es iv.etiqueta.datos, todo en base64.
 */
@Injectable()
export class AesSecretCipher implements ISecretCipher {
  private readonly key: Buffer;

  constructor(config: ConfigService) {
    const logger = new Logger(AesSecretCipher.name);
    const secret =
      config.get<string>('AI_SETTINGS_ENCRYPTION_KEY') || config.get<string>('JWT_SECRET') || '';

    if (!config.get<string>('AI_SETTINGS_ENCRYPTION_KEY')) {
      logger.warn(
        'AI_SETTINGS_ENCRYPTION_KEY no está definida: la clave de OpenAI se cifra con un secreto de respaldo. Defínela en producción.',
      );
    }
    this.key = createHash('sha256').update(secret || DEV_FALLBACK).digest();
  }

  encrypt(plain: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    return [iv, cipher.getAuthTag(), data].map((part) => part.toString('base64')).join('.');
  }

  decrypt(payload: string): string {
    const [iv, tag, data] = payload.split('.').map((part) => Buffer.from(part, 'base64'));
    const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  }
}