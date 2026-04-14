import { useEffect, useState } from 'react';
import { bookingHistoryResponseSchema, type AuthSession, type BookingHistoryResponse } from '@zbk/shared';
import { AUTH_SESSION_STORAGE_KEY, loadAuthSessionFromApi, normalizeStoredSession } from './authSession';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787';

type MyBookingsViewProps = {
  authWorkspaceHref: string;
  bookingWorkspaceHref: string;
  fleetHref: string;
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

function formatTripTypeLabel(tripType: BookingHistoryResponse['data'][number]['tripType']) {
  return tripType === 'ROUND_TRIP' ? 'Round trip' : 'One way';
}

function formatServiceTypeLabel(serviceType: BookingHistoryResponse['data'][number]['serviceType']) {
  switch (serviceType) {
    case 'AIRPORT_TRANSFER':
      return 'Airport transfer';
    case 'TRIP':
      return 'One-way trip';
    case 'RENTAL':
      return 'Round-trip rental';
    default:
      return serviceType;
  }
}

function formatStatus(status: BookingHistoryResponse['data'][number]['status']) {
  switch (status) {
    case 'CONFIRMED':
      return 'Confirmed';
    case 'PAYMENT_FAILED':
      return 'Payment failed';
    case 'PENDING_PAYMENT':
      return 'Pending payment';
    default:
      return status;
  }
}

function persistSession(session: AuthSession | null) {
  if (session) {
    window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}

export default function MyBookingsView({ authWorkspaceHref, bookingWorkspaceHref, fleetHref }: MyBookingsViewProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [bookings, setBookings] = useState<BookingHistoryResponse | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Preparing the customer bookings route…');

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
          persistSession(loadedSession);
          setSession(loadedSession);
          setStatusMessage(`Rehydrated ${loadedSession.user.displayName} from the auth cookie.`);
          return;
        }

        if (storedSession) {
          persistSession(storedSession);
          setStatusMessage(`Validated the stored ${storedSession.user.role.toLowerCase()} session from localStorage.`);
          return;
        }

        persistSession(null);
        setStatusMessage('No active session yet. Sign in as a customer to review booking history.');
      } catch (err) {
        if (controller.signal.aborted) return;

        if (storedSession) {
          persistSession(storedSession);
          setStatusMessage(`Using the stored ${storedSession.user.role.toLowerCase()} session while the cookie bootstrap retries.`);
          return;
        }

        setError(err instanceof Error ? err.message : 'Unable to bootstrap the auth session from Workers.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSession(false);
        }
      }
    }

    bootstrapSession();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBookings(activeSession: AuthSession) {
      try {
        setIsLoadingBookings(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/customer/bookings`, {
          headers: {
            Authorization: `Bearer ${activeSession.token}`,
          },
          credentials: 'include',
          signal: controller.signal,
        });
        const payload: BookingHistoryResponse | { message?: string } = await response.json();

        if (!response.ok) {
          throw new Error((payload as { message?: string }).message || `Unable to load bookings: ${response.status}`);
        }

        setBookings(bookingHistoryResponseSchema.parse(payload));
      } catch (err) {
        if (controller.signal.aborted) return;
        setBookings(null);
        setError(err instanceof Error ? err.message : 'Unknown error loading booking history');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingBookings(false);
        }
      }
    }

    if (session?.user.role === 'CUSTOMER') {
      void loadBookings(session);
      return () => controller.abort();
    }

    setBookings(null);
    setIsLoadingBookings(false);

    return () => controller.abort();
  }, [session]);

  const isCustomer = session?.user.role === 'CUSTOMER';
  const bookingCount = bookings?.meta.total ?? 0;

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>My Bookings now has a dedicated serverless route.</h1>
        <p>
          The legacy customer bookings page is being re-created as a hash-routed React/Vite experience that boots the
          Workers auth session, loads the authenticated booking history snapshot, and keeps the user inside the new stack.
        </p>
        <div className="service-pills">
          <span className="pill">{isLoadingSession ? 'Loading session…' : session ? session.user.role : 'Not signed in'}</span>
          <span className="pill pill--muted">{isCustomer ? `${bookingCount} bookings` : 'Customer-only route'}</span>
          <a className="primary-button primary-button--inline" href={bookingWorkspaceHref}>
            Open booking workspace
          </a>
          <a className="secondary-link" href={fleetHref} style={{ minWidth: 0 }}>
            Browse fleet
          </a>
          <a className="secondary-link" href={authWorkspaceHref} style={{ minWidth: 0 }}>
            Open auth workspace
          </a>
        </div>
      </section>

      {error ? <div className="alert error">{error}</div> : null}

      <section className="card-grid">
        <article className="card">
          <div className="section-title-row">
            <div>
              <h2>Customer session</h2>
              <p className="muted">This route reuses the migrated Workers auth session shape and cookie-backed bootstrap.</p>
            </div>
          </div>

          <p className="muted">{statusMessage}</p>

          {session ? (
            <div className="auth-session-panel" style={{ marginTop: 12 }}>
              <p>
                <strong>{session.user.displayName}</strong>
              </p>
              <p className="muted">
                {session.user.role} • {session.user.email}
              </p>
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
                <p className="muted">
                  The customer session now points at the dedicated bookings route, so the auth flow lands directly on
                  the migrated “my bookings” experience.
                </p>
                <a className="primary-button primary-button--inline" href={session.primaryRoute}>
                  Open primary route
                </a>
              </div>
            </div>
          ) : (
            <div className="auth-session-panel">
              <p className="muted">Sign in with the customer demo account to unlock the authenticated booking snapshot.</p>
              <div className="auth-session-panel__cta">
                <a className="primary-button primary-button--inline" href={authWorkspaceHref}>
                  Go to auth workspace
                </a>
                <a className="secondary-link" href={bookingWorkspaceHref} style={{ minWidth: 0 }}>
                  Back to booking workspace
                </a>
              </div>
            </div>
          )}
        </article>

        <article className="card card--wide">
          <div className="section-title-row">
            <div>
              <h2>Authenticated booking history</h2>
              <p className="muted">This mirrors the legacy customer booking list, but the data now comes from the Workers API.</p>
            </div>
            <span className="pill pill--muted">{isLoadingBookings ? 'Loading…' : `${bookingCount} bookings`}</span>
          </div>

          {!isCustomer ? (
            <p className="muted">
              The bookings list is customer-only. Use the auth workspace to sign in as the customer demo account, then
              return here to review the migrated history snapshot.
            </p>
          ) : isLoadingBookings ? (
            <p className="muted">Loading authenticated booking history from the Workers API…</p>
          ) : bookings ? (
            <>
              <p className="muted">
                {bookings.message} • Pending payment: {bookings.meta.pendingPayment} • Confirmed: {bookings.meta.confirmed} • Payment failed: {bookings.meta.paymentFailed}
              </p>

              {bookings.data.length > 0 ? (
                <div className="booking-history-stack">
                  {bookings.data.map((booking) => (
                    <div key={booking.reference} className="quote-box booking-result">
                      <div>
                        <strong>
                          {booking.reference} • {booking.vehicleName}
                        </strong>
                        <p className="muted">
                          {booking.customerName} • {formatTripTypeLabel(booking.tripType)} • {formatServiceTypeLabel(booking.serviceType)}
                        </p>
                        <p className="muted">
                          {booking.startDate}
                          {booking.pickupTime ? ` • ${booking.pickupTime}` : ''}
                          {booking.tripType === 'ROUND_TRIP' && booking.endTime ? ` → ${booking.endDate} • ${booking.endTime}` : ''}
                        </p>
                        <p className="muted">
                          Pickup {booking.pickupLocation}
                          {booking.pickupNote ? ` (${booking.pickupNote})` : ''}
                          {booking.dropoffLocation ? ` → ${booking.dropoffLocation}` : ''}
                          {booking.dropoffNote ? ` (${booking.dropoffNote})` : ''}
                        </p>
                        <p className="muted">Status: {formatStatus(booking.status)}</p>
                      </div>
                      <div className="quote-box__amount">
                        <span>${booking.totalAmount.toFixed(2)}</span>
                        <small>Deposit ${booking.depositAmount.toFixed(2)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="auth-session-panel" style={{ marginTop: 12 }}>
                  <p className="muted">No authenticated bookings have been stored yet for this customer.</p>
                  <div className="auth-session-panel__cta">
                    <a className="primary-button primary-button--inline" href={bookingWorkspaceHref}>
                      Start a new booking
                    </a>
                    <a className="secondary-link" href={fleetHref} style={{ minWidth: 0 }}>
                      Browse fleet
                    </a>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </article>
      </section>
    </main>
  );
}
