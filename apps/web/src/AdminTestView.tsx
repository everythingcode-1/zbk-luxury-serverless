import { useEffect, useState } from 'react';
import type { AuthSession } from '@zbk/shared';
import { AUTH_SESSION_STORAGE_KEY, loadAuthSessionFromApi, normalizeStoredSession } from './authSession';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787';

const LEGACY_TOKEN_KEY = 'auth-token';
const LEGACY_USER_KEY = 'admin-user';

type AdminTestSnapshot = {
  legacyToken: string | null;
  legacyUserRaw: string | null;
  currentSessionRaw: string | null;
  currentSession: AuthSession | null;
  apiSession: AuthSession | null;
  apiStatus: number | null;
};

const initialSnapshot: AdminTestSnapshot = {
  legacyToken: null,
  legacyUserRaw: null,
  currentSessionRaw: null,
  currentSession: null,
  apiSession: null,
  apiStatus: null,
};

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

export default function AdminTestView() {
  const [snapshot, setSnapshot] = useState<AdminTestSnapshot>(initialSnapshot);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshSnapshot() {
    if (typeof window === 'undefined') {
      return;
    }

    setLoading(true);
    setError(null);

    const legacyToken = window.localStorage.getItem(LEGACY_TOKEN_KEY);
    const legacyUserRaw = window.localStorage.getItem(LEGACY_USER_KEY);
    const currentSessionRaw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    const currentSession = normalizeStoredSession(currentSessionRaw);

    setSnapshot((prev) => ({
      ...prev,
      legacyToken,
      legacyUserRaw,
      currentSessionRaw,
      currentSession,
    }));

    try {
      const apiSession = await loadAuthSessionFromApi(API_BASE_URL);
      setSnapshot((prev) => ({
        ...prev,
        apiSession,
        apiStatus: apiSession ? 200 : 401,
      }));
    } catch (err) {
      setSnapshot((prev) => ({
        ...prev,
        apiSession: null,
        apiStatus: null,
      }));
      setError(err instanceof Error ? err.message : 'Unable to load the admin auth test snapshot.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshSnapshot();
  }, []);

  function clearAuthState() {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(LEGACY_TOKEN_KEY);
    window.localStorage.removeItem(LEGACY_USER_KEY);
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    setSnapshot(initialSnapshot);
    setError(null);
  }

  const isAdminSession = snapshot.apiSession?.user.role === 'ADMIN' || snapshot.currentSession?.user.role === 'ADMIN';

  return (
    <main className="page admin-dashboard-page">
      <section className="hero admin-dashboard-hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>Admin auth test console</h1>
        <p>
          This small parity bridge mirrors the old legacy admin-test page while exercising the Workers auth session,
          the browser storage shim, and the migrated /api/auth/me endpoint from one reviewable screen.
        </p>
        <div className="service-pills">
          <a className="secondary-link" href="#/login/admin">
            Back to admin login
          </a>
          <a className="secondary-link" href="#/admin">
            Open admin dashboard
          </a>
          <button className="secondary-button admin-dashboard__refresh-button" type="button" onClick={() => void refreshSnapshot()}>
            {loading ? 'Refreshing…' : 'Refresh auth snapshot'}
          </button>
          <button className="secondary-button admin-dashboard__refresh-button" type="button" onClick={clearAuthState}>
            Clear stored auth
          </button>
        </div>
      </section>

      {error ? <div className="alert error">{error}</div> : null}

      <section className="card-grid admin-session-grid">
        <article className="card">
          <div className="section-title-row">
            <div>
              <h2>Browser storage snapshot</h2>
              <p className="muted">Legacy compatibility values and the normalized Workers session key.</p>
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
              <span>Current session key</span>
              <code>{formatJson(snapshot.currentSessionRaw)}</code>
            </div>
          </div>
          <p className="muted">
            The current session key stores the normalized Workers auth payload, while the legacy fields remain readable for
            migration debugging.
          </p>
        </article>

        <article className="card">
          <div className="section-title-row">
            <div>
              <h2>Workers /api/auth/me</h2>
              <p className="muted">Checks the cookie-backed session transport used by the new auth bridge.</p>
            </div>
            <span className={`pill ${isAdminSession ? '' : 'pill--muted'}`}>{snapshot.apiStatus ? `${snapshot.apiStatus}` : '—'}</span>
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
              <span>Email</span>
              <strong>{snapshot.apiSession ? snapshot.apiSession.user.email : '—'}</strong>
            </div>
          </div>
          <pre className="lookup-empty">{formatJson(snapshot.apiSession ?? 'No API session returned yet.')}</pre>
        </article>
      </section>

      <section className="card card--wide lookup-empty">
        <div className="section-title-row">
          <div>
            <h2>Migration notes</h2>
            <p className="muted">What this slice proves and why it stays narrow.</p>
          </div>
          <span className="pill">Legacy debug bridge</span>
        </div>
        <ul className="detail-list">
          <li>• Confirms the Workers auth endpoint is reachable from the Vite app.</li>
          <li>• Surfaces the stored auth session shape without requiring the full admin dashboard.</li>
          <li>• Preserves a legacy-style inspection route for troubleshooting demo credentials and cookie transport.</li>
          <li>• Provides a quick link back into the migrated admin login and dashboard flow.</li>
        </ul>
      </section>
    </main>
  );
}
