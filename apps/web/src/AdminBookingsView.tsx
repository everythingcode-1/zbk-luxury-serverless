import { useEffect, useMemo, useState } from 'react';
import type { AuthSession, BookingHistoryResponse, BookingRecord } from '@zbk/shared';
import { AUTH_SESSION_STORAGE_KEY, loadAuthSessionFromApi, normalizeStoredSession } from './authSession';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTripTypeLabel(tripType: BookingRecord['tripType']) {
  return tripType === 'ROUND_TRIP' ? 'Round trip' : 'One way';
}

function formatServiceTypeLabel(serviceType: BookingRecord['serviceType']) {
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

function StatCard({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <article className="admin-stat-card">
      <p className="eyebrow">{label}</p>
      <strong>{value}</strong>
      <p className="muted">{note}</p>
    </article>
  );
}

function BookingStatusPill({ status }: { status: BookingRecord['status'] }) {
  const className =
    status === 'CONFIRMED' ? '' : status === 'PENDING_PAYMENT' ? 'pill--muted' : status === 'PAYMENT_FAILED' ? 'pill--muted' : 'pill--muted';

  return <span className={`pill ${className}`.trim()}>{status}</span>;
}

function PaymentStatusPill({ status }: { status?: string }) {
  return <span className={`pill ${status === 'CONFIRMED' ? '' : 'pill--muted'}`}>{status || '—'}</span>;
}

export default function AdminBookingsView() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [history, setHistory] = useState<BookingHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [selectedReference, setSelectedReference] = useState<string | null>(null);

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

    async function loadBookings() {
      if (!sessionLoaded) return;

      if (!session || session.user.role !== 'ADMIN') {
        setHistory(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
          credentials: 'include',
        });
        const payload: BookingHistoryResponse | { message?: string } = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || `Admin bookings failed: ${response.status}`);
        }

        setHistory(payload as BookingHistoryResponse);
      } catch (err) {
        if (controller.signal.aborted) return;
        setHistory(null);
        setError(err instanceof Error ? err.message : 'Unknown error loading admin bookings');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadBookings();
    return () => controller.abort();
  }, [refreshTick, session, sessionLoaded]);

  const bookings = useMemo(
    () => [...(history?.data ?? [])].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
    [history],
  );

  const selectedBooking = useMemo(() => {
    if (!bookings.length) return null;
    return bookings.find((booking) => booking.reference === selectedReference) || bookings[0];
  }, [bookings, selectedReference]);

  useEffect(() => {
    if (!selectedBooking) {
      setSelectedReference(null);
      return;
    }

    setSelectedReference((current) => (current ? current : selectedBooking.reference));
  }, [selectedBooking]);

  const summary = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((booking) => booking.status === 'CONFIRMED').length;
    const pending = bookings.filter((booking) => booking.status === 'PENDING_PAYMENT').length;
    const paymentFailed = bookings.filter((booking) => booking.status === 'PAYMENT_FAILED').length;
    const totalValue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const pendingDepositValue = bookings
      .filter((booking) => booking.status !== 'CONFIRMED')
      .reduce((sum, booking) => sum + booking.depositAmount, 0);

    return { total, confirmed, pending, paymentFailed, totalValue, pendingDepositValue };
  }, [bookings]);

  const isAdmin = session?.user.role === 'ADMIN';

  return (
    <main className="page admin-dashboard-page">
      <section className="hero admin-dashboard-hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>Booking management now has a Workers-backed read-only roster.</h1>
        <p>
          This slice mirrors the legacy admin booking management surface with a serverless snapshot of recent booking
          records, payment states, and pickup details. It stays inspection-first while CRUD remains out of scope.
        </p>
        <div className="service-pills">
          <a className="secondary-link" href="#/admin">
            Back to dashboard
          </a>
          <a className="secondary-link" href="#/admin/vehicles">
            Vehicle management
          </a>
          <a className="secondary-link" href="#/booking">
            Open booking workspace
          </a>
          <button
            className="secondary-button admin-dashboard__refresh-button"
            type="button"
            onClick={() => setRefreshTick((tick) => tick + 1)}
          >
            Refresh bookings
          </button>
        </div>
      </section>

      {!sessionLoaded ? <div className="card">Checking stored auth session…</div> : null}

      {sessionLoaded && !session ? (
        <div className="alert error">
          No stored auth session was found. Sign in with the admin demo account from the auth workspace to open the booking snapshot.
        </div>
      ) : null}

      {sessionLoaded && session && !isAdmin ? (
        <div className="alert error">
          The stored session belongs to {session.user.role}. Booking management access requires an ADMIN session.
        </div>
      ) : null}

      {error ? <div className="alert error">{error}</div> : null}

      <section className="card-grid admin-dashboard__summary-grid">
        <StatCard
          label="Auth session"
          value={session ? session.user.displayName : 'Signed out'}
          note={session ? `${session.user.role} • ${session.user.email}` : 'Sign in to inspect the booking roster.'}
        />
        <StatCard
          label="Bookings"
          value={history?.meta.total ?? '—'}
          note={history ? `${summary.confirmed} confirmed • ${summary.pending} pending` : 'Loaded from the Workers booking memory snapshot.'}
        />
        <StatCard
          label="Payment states"
          value={history ? `${summary.paymentFailed} failed` : '—'}
          note={history ? `${summary.pending} waiting on checkout • ${summary.confirmed} already confirmed` : 'Useful for tracking Stripe migration progress.'}
        />
        <StatCard
          label="Booking value"
          value={history ? formatCurrency(summary.totalValue) : '—'}
          note={history ? `${formatCurrency(summary.pendingDepositValue)} pending deposits` : 'The admin bookings snapshot is still loading.'}
        />
        <StatCard
          label="Latest update"
          value={selectedBooking ? formatDateTime(selectedBooking.createdAt) : '—'}
          note={selectedBooking ? `Selected: ${selectedBooking.reference}` : 'Pick a booking below to inspect its details.'}
        />
        <StatCard
          label="Source"
          value={history ? 'Workers memory' : '—'}
          note={history ? history.message : 'Fetched from the admin bookings endpoint.'}
        />
      </section>

      <section className="card-grid" style={{ marginTop: 20 }}>
        <article className="card card--wide">
          <div className="section-title-row">
            <div>
              <h2>Selected booking details</h2>
              <p className="muted">A read-only detail pane keeps the most important booking metadata visible for reviewers.</p>
            </div>
            <span className="pill pill--muted">{selectedBooking ? selectedBooking.status : 'No booking selected'}</span>
          </div>

          {selectedBooking ? (
            <div className="booking-result quote-box quote-box--success" style={{ marginTop: 12 }}>
              <div>
                <strong>
                  {selectedBooking.reference} • {selectedBooking.customerName}
                </strong>
                <p className="muted">
                  {selectedBooking.vehicleName} • {formatTripTypeLabel(selectedBooking.tripType)} •{' '}
                  {formatServiceTypeLabel(selectedBooking.serviceType)}
                </p>
                <p className="muted">
                  {selectedBooking.customerEmail} • {selectedBooking.customerPhone}
                </p>
                <p className="muted">
                  {selectedBooking.startDate}
                  {selectedBooking.pickupTime ? ` • ${selectedBooking.pickupTime}` : ''}
                  {selectedBooking.tripType === 'ROUND_TRIP' && selectedBooking.endTime
                    ? ` → ${selectedBooking.endDate} • ${selectedBooking.endTime}`
                    : ''}
                </p>
                <p className="muted">
                  Pickup {selectedBooking.pickupLocation}
                  {selectedBooking.pickupNote ? ` (${selectedBooking.pickupNote})` : ''}
                  {selectedBooking.dropoffLocation ? ` → ${selectedBooking.dropoffLocation}` : ''}
                  {selectedBooking.dropoffNote ? ` (${selectedBooking.dropoffNote})` : ''}
                </p>
                <p className="muted">
                  Created {formatDateTime(selectedBooking.createdAt)} • Payment trail updated{' '}
                  {selectedBooking.paymentTrailUpdatedAt ? formatDateTime(selectedBooking.paymentTrailUpdatedAt) : '—'}
                </p>
                <p className="muted">
                  Session {selectedBooking.checkoutSessionId || '—'} • Webhook {selectedBooking.checkoutWebhookEventType || '—'}
                  {selectedBooking.checkoutWebhookEventId ? ` (${selectedBooking.checkoutWebhookEventId})` : ''}
                </p>
              </div>
              <div className="quote-box__amount">
                <span>{formatCurrency(selectedBooking.totalAmount)}</span>
                <small>Deposit {formatCurrency(selectedBooking.depositAmount)}</small>
                <div className="service-pills service-pills--tight" style={{ justifyContent: 'flex-end' }}>
                  <BookingStatusPill status={selectedBooking.status} />
                  <PaymentStatusPill status={selectedBooking.status === 'CONFIRMED' ? 'CONFIRMED' : 'PENDING'} />
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <p className="muted">Loading booking snapshot…</p>
          ) : (
            <p className="muted">No booking records are available yet.</p>
          )}
        </article>

        <article className="card">
          <div className="section-title-row">
            <div>
              <h2>Recent booking roster</h2>
              <p className="muted">Tap a booking to inspect the record without leaving the admin snapshot.</p>
            </div>
            <span className="pill pill--muted">{bookings.length} records</span>
          </div>

          {bookings.length ? (
            <div className="booking-history-stack" style={{ marginTop: 12 }}>
              {bookings.map((booking) => {
                const isSelected = booking.reference === selectedBooking?.reference;
                return (
                  <button
                    key={booking.reference}
                    type="button"
                    onClick={() => setSelectedReference(booking.reference)}
                    className="quote-box booking-result"
                    style={{
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderColor: isSelected ? 'var(--accent-strong, #d4a24c)' : undefined,
                      boxShadow: isSelected ? '0 0 0 1px rgba(212, 162, 76, 0.35)' : undefined,
                    }}
                  >
                    <div>
                      <strong>
                        {booking.reference} • {booking.customerName}
                      </strong>
                      <p className="muted">
                        {booking.vehicleName} • {formatTripTypeLabel(booking.tripType)} • {formatServiceTypeLabel(booking.serviceType)}
                      </p>
                      <p className="muted">
                        {booking.startDate}
                        {booking.pickupTime ? ` • ${booking.pickupTime}` : ''}
                        {booking.tripType === 'ROUND_TRIP' && booking.endTime ? ` → ${booking.endDate} • ${booking.endTime}` : ''}
                      </p>
                      <p className="muted">
                        Pickup {booking.pickupLocation}
                        {booking.pickupNote ? ` (${booking.pickupNote})` : ''}
                      </p>
                    </div>
                    <div className="quote-box__amount">
                      <span>{formatCurrency(booking.totalAmount)}</span>
                      <small>{booking.status}</small>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="muted lookup-empty">No booking draft history has been written to the Workers runtime snapshot yet.</p>
          )}
        </article>
      </section>
    </main>
  );
}
