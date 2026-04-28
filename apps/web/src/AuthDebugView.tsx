import { useEffect, useState } from 'react';
import {
  authLogoutResponseSchema,
  authSessionResponseSchema,
  healthResponseSchema,
  type AuthSession,
} from '@zbk/shared';
import { AUTH_SESSION_STORAGE_KEY, loadAuthSessionFromApi, normalizeStoredSession } from './authSession';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787';

const DEMO_ACCOUNTS = {
  admin: {
    email: 'admin@zbk.local',
    password: 'Admin123!',
    label: 'Admin demo',
    loginPath: '/api/auth/login',
  },
  customer: {
    email: 'customer@zbk.local',
    password: 'Customer123!',
    label: 'Customer demo',
    loginPath: '/api/auth/customer/login',
  },
} as const;

type DebugVariant = 'login' | 'auth';

type HealthSnapshot = {
  status: 'ok' | 'error';
  service: string;
  statusCode: number | null;
  message: string;
};

type AuthDebugSnapshot = {
  legacyToken: string | null;
  legacyUserRaw: string | null;
  currentSessionRaw: string | null;
  currentSession: AuthSession | null;
  apiSession: AuthSession | null;
  apiStatus: number | null;
  health: HealthSnapshot;
};

const initialHealth: HealthSnapshot = {
  status: 'error',
  service: 'zbk-luxury-api',
  statusCode: null,
  message: 'Health check has not been run yet.',
};

const initialSnapshot: AuthDebugSnapshot = {
  legacyToken: null,
  legacyUserRaw: null,
  currentSessionRaw: null,
  currentSession: null,
  apiSession: null,
  apiStatus: null,
  health: initialHealth,
};

const LEGACY_TOKEN_KEY = 'auth-token';
const LEGACY_USER_KEY = 'admin-user';

function formatJson(value: unknown) {
  if (value === null || value === undefined) {
    return 'Not found';
  }

  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

async function loadHealthSnapshot(signal?: AbortSignal): Promise<HealthSnapshot> {
  const response = await fetch(`${API_BASE_URL}/health`, { signal });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      status: 'error',
      service: 'zbk-luxury-api',
      statusCode: response.status,
      message: `Health endpoint returned ${response.status}.`,
    };
  }

  const parsed = healthResponseSchema.parse(payload);
  return {
    status: parsed.status,
    service: parsed.service,
    statusCode: response.status,
    message: 'Workers API responded with an OK health payload.',
  };
}

function readStoredSnapshot(): Pick<AuthDebugSnapshot, 'legacyToken' | 'legacyUserRaw' | 'currentSessionRaw' | 'currentSession'> {
  if (typeof window === 'undefined') {
    return {
      legacyToken: null,
      legacyUserRaw: null,
      currentSessionRaw: null,
      currentSession: null,
    };
  }

  const legacyToken = window.localStorage.getItem(LEGACY_TOKEN_KEY);
  const legacyUserRaw = window.localStorage.getItem(LEGACY_USER_KEY);
  const currentSessionRaw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  const currentSession = normalizeStoredSession(currentSessionRaw);

  return {
    legacyToken,
    legacyUserRaw,
    currentSessionRaw,
    currentSession,
  };
}

export default function AuthDebugView({ variant }: { variant: DebugVariant }) {
  const [snapshot, setSnapshot] = useState<AuthDebugSnapshot>(initialSnapshot);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function refreshSnapshot() {
    const controller = new AbortController();
    setBusyAction(null);
    setLoading(true);
    setError(null);

    try {
      const [stored, health, apiSession] = await Promise.all([
        Promise.resolve(readStoredSnapshot()),
        loadHealthSnapshot(controller.signal),
        loadAuthSessionFromApi(API_BASE_URL, controller.signal),
      ]);

      setSnapshot({
        ...stored,
        health,
        apiSession,
        apiStatus: apiSession ? 200 : 401,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to refresh the auth debug snapshot.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshSnapshot();
  }, []);

  function persistSession(session: AuthSession | null) {
    if (typeof window === 'undefined') {
      return;
    }

    if (session) {
      window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    }
  }

  async function handleLogin(accountKey: keyof typeof DEMO_ACCOUNTS) {
    setBusyAction(`signin-${accountKey}`);
    setLoading(true);
    setError(null);
    setNote(null);

    try {
      const account = DEMO_ACCOUNTS[accountKey];
      const response = await fetch(`${API_BASE_URL}${account.loginPath}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: account.email,
          password: account.password,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error((payload as { message?: string }).message || `Login returned ${response.status}.`);
      }

      const parsed = authSessionResponseSchema.parse(payload);
      persistSession(parsed.data.session);
      setNote(parsed.message || `${account.label} signed in.`);
      await refreshSnapshot();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in with the demo account.');
    } finally {
      setBusyAction(null);
      setLoading(false);
    }
  }

  async function handleLogout() {
    setBusyAction('logout');
    setLoading(true);
    setError(null);
    setNote(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error((payload as { message?: string }).message || `Logout returned ${response.status}.`);
      }

      authLogoutResponseSchema.parse(payload);
      persistSession(null);
      setNote('The active auth session was cleared from the browser cache and Workers cookie.');
      await refreshSnapshot();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign out the active session.');
    } finally {
      setBusyAction(null);
      setLoading(false);
    }
  }

  const isAdminSession = snapshot.apiSession?.user.role === 'ADMIN' || snapshot.currentSession?.user.role === 'ADMIN';
  const title = variant === 'login' ? 'Login debug page' : 'Authentication test page';
  const subtitle =
    variant === 'login'
      ? 'This bridge mirrors the legacy test-login route while exercising the real Workers auth endpoints, session cookie, and health check.'
      : 'This bridge mirrors the legacy test-auth route while showing the normalized Workers auth session and the browser storage shim.';

  return (
    <main className="page admin-dashboard-page">
      <section className="hero admin-dashboard-hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <div className="service-pills">
          <a className="secondary-link" href="#/login/admin">
            Back to admin login
          </a>
          <a className="secondary-link" href="#/admin-test">
            Open admin auth test console
          </a>
          <button className="secondary-button admin-dashboard__refresh-button" type="button" onClick={() => void refreshSnapshot()}>
            {loading ? 'Refreshing…' : 'Refresh snapshot'}
          </button>
          <button className="secondary-button admin-dashboard__refresh-button" type="button" onClick={() => void handleLogout()}>
            {busyAction === 'logout' ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </section>

      {error ? <div className="alert error">{error}</div> : null}
      {note ? <div className="alert success">{note}</div> : null}

      <section className="card-grid admin-session-grid">
        <article className="card">
          <div className="section-title-row">
            <div>
              <h2>Legacy storage snapshot</h2>
              <p className="muted">Compatible with the old debug pages, but normalized into the new shared auth session shape.</p>
            </div>
            <span className="pill pill--muted">{snapshot.currentSession ? snapshot.currentSession.user.role : 'Signed out'}</span>
          </div>
          <div className="quote-facts">
            <div className="quote-facts__row">
              <span>Legacy auth-token</span>
              <code>{formatJson(snapshot.legacyToken)}</code>
            </div>
            <div className="quote-facts__row">
              <span>Legacy admin-user</span>
              <code>{formatJson(snapshot.legacyUserRaw)}</code>
            </div>
            <div className="quote-facts__row">
              <span>Workers session key</span>
              <code>{formatJson(snapshot.currentSessionRaw)}</code>
            </div>
          </div>
          <p className="muted">
            The current session key is the canonical browser fallback, while the legacy values remain readable for migration
            debugging.
          </p>
        </article>

        <article className="card">
          <div className="section-title-row">
            <div>
              <h2>Workers API health</h2>
              <p className="muted">Checks the live serverless API before testing auth state.</p>
            </div>
            <span className={`pill ${snapshot.health.status === 'ok' ? '' : 'pill--muted'}`}>
              {snapshot.health.status === 'ok' ? 'OK' : 'Check needed'}
            </span>
          </div>
          <div className="quote-facts">
            <div className="quote-facts__row">
              <span>Status</span>
              <strong>{snapshot.health.status === 'ok' ? 'Healthy' : 'Unavailable'}</strong>
            </div>
            <div className="quote-facts__row">
              <span>Service</span>
              <strong>{snapshot.health.service}</strong>
            </div>
            <div className="quote-facts__row">
              <span>HTTP</span>
              <strong>{snapshot.health.statusCode ?? '—'}</strong>
            </div>
          </div>
          <pre className="lookup-empty">{formatJson(snapshot.health)}</pre>
        </article>
      </section>

      <section className="card-grid admin-session-grid">
        <article className="card">
          <div className="section-title-row">
            <div>
              <h2>Session transport</h2>
              <p className="muted">Uses the same cookie-backed /api/auth/me call that the migrated admin and customer workspaces depend on.</p>
            </div>
            <span className={`pill ${isAdminSession ? '' : 'pill--muted'}`}>
              {snapshot.apiStatus ? `${snapshot.apiStatus}` : '—'}
            </span>
          </div>
          <div className="quote-facts">
            <div className="quote-facts__row">
              <span>Status</span>
              <strong>{snapshot.apiSession ? 'Session loaded' : snapshot.apiStatus === 401 ? 'Signed out' : 'Waiting'}</strong>
            </div>
            <div className="quote-facts__row">
              <span>Role</span>
              <strong>{snapshot.apiSession ? snapshot.apiSession.user.role : '—'}</strong>
            </div>
            <div className="quote-facts__row">
              <span>Primary route</span>
              <strong>{snapshot.apiSession ? snapshot.apiSession.primaryRoute : '—'}</strong>
            </div>
          </div>
          <pre className="lookup-empty">{formatJson(snapshot.apiSession ?? 'No API session returned yet.')}</pre>
        </article>

        <article className="card">
          <div className="section-title-row">
            <div>
              <h2>Demo sign-in actions</h2>
              <p className="muted">Quick buttons for the legacy admin and customer credentials now provisioned in the Workers runtime.</p>
            </div>
            <span className="pill pill--muted">{variant === 'login' ? 'Legacy test-login bridge' : 'Legacy test-auth bridge'}</span>
          </div>
          <div className="service-pills service-pills--tight">
            <button
              className="secondary-button"
              type="button"
              disabled={loading}
              onClick={() => void handleLogin('admin')}
            >
              {busyAction === 'signin-admin' ? 'Signing in admin…' : DEMO_ACCOUNTS.admin.label}
            </button>
            <button
              className="secondary-button"
              type="button"
              disabled={loading}
              onClick={() => void handleLogin('customer')}
            >
              {busyAction === 'signin-customer' ? 'Signing in customer…' : DEMO_ACCOUNTS.customer.label}
            </button>
            <a className="secondary-link" href={isAdminSession ? '#/admin' : '#/my-bookings'}>
              Open current primary route
            </a>
          </div>
          <p className="muted auth-workspace__note">
            The migrated auth flow now keeps the session token, stored browser fallback, and `/api/auth/me` response aligned so
            the legacy debug routes remain useful while the full persistence layer is still in progress.
          </p>
        </article>
      </section>

      <section className="card card--wide lookup-empty">
        <div className="section-title-row">
          <div>
            <h2>Migration notes</h2>
            <p className="muted">What this slice proves and why it stays narrow.</p>
          </div>
          <span className="pill">Auth compatibility bridge</span>
        </div>
        <ul className="detail-list">
          <li>• Exposes dedicated hash-routed replacements for the old /test-login and /test-auth pages.</li>
          <li>• Verifies the Workers health endpoint and /api/auth/me session transport from the browser.</li>
          <li>• Keeps the browser storage shim synchronized with the normalized shared auth session shape.</li>
          <li>• Reuses the live demo credentials already provisioned in the serverless auth runtime.</li>
        </ul>
      </section>
    </main>
  );
}
