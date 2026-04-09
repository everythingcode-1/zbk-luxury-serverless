import { authSessionSchema, normalizeAuthSession, type AuthSession } from '@zbk/shared';

export const AUTH_SESSION_STORAGE_KEY = 'zbk-auth-session';

export function normalizeStoredSession(rawValue: string | null): AuthSession | null {
  if (!rawValue) return null;

  try {
    return normalizeAuthSession(authSessionSchema.parse(JSON.parse(rawValue)));
  } catch {
    return null;
  }
}
