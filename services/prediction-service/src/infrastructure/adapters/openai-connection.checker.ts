import { Injectable } from '@nestjs/common';
import {
  AiConnectionCheck,
  IAiConnectionChecker,
} from '../../application/ports/output/i-ai-connection-checker.port';

const TIMEOUT_MS = 10_000;
const MODELS_URL = 'https://api.openai.com/v1/models';

@Injectable()
export class OpenAiConnectionChecker implements IAiConnectionChecker {
  async check(apiKey: string, model: string): Promise<AiConnectionCheck> {
    const started = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      // Consultar el modelo valida la clave y el acceso sin generar texto.
      const res = await fetch(`${MODELS_URL}/${encodeURIComponent(model)}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
      });
      const latencyMs = Date.now() - started;

      if (res.ok) {
        return { ok: true, status: res.status, latencyMs, message: `Conexión correcta. El modelo «${model}» está disponible.` };
      }
      if (res.status === 401) {
        return { ok: false, status: 401, latencyMs, message: 'OpenAI rechazó la clave (401). Revisa que sea correcta y esté activa.' };
      }
      if (res.status === 403) {
        return { ok: false, status: 403, latencyMs, message: 'La clave no tiene permiso para este modelo (403).' };
      }
      if (res.status === 404) {
        return { ok: false, status: 404, latencyMs, message: `El modelo «${model}» no existe o la clave no tiene acceso a él.` };
      }
      if (res.status === 429) {
        return { ok: false, status: 429, latencyMs, message: 'OpenAI limitó las solicitudes (429). Revisa la cuota y el saldo de la cuenta.' };
      }
      return { ok: false, status: res.status, latencyMs, message: `OpenAI respondió con el código ${res.status}.` };
    } catch (err) {
      const aborted = (err as Error).name === 'AbortError';
      return {
        ok: false,
        status: null,
        latencyMs: Date.now() - started,
        message: aborted
          ? 'OpenAI no respondió a tiempo. Revisa la conexión a internet del servidor.'
          : 'No se pudo conectar con OpenAI desde el servidor.',
      };
    } finally {
      clearTimeout(timer);
    }
  }
}