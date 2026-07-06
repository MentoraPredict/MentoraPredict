import type { AuthTokens, LoginCredentials, SessionUser, UserRole } from '@/types/auth';
import { API_BASE_URL, requestJson } from '@/services/api/client';

export { API_BASE_URL };

interface JwtSessionPayload {
  sub?: string;
  email?: string;
  role?: UserRole;
}

function decodeBase64Url(input: string) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  let output = '';

  for (let block = 0, charCode = 0, idx = 0, map = chars; padded.charAt(idx | 0);) {
    const current = map.indexOf(padded.charAt(idx += 1));
    if (current === 64) break;
    block = (block << 6) + current;
    charCode += 6;
    if (charCode >= 8) {
      output += String.fromCharCode((block >> (charCode -= 8)) & 0xff);
    }
  }

  return decodeURIComponent(
    output
      .split('')
      .map((character) => `%${`00${character.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join(''),
  );
}

function decodeJwtPayload<T>(token: string): T | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    return JSON.parse(decodeBase64Url(parts[1])) as T;
  } catch {
    return null;
  }
}

function buildUserFallback(accessToken: string): SessionUser | null {
  const payload = decodeJwtPayload<JwtSessionPayload>(accessToken);

  if (!payload?.sub || !payload.email || !payload.role) {
    return null;
  }

  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    isActive: true,
    avatarUrl: null,
  };
}

export async function login(credentials: LoginCredentials) {
  const tokens = await requestJson<AuthTokens>('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  const fallbackUser = buildUserFallback(tokens.accessToken);

  try {
    const profile = await requestJson<SessionUser>('/v1/users/me', {
      tokens,
    });

    return {
      tokens,
      user: {
        ...fallbackUser,
        ...profile,
        id: profile.id || fallbackUser?.id || '',
        email: profile.email || fallbackUser?.email || credentials.email,
        role: profile.role || fallbackUser?.role || 'STUDENT',
      },
    };
  } catch {
    if (!fallbackUser) {
      throw new Error('No se pudo resolver la sesion del usuario');
    }

    return {
      tokens,
      user: fallbackUser,
    };
  }
}
