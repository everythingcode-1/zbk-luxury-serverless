import { useEffect, useMemo, useState } from 'react';
import {
  authLoginRequestSchema,
  authLogoutResponseSchema,
  authProfileUpdateRequestSchema,
  authProfileUpdateResponseSchema,
  authRegistrationRequestSchema,
  authRoleOptions,
  authSessionResponseSchema,
  authSessionStateResponseSchema,
  bookingHistoryResponseSchema,
  type AuthSession,
  type AuthUser,
  type BookingHistoryResponse,
} from '@zbk/shared';
import { AUTH_SESSION_STORAGE_KEY, loadAuthSessionFromApi, normalizeStoredSession } from './authSession';

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

type ProfileFormState = {
  displayName: string;
  email: string;
  phone: string;
};

type PendingAction = 'login' | 'register' | 'refresh' | 'logout' | 'save-profile' | null;

type AuthWorkspaceProps = {
  initialRole?: AuthRole;
  initialEmail?: string;
  initialPassword?: string;
  initialDisplayName?: string;
  initialPhone?: string;
  workspaceTitle?: string;
  workspaceDescription?: string;
};

function formatSessionCapability(capability: string) {
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

const initialFormState: AuthFormState = {
  role: 'CUSTOMER',
  email: demoCredentials.CUSTOMER.email,
  password: demoCredentials.CUSTOMER.password,
  displayName: demoCredentials.CUSTOMER.displayName,
  phone: demoCredentials.CUSTOMER.phone,
};

function buildInitialAuthFormState(props: AuthWorkspaceProps): AuthFormState {
  const role = props.initialRole ?? initialFormState.role;

  return {
    role,
    email: props.initialEmail ?? (role === 'ADMIN' ? demoCredentials.ADMIN.email : initialFormState.email),
    password: props.initialPassword ?? (role === 'ADMIN' ? demoCredentials.ADMIN.password : initialFormState.password),
    displayName: props.initialDisplayName ?? (role === 'ADMIN' ? 'Operations Admin' : initialFormState.displayName),
    phone: props.initialPhone ?? (role === 'ADMIN' ? '' : initialFormState.phone),
  };
}

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
        <li>Primary route: {session.primaryRoute}</li>
        <li>Capabilities: {session.capabilities.map(formatSessionCapability).join(', ')}</li>
        <li>Token: {session.token.slice(0, 12)}…</li>
        <li>Status: {session.status}</li>
        <li>Issued: {session.issuedAt}</li>
        <li>Expires: {session.expiresAt}</li>
      </ul>
      <div className="auth-session-panel__cta">
        <p className="muted">The session now carries a route hint and capability list, so the migrated app can send users to the right workspace.</p>
        <a className="primary-button primary-button--inline" href={session.primaryRoute}>
          Open primary route
        </a>
        {session.user.role === 'ADMIN' ? (
          <a className="secondary-link" href="#/admin">
            Open admin dashboard
          </a>
        ) : null}
      </div>
    </div>
  );
}

function CustomerBookingsSummary({
  session,
  bookings,
  loading,
  error,
  onRefresh,
}: {
  session: AuthSession | null;
  bookings: BookingHistoryResponse | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}) {
  if (!session) {
    return (
      <div className="auth-session-panel">
        <p className="muted">Sign in as a customer to load the Workers-authenticated booking history slice.</p>
      </div>
    );
  }

  if (session.user.role !== 'CUSTOMER') {
    return (
      <div className="auth-session-panel">
        <p className="muted">This booking history slice is customer-only; sign in with the customer demo account to review it.</p>
      </div>
    );
  }

  const count = bookings?.meta.total ?? 0;

  return (
    <div className="auth-session-panel">
      <div className="section-title-row">
        <div>
          <h3>Customer bookings snapshot</h3>
          <p className="muted">This replaces the legacy email lookup with an auth-backed Workers endpoint.</p>
        </div>
        <span className="pill pill--muted">{loading ? 'Loading…' : `${count} bookings`}</span>
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      {bookings ? (
        <>
          <p className="muted">
            {bookings.message} • Pending payment: {bookings.meta.pendingPayment} • Confirmed: {bookings.meta.confirmed} • Payment failed: {bookings.meta.paymentFailed}
          </p>
          {bookings.data.length > 0 ? (
            <div className="booking-history-stack">
              {bookings.data.slice(0, 3).map((booking) => (
                <div key={booking.id} className="quote-box booking-result">
                  <div>
                    <strong>{booking.reference} • {booking.vehicleName}</strong>
                    <p className="muted">
                      {booking.tripType} • {booking.serviceType} • {booking.status}
                    </p>
                    <p className="muted">
                      {booking.pickupLocation}
                      {booking.dropoffLocation ? ` → ${booking.dropoffLocation}` : ''}
                    </p>
                    <p className="muted">
                      Pickup {booking.startDate}{booking.pickupTime ? ` • ${booking.pickupTime}` : ''}
                    </p>
                  </div>
                  <div className="quote-box__amount">
                    <span>${booking.totalAmount.toFixed(2)}</span>
                    <small>Deposit ${booking.depositAmount.toFixed(2)}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No authenticated bookings have been stored yet for this customer.</p>
          )}
        </>
      ) : (
        <p className="muted">{loading ? 'Loading authenticated booking history from the Workers API…' : 'Press refresh to load the booking history snapshot.'}</p>
      )}

      <div className="auth-session-panel__cta">
        <button className="secondary-button" type="button" onClick={onRefresh} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh customer bookings'}
        </button>
        <a className="primary-button primary-button--inline" href="#/booking">
          Open booking workspace
        </a>
      </div>
    </div>
  );
}

export default function AuthWorkspace(props: AuthWorkspaceProps = {}) {
  const [form, setForm] = useState<AuthFormState>(() => buildInitialAuthFormState(props));
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormState>(() => {
    const initialForm = buildInitialAuthFormState(props);
    return {
      displayName: initialForm.displayName,
      email: initialForm.email,
      phone: initialForm.phone,
    };
  });
  const [statusMessage, setStatusMessage] = useState<string>(
    props.workspaceDescription || 'Ready to exercise the migrated auth session contract.',
  );
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const token = session?.token ?? null;

  const canRegister = form.role === 'CUSTOMER';

  const sessionUser = useMemo<AuthUser | null>(() => session?.user ?? null, [session]);
  const [customerBookings, setCustomerBookings] = useState<BookingHistoryResponse | null>(null);
  const [customerBookingsError, setCustomerBookingsError] = useState<string | null>(null);
  const [isLoadingCustomerBookings, setIsLoadingCustomerBookings] = useState(false);

  useEffect(() => {
    const storedSession = normalizeStoredSession(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY));
    const controller = new AbortController();

    if (storedSession) {
      setSession(storedSession);
      setForm((prev) => ({
        ...prev,
        role: storedSession.user.role,
        email: storedSession.user.email,
        displayName: storedSession.user.displayName,
        phone: storedSession.user.phone || prev.phone,
      }));
    }

    async function bootstrapSession() {
      try {
        const loadedSession = await loadAuthSessionFromApi(API_BASE_URL, controller.signal);
        if (controller.signal.aborted) return;

        if (loadedSession) {
          persistSession(loadedSession);
          setForm((prev) => ({
            ...prev,
            role: loadedSession.user.role,
            email: loadedSession.user.email,
            displayName: loadedSession.user.displayName,
            phone: loadedSession.user.phone || prev.phone,
          }));
          setStatusMessage(`Rehydrated ${loadedSession.user.displayName} from the auth cookie.`);
          return;
        }

        if (storedSession) {
          persistSession(storedSession);
          setStatusMessage(`Validated the stored ${storedSession.user.role.toLowerCase()} session from localStorage.`);
          return;
        }

        persistSession(null);
        setStatusMessage('No active session yet. Sign in or register a customer to see the new Workers session shape.');
      } catch (err) {
        if (controller.signal.aborted) return;

        if (storedSession) {
          persistSession(storedSession);
          setStatusMessage(`Using the stored ${storedSession.user.role.toLowerCase()} session while the cookie bootstrap retries.`);
          return;
        }

        setError(err instanceof Error ? err.message : 'Unable to bootstrap the auth session from Workers.');
      }
    }

    void bootstrapSession();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!session) {
      setProfileForm({
        displayName: initialFormState.displayName,
        email: initialFormState.email,
        phone: initialFormState.phone,
      });
      return;
    }

    setProfileForm({
      displayName: session.user.displayName,
      email: session.user.email,
      phone: session.user.phone || '',
    });
  }, [session]);

  useEffect(() => {
    const controller = new AbortController();

    void refreshCustomerBookings(controller.signal);
    return () => controller.abort();
  }, [session, token]);

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
    setPendingAction('refresh');
    try {
      setError(null);

      if (!nextToken) {
        const cookieSession = await loadAuthSessionFromApi(API_BASE_URL);
        if (!cookieSession) {
          persistSession(null);
          setStatusMessage('No stored token or auth cookie is active yet.');
          return;
        }

        persistSession(cookieSession);
        setStatusMessage(`Rehydrated ${cookieSession.user.displayName} from the auth cookie.`);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${nextToken}`,
        },
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
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

  async function updateProfile() {
    if (!session) {
      setError('Sign in before updating the profile.');
      return;
    }

    const payload = authProfileUpdateRequestSchema.parse({
      displayName: profileForm.displayName,
      email: profileForm.email,
      phone: profileForm.phone || undefined,
    });

    setPendingAction('save-profile');
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const result = await parseResponse(response, authProfileUpdateResponseSchema);
      persistSession(result.data.session);
      setStatusMessage(result.message);
      setForm((prev) => ({
        ...prev,
        email: result.data.session.user.email,
        displayName: result.data.session.user.displayName,
        phone: result.data.session.user.phone || prev.phone,
      }));
      setProfileForm({
        displayName: result.data.session.user.displayName,
        email: result.data.session.user.email,
        phone: result.data.session.user.phone || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update the profile.');
    } finally {
      setPendingAction(null);
    }
  }

  async function refreshCustomerBookings(signal?: AbortSignal) {
    if (!session || session.user.role !== 'CUSTOMER' || !token) {
      setCustomerBookings(null);
      setCustomerBookingsError(null);
      setIsLoadingCustomerBookings(false);
      return;
    }

    try {
      setIsLoadingCustomerBookings(true);
      setCustomerBookingsError(null);

      const response = await fetch(`${API_BASE_URL}/api/customer/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        signal,
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error((payload as { message?: string }).message || 'Unable to load customer bookings.');
      }

      const parsed = bookingHistoryResponseSchema.parse(payload);
      if (signal?.aborted) return;

      setCustomerBookings(parsed);
    } catch (err) {
      if (signal?.aborted) return;

      setCustomerBookings(null);
      setCustomerBookingsError(err instanceof Error ? err.message : 'Unable to load customer bookings.');
    } finally {
      if (!signal?.aborted) {
        setIsLoadingCustomerBookings(false);
      }
    }
  }

  return (
    <article className="card card--wide auth-workspace">
      <div className="section-title-row">
        <div>
          <h2>{props.workspaceTitle || 'Auth session workspace'}</h2>
          <p className="muted">
            {props.workspaceDescription ||
              'This slice migrates legacy auth endpoints into Workers-safe login, register, me, and logout routes with a typed session envelope.'}
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

      <section className="auth-session-panel auth-profile-panel" style={{ marginTop: 20 }}>
        <div className="section-title-row">
          <div>
            <h3>Profile management</h3>
            <p className="muted">
              This Workers-safe PATCH route updates the session shape in place so the migrated app can change profile details without leaving the serverless stack.
            </p>
          </div>
          <span className="pill pill--muted">{session ? session.user.role : 'SIGNED OUT'}</span>
        </div>

        {session ? (
          <div className="auth-workspace__form" style={{ maxWidth: 560 }}>
            <label>
              Display name
              <input
                value={profileForm.displayName}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, displayName: event.target.value }))}
                type="text"
              />
            </label>

            <label>
              Email
              <input
                value={profileForm.email}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
                type="email"
              />
            </label>

            <label>
              Phone
              <input
                value={profileForm.phone}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))}
                type="text"
              />
            </label>

            <div className="auth-session-panel__cta">
              <button className="primary-button primary-button--inline" type="button" onClick={() => void updateProfile()} disabled={pendingAction === 'save-profile'}>
                {pendingAction === 'save-profile' ? 'Saving…' : 'Save profile update'}
              </button>
              <p className="muted">
                Session primary route: {session.primaryRoute} • Capabilities: {session.capabilities.join(', ')}
              </p>
            </div>
          </div>
        ) : (
          <p className="muted">Sign in first to edit the active auth session profile.</p>
        )}
      </section>

      <CustomerBookingsSummary
        bookings={customerBookings}
        error={customerBookingsError}
        loading={isLoadingCustomerBookings}
        onRefresh={() => void refreshCustomerBookings()}
        session={session}
      />
    </article>
  );
}
