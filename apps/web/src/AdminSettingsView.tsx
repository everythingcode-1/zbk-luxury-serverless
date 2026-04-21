import { useEffect, useMemo, useState } from 'react';
import { authProfileUpdateResponseSchema } from '@zbk/shared';
import type {
  AdminDashboardResponse,
  AdminEmailRelaySettings,
  AdminEmailRelaySettingsResponse,
  AdminEmailRelaySettingsUpdateRequest,
  AuthSession,
} from '@zbk/shared';
import { AUTH_SESSION_STORAGE_KEY, loadAuthSessionFromApi, normalizeStoredSession } from './authSession';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787';

type RelayFormState = {
  host: string;
  port: string;
  username: string;
  password: string;
  secure: boolean;
  notifyOnBookings: boolean;
  recipientsCsv: string;
  testEmail: string;
};

type ProfileFormState = {
  displayName: string;
  phone: string;
};

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';

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

function buildRelayForm(settings: AdminEmailRelaySettings): RelayFormState {
  return {
    host: settings.host,
    port: String(settings.port),
    username: settings.username,
    password: '',
    secure: settings.secure,
    notifyOnBookings: settings.notifyOnBookings,
    recipientsCsv: settings.recipientsCsv,
    testEmail: settings.testEmail,
  };
}

function buildRelayPayload(form: RelayFormState): AdminEmailRelaySettingsUpdateRequest {
  return {
    host: form.host.trim(),
    port: Number(form.port),
    username: form.username.trim(),
    password: form.password,
    secure: form.secure,
    notifyOnBookings: form.notifyOnBookings,
    recipientsCsv: form.recipientsCsv,
    testEmail: form.testEmail.trim(),
  };
}

function buildProfileForm(session: AuthSession): ProfileFormState {
  return {
    displayName: session.user.displayName,
    phone: session.user.phone || '',
  };
}

function buildProfilePayload(form: ProfileFormState) {
  const payload: {
    displayName?: string;
    phone?: string;
  } = {};

  const displayName = form.displayName.trim();
  if (displayName) {
    payload.displayName = displayName;
  }

  const phone = form.phone.trim();
  if (phone) {
    payload.phone = phone;
  }

  return payload;
}

export default function AdminSettingsView() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [overview, setOverview] = useState<AdminDashboardResponse | null>(null);
  const [relaySettings, setRelaySettings] = useState<AdminEmailRelaySettings | null>(null);
  const [relayForm, setRelayForm] = useState<RelayFormState>({
    host: 'smtp.gmail.com',
    port: '587',
    username: '',
    password: '',
    secure: false,
    notifyOnBookings: true,
    recipientsCsv: '',
    testEmail: '',
  });
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    displayName: '',
    phone: '',
  });
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [isLoadingRelay, setIsLoadingRelay] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingRelay, setIsSavingRelay] = useState(false);
  const [isTestingRelay, setIsTestingRelay] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [relayMessage, setRelayMessage] = useState<string | null>(null);
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
    if (session) {
      setProfileForm(buildProfileForm(session));
      return;
    }

    setProfileForm({
      displayName: '',
      phone: '',
    });
  }, [session]);

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

  useEffect(() => {
    const controller = new AbortController();

    async function loadRelaySettings() {
      if (!sessionLoaded) return;

      if (!session || session.user.role !== 'ADMIN') {
        setRelaySettings(null);
        setIsLoadingRelay(false);
        return;
      }

      try {
        setIsLoadingRelay(true);
        setRelayMessage(null);

        const response = await fetch(`${API_BASE_URL}/api/admin/settings/email`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
          credentials: 'include',
        });
        const payload: AdminEmailRelaySettingsResponse | { message?: string } = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || `Email relay settings failed: ${response.status}`);
        }

        const settings = (payload as AdminEmailRelaySettingsResponse).data.settings;
        setRelaySettings(settings);
        setRelayForm(buildRelayForm(settings));
      } catch (err) {
        if (controller.signal.aborted) return;
        setRelaySettings(null);
        setError(err instanceof Error ? err.message : 'Unknown error loading email relay settings');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingRelay(false);
        }
      }
    }

    loadRelaySettings();
    return () => controller.abort();
  }, [refreshTick, session, sessionLoaded]);

  const summary = overview?.data.summary;
  const isAdmin = session?.user.role === 'ADMIN';
  const capabilityList = useMemo(() => session?.capabilities.map(formatCapability).join(', ') ?? 'No session loaded yet', [session]);
  const recipientCount = useMemo(
    () => relayForm.recipientsCsv.split(',').map((item) => item.trim()).filter(Boolean).length,
    [relayForm.recipientsCsv],
  );

  async function persistProfileSettings() {
    if (!session || !isAdmin) {
      return;
    }

    try {
      setIsSavingProfile(true);
      setProfileMessage(null);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'PATCH',
        signal: new AbortController().signal,
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(buildProfilePayload(profileForm)),
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        const responseMessage =
          typeof payload === 'object' && payload && 'message' in payload
            ? String((payload as { message?: string }).message || '')
            : '';
        throw new Error(responseMessage || 'Unable to save the admin profile.');
      }

      const responsePayload = authProfileUpdateResponseSchema.parse(payload);
      setSession(responsePayload.data.session);
      window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(responsePayload.data.session));
      setProfileForm(buildProfileForm(responsePayload.data.session));
      setProfileMessage(responsePayload.message || 'Admin profile updated.');
      setRefreshTick((tick) => tick + 1);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      setProfileMessage(null);
      setError(err instanceof Error ? err.message : 'Unable to save the admin profile.');
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function persistRelaySettings(testOnly = false) {
    if (!session || !isAdmin) {
      return;
    }

    const payload = buildRelayPayload(relayForm);
    const endpoint = testOnly ? '/api/admin/settings/email/test' : '/api/admin/settings/email';
    const actionLabel = testOnly ? 'test' : 'save';

    try {
      if (testOnly) {
        setIsTestingRelay(true);
      } else {
        setIsSavingRelay(true);
      }

      setRelayMessage(null);
      setError(null);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: testOnly ? 'POST' : 'PATCH',
        signal: new AbortController().signal,
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const responsePayload: AdminEmailRelaySettingsResponse | { message?: string } = await response.json();

      if (!response.ok) {
        throw new Error(responsePayload.message || `Unable to ${actionLabel} the email relay settings.`);
      }

      const settings = (responsePayload as AdminEmailRelaySettingsResponse).data.settings;
      setRelaySettings(settings);
      setRelayForm((current) => ({
        ...current,
        password: '',
        host: settings.host,
        port: String(settings.port),
        username: settings.username,
        secure: settings.secure,
        notifyOnBookings: settings.notifyOnBookings,
        recipientsCsv: settings.recipientsCsv,
        testEmail: settings.testEmail,
      }));
      setRelayMessage(responsePayload.message || (testOnly ? 'SMTP relay configuration test completed.' : 'SMTP relay settings saved.'));
      setRefreshTick((tick) => tick + 1);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      setRelayMessage(null);
      setError(err instanceof Error ? err.message : `Unable to ${actionLabel} the email relay settings.`);
    } finally {
      if (testOnly) {
        setIsTestingRelay(false);
      } else {
        setIsSavingRelay(false);
      }
    }
  }

  return (
    <main className="page admin-dashboard-page">
      <section className="hero admin-dashboard-hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>Admin settings now include a Workers-safe SMTP relay bridge.</h1>
        <p>
          This slice migrates the legacy email settings panel into the serverless app. The new route keeps the admin
          snapshot visible, lets reviewers edit relay configuration, and records a validation result without depending
          on the legacy Nodemailer runtime.
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
          <button
            className="secondary-button admin-dashboard__refresh-button"
            type="button"
            onClick={() => setRefreshTick((tick) => tick + 1)}
          >
            Refresh settings
          </button>
        </div>
      </section>

      {!sessionLoaded ? <div className="card">Checking stored auth session…</div> : null}

      {sessionLoaded && !session ? (
        <div className="alert error">
          No stored auth session was found. Sign in with the admin demo account from the auth workspace to inspect the
          settings snapshot.
        </div>
      ) : null}

      {sessionLoaded && session && !isAdmin ? (
        <div className="alert error">
          The stored session belongs to {session.user.role}. Admin settings access requires an ADMIN session.
        </div>
      ) : null}

      {error ? <div className="alert error">{error}</div> : null}
      {profileMessage ? <div className="alert success">{profileMessage}</div> : null}
      {relayMessage ? <div className="alert success">{relayMessage}</div> : null}

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
        <SummaryCard label="Capabilities" value={session?.capabilities.length ?? '—'} note={capabilityList} />
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
          label="SMTP relay"
          value={relaySettings?.lastTestStatus ?? 'PENDING'}
          note={relaySettings ? `${relaySettings.host}:${relaySettings.port} • last test ${formatDateTime(relaySettings.lastTestAt)}` : 'Relay settings are still loading.'}
        />
        <SummaryCard
          label="Recipients"
          value={relaySettings ? relaySettings.recipientsCsv || '—' : '—'}
          note={relaySettings ? `${recipientCount} recipient${recipientCount === 1 ? '' : 's'} in the current relay snapshot.` : 'No relay snapshot yet.'}
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
            <li>Replaces the legacy Nodemailer settings panel with a Workers-safe relay validator and snapshot store.</li>
          </ul>
        </article>

        <article className="card">
          <div className="section-title-row">
            <div>
              <h2>Current profile snapshot</h2>
              <p className="muted">This keeps the legacy profile tab visible while the dedicated password flow still lives in the auth workspace.</p>
            </div>
            <span className="pill pill--muted">{session?.user.role ?? 'SIGNED_OUT'}</span>
          </div>

          {session ? (
            <div className="admin-settings-form">
              <div className="admin-session-grid">
                <label>
                  Display name
                  <input
                    type="text"
                    value={profileForm.displayName}
                    onChange={(event) => setProfileForm((current) => ({ ...current, displayName: event.target.value }))}
                    placeholder="Operations Admin"
                  />
                </label>
                <label>
                  Email address
                  <input type="email" value={session.user.email} disabled />
                </label>
              </div>

              <div className="admin-session-grid">
                <label>
                  Phone number
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="+65 8123 4567"
                  />
                </label>
                <div>
                  <p className="muted">Security note</p>
                  <p className="muted">
                    Email and password changes remain available in the auth workspace for now, while this route updates the
                    admin profile snapshot that the Workers session carries.
                  </p>
                  <ul className="detail-list">
                    <li>Primary route: {session.primaryRoute}</li>
                    <li>Capabilities: {session.capabilities.map(formatCapability).join(', ')}</li>
                    <li>Last refreshed: {overview?.data.generatedAt ?? 'Waiting for overview payload'}</li>
                  </ul>
                </div>
              </div>

              <div className="auth-session-panel__cta" style={{ marginTop: 20, alignItems: 'center' }}>
                <button className="primary-button primary-button--inline" type="button" onClick={() => void persistProfileSettings()} disabled={isSavingProfile}>
                  {isSavingProfile ? 'Saving…' : 'Save profile changes'}
                </button>
                <a className="secondary-link" href="#/auth">
                  Open auth workspace
                </a>
              </div>
            </div>
          ) : (
            <p className="muted">Sign in from the auth workspace to update the profile snapshot and route metadata.</p>
          )}
        </article>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <div className="section-title-row">
          <div>
            <h2>Workers-safe SMTP relay settings</h2>
            <p className="muted">
              The legacy admin page used Nodemailer. This slice stores a sanitized relay snapshot, validates the form,
              and records a test result without reaching for a Node-only mailer.
            </p>
          </div>
          <span className={`pill ${relaySettings?.lastTestStatus === 'READY' ? '' : 'pill--muted'}`}>
            {relaySettings?.lastTestStatus ?? 'PENDING'}
          </span>
        </div>

        <div className="admin-session-grid" style={{ marginBottom: 20 }}>
          <div>
            <p className="muted">Last validation</p>
            <strong>{formatDateTime(relaySettings?.lastTestAt)}</strong>
            <p className="muted">{relaySettings?.lastTestMessage ?? 'No relay test has been run yet.'}</p>
          </div>
          <ul className="detail-list">
            <li>Stored at: {formatDateTime(relaySettings?.updatedAt)}</li>
            <li>Password configured: {relaySettings?.passwordConfigured ? 'Yes' : 'No'}</li>
            <li>Secure transport: {relaySettings?.secure ? 'Enabled' : 'Disabled'}</li>
            <li>Notify on bookings: {relaySettings?.notifyOnBookings ? 'Enabled' : 'Disabled'}</li>
          </ul>
        </div>

        {session ? (
          <div className="admin-settings-form">
            <div className="admin-session-grid">
              <label>
                SMTP host
                <input
                  type="text"
                  value={relayForm.host}
                  onChange={(event) => setRelayForm((current) => ({ ...current, host: event.target.value }))}
                  placeholder="smtp.gmail.com"
                />
              </label>
              <label>
                SMTP port
                <input
                  type="number"
                  value={relayForm.port}
                  onChange={(event) => setRelayForm((current) => ({ ...current, port: event.target.value }))}
                  placeholder="587"
                />
              </label>
            </div>

            <div className="admin-session-grid">
              <label>
                SMTP username
                <input
                  type="text"
                  value={relayForm.username}
                  onChange={(event) => setRelayForm((current) => ({ ...current, username: event.target.value }))}
                  placeholder="smtp-user@example.com"
                />
              </label>
              <label>
                SMTP password / app password
                <input
                  type="password"
                  value={relayForm.password}
                  onChange={(event) => setRelayForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="••••••••••••••••"
                />
              </label>
            </div>

            <div className="admin-session-grid">
              <label>
                Test email address
                <input
                  type="email"
                  value={relayForm.testEmail}
                  onChange={(event) => setRelayForm((current) => ({ ...current, testEmail: event.target.value }))}
                  placeholder="admin@zbkluxury.com"
                />
              </label>
              <label>
                Notification recipients
                <input
                  type="text"
                  value={relayForm.recipientsCsv}
                  onChange={(event) => setRelayForm((current) => ({ ...current, recipientsCsv: event.target.value }))}
                  placeholder="admin@zbkluxury.com, manager@zbkluxury.com"
                />
              </label>
            </div>

            <div className="service-pills service-pills--tight" style={{ marginTop: 12 }}>
              <label className="pill">
                <input
                  type="checkbox"
                  checked={relayForm.secure}
                  onChange={(event) => setRelayForm((current) => ({ ...current, secure: event.target.checked }))}
                />{' '}
                Use TLS / SSL
              </label>
              <label className="pill">
                <input
                  type="checkbox"
                  checked={relayForm.notifyOnBookings}
                  onChange={(event) => setRelayForm((current) => ({ ...current, notifyOnBookings: event.target.checked }))}
                />{' '}
                Send booking notifications
              </label>
            </div>

            <div className="auth-session-panel__cta" style={{ marginTop: 20, alignItems: 'center' }}>
              <button className="primary-button primary-button--inline" type="button" onClick={() => void persistRelaySettings(false)} disabled={isSavingRelay || isTestingRelay}>
                {isSavingRelay ? 'Saving…' : 'Save relay settings'}
              </button>
              <button className="secondary-button" type="button" onClick={() => void persistRelaySettings(true)} disabled={isSavingRelay || isTestingRelay}>
                {isTestingRelay ? 'Testing…' : 'Test relay settings'}
              </button>
              <p className="muted">
                A Workers-safe test stores the sanitized snapshot and marks the relay as ready without depending on the legacy mailer.
              </p>
            </div>
          </div>
        ) : (
          <p className="muted">Sign in first to edit the active admin relay settings.</p>
        )}
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <div className="section-title-row">
          <div>
            <h2>Remaining legacy settings work</h2>
            <p className="muted">This route is a migration bridge, not the final durable admin console.</p>
          </div>
        </div>

        <div className="service-pills service-pills--tight">
          <span className="pill pill--muted">Password update</span>
          <span className="pill pill--muted">Email change handoff</span>
          <span className="pill pill--muted">Durable settings persistence</span>
          <span className="pill pill--muted">Server-side settings history</span>
        </div>
      </section>
    </main>
  );
}
