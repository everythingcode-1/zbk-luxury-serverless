import { useEffect, useMemo, useState } from 'react';
import type { AdminDashboardResponse, AuthSession, BookingRecord, Vehicle } from '@zbk/shared';
import { AUTH_SESSION_STORAGE_KEY, loadAuthSessionFromApi, normalizeStoredSession } from './authSession';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
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

function formatBookingStatusLabel(status: BookingRecord['status']) {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'PENDING_PAYMENT':
      return 'Pending payment';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'PAYMENT_FAILED':
      return 'Payment failed';
    default:
      return status;
  }
}

function formatVehicleService(service: Vehicle['services'][number]) {
  switch (service) {
    case 'AIRPORT_TRANSFER':
      return 'Airport transfer';
    case 'TRIP':
      return 'One-way trip';
    case 'RENTAL':
      return 'Round-trip rental';
    default:
      return service;
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

export default function AdminAnalysisView() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

    async function loadAnalysis() {
      if (!sessionLoaded) return;

      if (!session || session.user.role !== 'ADMIN') {
        setDashboard(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
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

        setDashboard(payload as AdminDashboardResponse);
      } catch (err) {
        if (controller.signal.aborted) return;
        setDashboard(null);
        setError(err instanceof Error ? err.message : 'Unknown error loading admin analysis');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadAnalysis();
    return () => controller.abort();
  }, [refreshTick, session, sessionLoaded]);

  const summary = dashboard?.data.summary;
  const latestBookings = dashboard?.data.latestBookings ?? [];
  const vehicleCategories = dashboard?.data.vehicleCategories ?? [];
  const featuredVehicles = dashboard?.data.featuredVehicles ?? [];

  const bookingStatusCounts = useMemo(() => {
    if (!latestBookings.length) {
      return [] as Array<{ status: BookingRecord['status']; count: number }>;
    }

    const counts = latestBookings.reduce<Record<string, number>>((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([status, count]) => ({ status: status as BookingRecord['status'], count }))
      .sort((left, right) => right.count - left.count);
  }, [latestBookings]);

  const topVehicle = featuredVehicles[0] ?? null;
  const latestBooking = latestBookings[0] ?? null;
  const topCategory = useMemo(
    () => [...vehicleCategories].sort((left, right) => right.totalVehicles - left.totalVehicles)[0] ?? null,
    [vehicleCategories],
  );

  const isAdmin = session?.user.role === 'ADMIN';

  return (
    <main className="page admin-dashboard-page">
      <section className="hero admin-dashboard-hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>Analytics & performance now have a serverless admin snapshot.</h1>
        <p>
          This slice migrates the legacy admin analysis screen into the React/Vite workspace using the same Workers
          overview endpoint that powers the admin dashboard. It keeps the review surface read-only while still giving
          operators a focused view of bookings, fleet mix, and live session counts.
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
          <button className="secondary-button admin-dashboard__refresh-button" type="button" onClick={() => setRefreshTick((tick) => tick + 1)}>
            Refresh analysis
          </button>
        </div>
      </section>

      {!sessionLoaded ? <div className="card">Checking stored auth session…</div> : null}

      {sessionLoaded && !session ? (
        <div className="alert error">
          No stored auth session was found. Sign in with the admin demo account from the auth workspace to open the analysis snapshot.
        </div>
      ) : null}

      {sessionLoaded && session && !isAdmin ? (
        <div className="alert error">
          The stored session belongs to {session.user.role}. Admin analysis access requires an ADMIN session.
        </div>
      ) : null}

      {error ? <div className="alert error">{error}</div> : null}

      <section className="card-grid admin-dashboard__summary-grid">
        <StatCard
          label="Auth session"
          value={session ? session.user.displayName : 'Signed out'}
          note={session ? `${session.user.role} • ${session.user.email}` : 'Sign in to inspect the analytics snapshot.'}
        />
        <StatCard
          label="Vehicles"
          value={summary?.totalVehicles ?? '—'}
          note={
            summary
              ? `${summary.availableVehicles} available from the live catalog${topCategory ? ` • largest group ${topCategory.category}` : ''}`
              : 'Loaded from the Workers seed catalog.'
          }
        />
        <StatCard
          label="Bookings"
          value={summary?.totalBookings ?? '—'}
          note={summary ? `${summary.pendingBookings} still pending payment` : 'Recent booking drafts are still memory-backed.'}
        />
        <StatCard
          label="Confirmation rate"
          value={summary ? `${summary.confirmationRate.toFixed(0)}%` : '—'}
          note={summary ? 'A compact signal of how many migrated bookings are being confirmed.' : 'The admin overview is still loading.'}
        />
        <StatCard
          label="Booking value"
          value={summary ? formatCurrency(summary.totalBookingValue) : '—'}
          note={summary ? `${formatCurrency(summary.confirmedBookingValue)} confirmed value` : 'Total booking value across the current runtime snapshot.'}
        />
        <StatCard
          label="Active sessions"
          value={summary?.activeSessions ?? '—'}
          note={summary ? `${summary.adminSessions} admin session(s) in the runtime snapshot` : 'Auth is still using in-memory Worker sessions.'}
        />
        <StatCard
          label="Latest sync"
          value={dashboard ? formatDateTime(dashboard.data.generatedAt) : '—'}
          note="Workers overview payload timestamp."
        />
        <StatCard
          label="Most recent booking"
          value={latestBooking ? latestBooking.reference : '—'}
          note={latestBooking ? `${latestBooking.customerName} • ${formatBookingStatusLabel(latestBooking.status)}` : 'Latest booking is shown once the overview loads.'}
        />
      </section>

      <section className="card-grid" style={{ marginTop: 20 }}>
        <article className="card">
          <div className="section-title-row">
            <div>
              <h2>Booking status distribution</h2>
              <p className="muted">A read-only summary of the latest booking roster, mirroring the intent of the legacy analytics page.</p>
            </div>
            <span className="pill pill--muted">{bookingStatusCounts.length} statuses</span>
          </div>

          {bookingStatusCounts.length ? (
            <div className="admin-category-list">
              {bookingStatusCounts.map((item) => (
                <div key={item.status} className="admin-category-item">
                  <div>
                    <strong>{formatBookingStatusLabel(item.status)}</strong>
                    <p className="muted">{item.count} booking{item.count === 1 ? '' : 's'} in the current snapshot</p>
                  </div>
                  <span className="pill">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No booking data was returned yet.</p>
          )}
        </article>

        <article className="card">
          <div className="section-title-row">
            <div>
              <h2>Fleet mix</h2>
              <p className="muted">The same dashboard payload can now answer how the fleet is distributed across legacy categories.</p>
            </div>
            <span className="pill pill--muted">{vehicleCategories.length} groups</span>
          </div>

          {vehicleCategories.length ? (
            <div className="admin-category-list">
              {vehicleCategories.map((category) => (
                <div key={category.category} className="admin-category-item">
                  <div>
                    <strong>{category.category}</strong>
                    <p className="muted">{category.totalVehicles} total vehicles • {category.luxuryVehicles} luxury</p>
                  </div>
                  <span className="pill pill--muted">{category.totalVehicles - category.luxuryVehicles} standard</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No category breakdown was returned yet.</p>
          )}
        </article>

        <article className="card">
          <div className="section-title-row">
            <div>
              <h2>Operational highlights</h2>
              <p className="muted">A focused snapshot of the busiest vehicle and the latest booking event returned by the Worker.</p>
            </div>
            <span className="pill pill--muted">Snapshot</span>
          </div>

          {topVehicle ? (
            <div className="admin-category-list">
              <div className="admin-category-item">
                <div>
                  <strong>{topVehicle.name}</strong>
                  <p className="muted">{topVehicle.model} • {topVehicle.year} • {topVehicle.plateNumber}</p>
                </div>
                <span className="pill">{topVehicle.category}</span>
              </div>
              <p className="muted" style={{ margin: 0 }}>
                Services: {topVehicle.services.map(formatVehicleService).join(', ')}
              </p>
              <p className="muted" style={{ margin: 0 }}>
                Capacity: {topVehicle.capacity} pax • Luggage {topVehicle.luggage ?? '—'} • {topVehicle.color}
              </p>
            </div>
          ) : (
            <p className="muted">No featured vehicle was returned yet.</p>
          )}

          <div style={{ marginTop: 18 }}>
            {latestBooking ? (
              <div className="admin-category-item">
                <div>
                  <strong>Latest booking {latestBooking.reference}</strong>
                  <p className="muted">
                    {latestBooking.customerName} • {formatBookingStatusLabel(latestBooking.status)} • {latestBooking.vehicleName}
                  </p>
                </div>
                <span className="pill pill--muted">{formatCurrency(latestBooking.totalAmount)}</span>
              </div>
            ) : (
              <p className="muted">No latest booking snapshot was returned yet.</p>
            )}
          </div>
        </article>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <div className="section-title-row">
          <div>
            <h2>Migration note</h2>
            <p className="muted">
              The legacy admin analysis screen depended on Next.js admin chrome and chart helpers. This serverless slice keeps the same operational intent,
              but it reuses the Workers overview payload instead of introducing another Node-only dashboard path.
            </p>
          </div>
          <span className="pill pill--muted">Reviewable slice</span>
        </div>
      </section>
    </main>
  );
}
