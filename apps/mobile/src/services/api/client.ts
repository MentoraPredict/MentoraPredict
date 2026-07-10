import type { AuthTokens } from '@/types/auth';

type ApiEnvironment = 'local' | 'qa' | 'prod';

export const API_TARGETS: Record<ApiEnvironment, string> = {
  local: 'http://localhost:8000/api',
  qa: 'https://mentorapredictqa.programacionwebuce.net/api',
  prod: 'https://mentorapredictprod.programacionwebuce.net/api',
};

const configuredEnvironment = process.env.EXPO_PUBLIC_API_ENV as ApiEnvironment | undefined;

export const API_ENV: ApiEnvironment =
  configuredEnvironment && configuredEnvironment in API_TARGETS ? configuredEnvironment : 'local';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? API_TARGETS[API_ENV];

type QueryParams = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions extends RequestInit {
  params?: QueryParams;
  tokens?: AuthTokens;
}

function buildUrl(path: string, params?: QueryParams) {
  const url = new URL(`${API_BASE_URL}${path}`);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

export async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, tokens, ...requestOptions } = options;
  let response: Response;

  try {
    response = await fetch(buildUrl(path, params), {
      ...requestOptions,
      headers: {
        'Content-Type': 'application/json',
        ...(tokens ? { Authorization: `${tokens.tokenType} ${tokens.accessToken}` } : {}),
        ...requestOptions.headers,
      },
    });
  } catch {
    throw new Error(
      `No se pudo conectar con ${API_BASE_URL}. Verifica que Kong/backend este activo y que la URL sea accesible desde este dispositivo.`,
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = Array.isArray(body?.message)
      ? body.message.join('. ')
      : body?.message || 'No se pudo completar la solicitud';

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function unwrapArray<T>(response: T[] | { data?: T[]; items?: T[]; value?: T[] }): T[] {
  if (Array.isArray(response)) return response;
  return response.data ?? response.items ?? response.value ?? [];
}
