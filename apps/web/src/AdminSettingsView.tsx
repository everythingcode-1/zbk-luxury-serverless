import { useEffect, useMemo, useState } from 'react';
import type { AdminDashboardResponse, AuthSession } from '@zbk/shared';
import { AUTH_SESSION_STORAGE_KEY, loadAuthSessionFromApi, normalizeStoredSession } from './authSession';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787';

function formatDateTime(value: string) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      hour12: false,
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatCapability(capability: string) {
  switch (capability) {
    case 'AUTH_WORKSPACE':
      return 'Auth workspace';
    case 'BOOKING_WORKSPACE':
      return 'Booking workspace';
    case 'PUBLIC_FLEET':
      return 'Public fleet';
    case 'ADMIN_DASHBOARD':
      return 'Admin dashboard';
    default:
      return capability;
  }
}

function SummaryCard({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <article className="admin-stat-card">
      <p className="eyebrow">{label}</p>
      <strong>{value}</strong>
      <p className="muted">{note}</p>
    </article>
  );
}

export default function AdminSettingsView() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [overview, setOverview] = useState<AdminDashboardResponse | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const storedSession = normalizeStoredSession(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY));

    if (storedSession) {
      setSession(storedSession);
    }

    async function bootstrapSession() {
      try {
        const loadedSession = await loadAuthSessionFromApi(API_BASE_URL, controller.signal);
        if (controller.signal.aborted) return;

        if (loadedSession) {
          setSession(loadedSession);
          window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(loadedSession));
          return;
        }

        if (!storedSession) {
          setSession(null);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        if (!storedSession) {
          setError(err instanceof Error ? err.message : 'Unable to bootstrap the admin session from Workers.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setSessionLoaded(true);
        }
      }
    }

    void bootstrapSession();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOverview() {
      if (!sessionLoaded) return;

      if (!session || session.user.role !== 'ADMIN') {
        setOverview(null);
        setIsLoadingOverview(false);
        return;
      }

      try {
        setIsLoadingOverview(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/admin/overview`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
          credentials: 'include',
        });
        const payload: AdminDashboardResponse | { message?: string } = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || `Admin overview failed: ${response.status}`);
        }

        setOverview(payload as AdminDashboardResponse);
      } catch (err) {
        if (controller.signal.aborted) return;
        setOverview(null);
        setError(err instanceof Error ? err.message : 'Unknown error loading admin settings');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingOverview(false);
        }
      }
    }

    loadOverview();
    return () => controller.abort();
  }, [refreshTick, session, sessionLoaded]);

  const summary = overview?.data.summary;
  const isAdmin = session?.user.role === 'ADMIN';
  const capabilityList = useMemo(() => session?.capabilities.map(formatCapability).join(', ') ?? 'No session loaded yet', [session]);

  return (
    <main className="page admin-dashboard-page">
      <section className="hero admin-dashboard-hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>Admin settings now have a Workers-safe snapshot route.</h1>
        <p>
          This slice migrates the legacy settings entry into the serverless app as a read-only summary of the current
          auth profile, session transport, and migration blockers. Full editing stays in the auth workspace for now,
          but reviewers can already inspect the new route in GitHub.
        </p>
        <div className="service-pills">
          <a className="secondary-link" href="#/admin">
            Back to dashboard
          </a>
          <a className="secondary-link" href="#/admin/vehicles">
            Vehicle management
          </a>
          <a className="secondary-link" href="#/admin/bookings">
            Booking management
          </a>
          <a className="secondary-link" href="#/auth">
            Open auth workspace
          </a>
          <button className="secondary-button admin-dashboard__refresh-button" type="button" onClick={() => setRefreshTick((tick) => tick + 1)}>
            Refresh settings
          </button>
        </div>
      </section>

      {!sessionLoaded ? <div className="card">Checking stored auth session…</div> : null}

      {sessionLoaded && !session ? (
        <div className="alert error">
          No stored auth session was found. Sign in with the admin demo account from the auth workspace to inspect the settings snapshot.
        </div>
      ) : null}

      {sessionLoaded && session && !isAdmin ? (
        <div className="alert error">
          The stored session belongs to {session.user.role}. Admin settings access requires an ADMIN session.
        </div>
      ) : null}

      {error ? <div className="alert error">{error}</div> : null}

      <section className="card-grid admin-dashboard__summary-grid">
        <SummaryCard
          label="Profile"
          value={session ? session.user.displayName : 'Signed out'}
          note={session ? `${session.user.email}${session.user.phone ? ` • ${session.user.phone}` : ''}` : 'Use the auth workspace to sign in.'}
        />
        <SummaryCard
          label="Primary route"
          value={session?.primaryRoute ?? '—'}
          note={session ? 'This mirrors the migrated route hint used by the auth/session bridge.' : 'No route hint until a session loads.'}
        />
        <SummaryCard
          label="Capabilities"
          value={session?.capabilities.length ?? '—'}
          note={capabilityList}
        />
        <SummaryCard
          label="Session status"
          value={session?.status ?? 'SIGNED_OUT'}
          note={session ? `Issued ${formatDateTime(session.issuedAt)} • Expires ${formatDateTime(session.expiresAt)}` : 'No active session was restored.'}
        />
        <SummaryCard
          label="Vehicles"
          value={summary?.totalVehicles ?? '—'}
          note={summary ? `${summary.availableVehicles} available in the current runtime snapshot` : 'Admin overview is still loading.'}
        />
        <SummaryCard
          label="Bookings"
          value={summary?.totalBookings ?? '—'}
          note={summary ? `${summary.pendingBookings} pending • ${summary.confirmedBookings} confirmed` : 'Booking snapshot comes from the shared overview endpoint.'}
        />
        <SummaryCard
          label="Support / email"
          value={summary?.contactInquiries ?? '—'}
          note="Contact intake is Workers-backed, but SMTP and account-password management remain legacy gaps."
        />
        <SummaryCard
          label="Auth transport"
          value="cookie + localStorage"
          note="The migrated session persists in an auth-token cookie and is rehydrated in the browser for the React/Vite shell."
        />
      </section>

      <section className="card-grid" style={{ marginTop: 20 }}>
        <article className="card">
          <div className="section-title-row">
            <div>
              <h2>What this settings slice covers</h2>
              <p className="muted">A compact bridge from the legacy settings page into the serverless stack.</p>
            </div>
            <span className={`pill ${isAdmin ? '' : 'pill--muted'}`}>{isAdmin ? 'ADMIN' : 'NO ADMIN SESSION'}</span>
          </div>

          <ul className="detail-list">
            <li>Inspects the current Workers auth session and normalizes the stored browser snapshot.</li>
            <li>Shows the role-based route hint and capabilities now produced by the shared auth contract.</li>
            <li>Surfaces the current admin overview counts so settings and operations stay connected.</li>
            <li>Marks the remaining legacy-only work: editable profile forms, password changes, SMTP config, and durable persistence.</li>
          </ul>
        </article>

        <article className="card">
          <div className="section-title-row">
            <div>
              <h2>Current settings snapshot</h2>
              <p className="muted">These values are safe to inspect in the browser while the durable settings backend is still pending.</p>
            </div>
          </div>

          {session ? (
            <div className="admin-session-grid">
              <div>
                <p className="muted">Display name</p>
                <strong>{session.user.displayName}</strong>
                <p className="muted">Email: {session.user.email}</p>
                <p className="muted">Role: {session.user.role}</p>
                {session.user.phone ? <p className="muted">Phone: {session.user.phone}</p> : null}
              </div>
              <ul className="detail-list">
                <li>Token: {session.token.slice(0, 12)}…</li>
                <li>Primary route: {session.primaryRoute}</li>
                <li>Capabilities: {session.capabilities.map(formatCapability).join(', ')}</li>
                <li>Last refreshed: {overview?.data.generatedAt ?? 'Waiting for overview payload'}</li>
              </ul>
            </div>
          ) : (
            <p className="muted">Sign in from the auth workspace to see the settings snapshot and route metadata.</p>
          )}
        </article>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <div className="section-title-row">
          <div>
            <h2>Remaining legacy settings work</h2>
            <p className="muted">This route is a migration bridge, not the final durable admin console.</p>
          </div>
        </div>

        <div className="service-pills service-pills--tight">
          <span className="pill pill--muted">Profile edit form</span>
          <span className="pill pill--muted">Password update</span>
          <span className="pill pill--muted">SMTP / email relay</span>
          <span className="pill pill--muted">Durable admin persistence</span>
          <span className="pill pill--muted">Server-side settings history</span>
        </div>
      </section>
    </main>
  );
}
