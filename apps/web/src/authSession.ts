import { authSessionStateResponseSchema, authSessionSchema, normalizeAuthSession, type AuthSession } from '@zbk/shared';

export const AUTH_SESSION_STORAGE_KEY = 'zbk_auth_session';

export function normalizeStoredSession(rawValue: string | null): AuthSession | null {
  if (!rawValue) return null;

  try {
    return normalizeAuthSession(authSessionSchema.parse(JSON.parse(rawValue)));
  } catch {
    return null;
  }
}

export async function loadAuthSessionFromApi(apiBaseUrl: string, signal?: AbortSignal): Promise<AuthSession | null> {
  const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
    credentials: 'include',
    signal,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      return null;
    }

    throw new Error((payload as { message?: string }).message || `Unable to load auth session: ${response.status}`);
  }

  const parsed = authSessionStateResponseSchema.parse(payload);
  return parsed.data.session ? normalizeAuthSession(parsed.data.session) : null;
}
