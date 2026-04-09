import { useEffect, useMemo, useState } from 'react';
import {
  authLoginRequestSchema,
  authLogoutResponseSchema,
  authRegistrationRequestSchema,
  authRoleOptions,
  authSessionResponseSchema,
  authSessionStateResponseSchema,
  type AuthSession,
  type AuthUser,
} from '@zbk/shared';
import { AUTH_SESSION_STORAGE_KEY, normalizeStoredSession } from './authSession';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787';

const demoCredentials = {
  ADMIN: {
    email: 'admin@zbk.local',
    password: 'Admin123!',
  },
  CUSTOMER: {
    email: 'customer@zbk.local',
    password: 'Customer123!',
    displayName: 'Demo Customer',
    phone: '+62 812 3456 7890',
  },
} as const;

type AuthRole = (typeof authRoleOptions)[number];

type AuthFormState = {
  role: AuthRole;
  email: string;
  password: string;
  displayName: string;
  phone: string;
};

type PendingAction = 'login' | 'register' | 'refresh' | 'logout' | null;

const initialFormState: AuthFormState = {
  role: 'CUSTOMER',
  email: demoCredentials.CUSTOMER.email,
  password: demoCredentials.CUSTOMER.password,
  displayName: demoCredentials.CUSTOMER.displayName,
  phone: demoCredentials.CUSTOMER.phone,
};

async function parseResponse<T>(response: Response, schema: { parse: (value: unknown) => T }) {
  const payload = await response.json().catch(() => ({}));
  const parsed = schema.parse(payload);

  if (!response.ok) {
    throw new Error((payload as { message?: string }).message || 'Auth request failed.');
  }

  return parsed;
}

function SessionSummary({ session }: { session: AuthSession | null }) {
  if (!session) {
    return (
      <div className="auth-session-panel">
        <p className="muted">No active session yet. Sign in or register a customer to see the new Workers session shape.</p>
        <ul className="detail-list">
          <li>Session token: stored in browser localStorage for this scaffold</li>
          <li>Backend session store: in-memory Workers map for now</li>
          <li>Next slice: durable auth persistence and protected admin routes</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="auth-session-panel">
      <p><strong>{session.user.displayName}</strong></p>
      <p className="muted">{session.user.role} • {session.user.email}</p>
      {session.user.phone ? <p className="muted">Phone: {session.user.phone}</p> : null}
      <ul className="detail-list">
        <li>Token: {session.token.slice(0, 12)}…</li>
        <li>Status: {session.status}</li>
        <li>Issued: {session.issuedAt}</li>
        <li>Expires: {session.expiresAt}</li>
      </ul>
      {session.user.role === 'ADMIN' ? (
        <div className="auth-session-panel__cta">
          <p className="muted">Admin session detected. The new serverless admin dashboard is available now.</p>
          <a className="secondary-link" href="#/admin">
            Open admin dashboard
          </a>
        </div>
      ) : null}
    </div>
  );
}

export default function AuthWorkspace() {
  const [form, setForm] = useState<AuthFormState>(initialFormState);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Ready to exercise the migrated auth session contract.');
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const token = session?.token ?? null;

  const canRegister = form.role === 'CUSTOMER';

  const sessionUser = useMemo<AuthUser | null>(() => session?.user ?? null, [session]);

  useEffect(() => {
    const storedSession = normalizeStoredSession(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY));
    if (storedSession) {
      setSession(storedSession);
      setForm((prev) => ({
        ...prev,
        role: storedSession.user.role,
        email: storedSession.user.email,
        displayName: storedSession.user.displayName,
        phone: storedSession.user.phone || prev.phone,
      }));
      void refreshSession(storedSession.token);
    }
  }, []);

  function persistSession(nextSession: AuthSession | null) {
    setSession(nextSession);
    if (nextSession) {
      window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    } else {
      window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    }
  }

  function setDemoCredentials(role: AuthRole) {
    if (role === 'ADMIN') {
      setForm({
        role,
        email: demoCredentials.ADMIN.email,
        password: demoCredentials.ADMIN.password,
        displayName: 'Operations Admin',
        phone: '',
      });
      return;
    }

    setForm({
      role,
      email: demoCredentials.CUSTOMER.email,
      password: demoCredentials.CUSTOMER.password,
      displayName: demoCredentials.CUSTOMER.displayName,
      phone: demoCredentials.CUSTOMER.phone,
    });
  }

  async function refreshSession(nextToken = token) {
    if (!nextToken) {
      setStatusMessage('No stored token to refresh yet.');
      setError(null);
      persistSession(null);
      return;
    }

    setPendingAction('refresh');
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${nextToken}`,
        },
      });

      const payload = await parseResponse(response, authSessionStateResponseSchema);
      if (!payload.data.session) {
        persistSession(null);
        setStatusMessage(payload.message);
        return;
      }

      persistSession(payload.data.session);
      setStatusMessage(payload.message);
    } catch (err) {
      persistSession(null);
      setError(err instanceof Error ? err.message : 'Unable to refresh session.');
    } finally {
      setPendingAction(null);
    }
  }

  async function login() {
    const requestSchema = authLoginRequestSchema;
    const payload = requestSchema.parse({
      email: form.email,
      password: form.password,
    });

    setPendingAction('login');
    try {
      setError(null);
      const endpoint = form.role === 'ADMIN' ? '/api/auth/login' : '/api/auth/customer/login';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await parseResponse(response, authSessionResponseSchema);
      persistSession(result.data.session);
      setStatusMessage(result.message);
      setForm((prev) => ({
        ...prev,
        email: result.data.session.user.email,
        displayName: result.data.session.user.displayName,
        role: result.data.session.user.role,
        phone: result.data.session.user.phone || prev.phone,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setPendingAction(null);
    }
  }

  async function registerCustomer() {
    if (!canRegister) {
      setError('Customer registration is only available when the role is set to CUSTOMER.');
      return;
    }

    const payload = authRegistrationRequestSchema.parse({
      displayName: form.displayName,
      email: form.email,
      password: form.password,
      phone: form.phone || undefined,
    });

    setPendingAction('register');
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/auth/customer/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await parseResponse(response, authSessionResponseSchema);
      persistSession(result.data.session);
      setStatusMessage(result.message);
      setForm((prev) => ({
        ...prev,
        email: result.data.session.user.email,
        displayName: result.data.session.user.displayName,
        role: 'CUSTOMER',
        phone: result.data.session.user.phone || prev.phone,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to register customer.');
    } finally {
      setPendingAction(null);
    }
  }

  async function logout() {
    setPendingAction('logout');
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });

      const payload = await parseResponse(response, authLogoutResponseSchema);
      persistSession(payload.data.session);
      setStatusMessage(payload.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign out.');
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <article className="card card--wide auth-workspace">
      <div className="section-title-row">
        <div>
          <h2>Auth session workspace</h2>
          <p className="muted">
            This slice migrates legacy auth endpoints into Workers-safe login, register, me, and logout routes with a typed session envelope.
          </p>
        </div>
        <span className="pill">{sessionUser ? `${sessionUser.role} session` : 'SIGNED OUT'}</span>
      </div>

      <p className="muted auth-workspace__note">
        Demo credentials: admin <code>admin@zbk.local / Admin123!</code> or customer <code>customer@zbk.local / Customer123!</code>.
      </p>

      {error ? <div className="alert error">{error}</div> : null}
      <p className="muted auth-workspace__status">{statusMessage}</p>

      <div className="auth-workspace__grid">
        <form
          className="auth-workspace__form"
          onSubmit={(event) => {
            event.preventDefault();
            void login();
          }}
        >
          <label>
            Account type
            <select
              value={form.role}
              onChange={(event) => {
                const role = event.target.value as AuthRole;
                setDemoCredentials(role);
              }}
            >
              {authRoleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label>
            Email
            <input value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} type="email" />
          </label>

          <label>
            Password
            <input
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              type="password"
            />
          </label>

          {canRegister ? (
            <>
              <label>
                Display name
                <input
                  value={form.displayName}
                  onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))}
                  type="text"
                />
              </label>
              <label>
                Phone
                <input
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  type="text"
                />
              </label>
            </>
          ) : null}

          <div className="auth-workspace__actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => setDemoCredentials(form.role)}
              disabled={pendingAction !== null}
            >
              Load demo credentials
            </button>
            <button className="primary-button" type="submit" disabled={pendingAction === 'login'}>
              {pendingAction === 'login' ? 'Signing in…' : 'Sign in'}
            </button>
            <button className="primary-button" type="button" onClick={() => void registerCustomer()} disabled={!canRegister || pendingAction === 'register'}>
              {pendingAction === 'register' ? 'Registering…' : 'Register customer'}
            </button>
            <button className="secondary-button" type="button" onClick={() => void refreshSession()} disabled={pendingAction === 'refresh'}>
              {pendingAction === 'refresh' ? 'Refreshing…' : 'Refresh session'}
            </button>
            <button className="secondary-button" type="button" onClick={() => void logout()} disabled={pendingAction === 'logout'}>
              {pendingAction === 'logout' ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </form>

        <SessionSummary session={session} />
      </div>
    </article>
  );
}
