import { useEffect, useMemo, useState } from 'react';
import type { AdminDashboardResponse, AuthSession, Vehicle } from '@zbk/shared';
import { AUTH_SESSION_STORAGE_KEY, loadAuthSessionFromApi, normalizeStoredSession } from './authSession';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787';

function StatCard({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <article className="admin-stat-card">
      <p className="eyebrow">{label}</p>
      <strong>{value}</strong>
      <p className="muted">{note}</p>
    </article>
  );
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

function BookingStatusPill({ status }: { status: string }) {
  return <span className={`pill ${status === 'CONFIRMED' ? '' : 'pill--muted'}`}>{status}</span>;
}

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

function formatVehicleService(service: Vehicle['services'][number]) {
  switch (service) {
    case 'AIRPORT_TRANSFER':
      return 'Airport transfer';
    case 'TRIP':
      return 'One-way trip';
    case 'RENTAL':
      return 'Rental';
    default:
      return service;
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminDashboardView() {
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

    async function loadDashboard() {
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
        setError(err instanceof Error ? err.message : 'Unknown error loading admin dashboard');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();
    return () => controller.abort();
  }, [refreshTick, session, sessionLoaded]);

  const summary = dashboard?.data.summary;
  const latestBookings = dashboard?.data.latestBookings ?? [];
  const vehicleCategories = dashboard?.data.vehicleCategories ?? [];
  const featuredVehicles = dashboard?.data.featuredVehicles ?? [];

  const bookingStatusCounts = useMemo(() => {
    if (!latestBookings.length) {
      return [] as Array<{ label: string; count: number }>;
    }

    const counts = latestBookings.reduce<Record<string, number>>((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([label, count]) => ({ label, count }));
  }, [latestBookings]);

  const isAdmin = session?.user.role === 'ADMIN';

  return (
    <main className="page admin-dashboard-page">
      <section className="hero admin-dashboard-hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>Admin dashboard now has a serverless overview endpoint.</h1>
        <p>
          This slice migrates the legacy admin entry point into a Workers-protected overview for vehicles, bookings,
          and live auth sessions. It stays intentionally small, but it gives reviewers a visible admin surface on the new stack.
        </p>
        <div className="service-pills">
          <a className="secondary-link" href="#/">
            Back to booking workspace
          </a>
          <button className="secondary-button admin-dashboard__refresh-button" type="button" onClick={() => setRefreshTick((tick) => tick + 1)}>
            Refresh overview
          </button>
        </div>
      </section>

      {!sessionLoaded ? <div className="card">Checking stored auth session…</div> : null}

      {sessionLoaded && !session ? (
        <div className="alert error">
          No stored auth session was found. Sign in with the admin demo account from the auth workspace to open the dashboard.
        </div>
      ) : null}

      {sessionLoaded && session && !isAdmin ? (
        <div className="alert error">
          The stored session belongs to {session.user.role}. Admin overview access requires an ADMIN session.
        </div>
      ) : null}

      {error ? <div className="alert error">{error}</div> : null}

      <section className="card-grid admin-dashboard__summary-grid">
        <StatCard
          label="Auth session"
          value={session ? session.user.displayName : 'Signed out'}
          note={session ? `${session.user.role} • ${session.user.email}` : 'Sign in to view the admin summary.'}
        />
        <StatCard
          label="Vehicles"
          value={summary?.totalVehicles ?? '—'}
          note={summary ? `${summary.availableVehicles} available right now` : 'Loaded from the Workers seed catalog.'}
        />
        <StatCard
          label="Bookings"
          value={summary?.totalBookings ?? '—'}
          note={summary ? `${summary.pendingBookings} pending payment` : 'Recent booking drafts are still memory-backed.'}
        />
        <StatCard
          label="Payment states"
          value={summary?.confirmedBookings ?? '—'}
          note={summary ? `${summary.failedBookings} failed • ${summary.pendingBookings} pending` : 'Useful for tracking Stripe migration progress.'}
        />
        <StatCard
          label="Support inquiries"
          value={summary?.contactInquiries ?? '—'}
          note={summary ? 'Workers contact intake is now visible from the admin overview.' : 'Contact submissions are still loading.'}
        />
        <StatCard
          label="Active sessions"
          value={summary?.activeSessions ?? '—'}
          note={summary ? `${summary.adminSessions} admin session(s) currently active` : 'Auth is still using in-memory Worker sessions.'}
        />
        <StatCard
          label="Catalog sources"
          value={dashboard ? 'Workers seed' : '—'}
          note={dashboard ? dashboard.data.generatedAt : 'Admin endpoint returns the latest serverless snapshot.'}
        />
      </section>

      <section className="card-grid" style={{ marginTop: 20 }}>
        <article className="card">
          <div className="section-title-row">
            <div>
              <h2>Fleet by category</h2>
              <p className="muted">A compact operational breakdown that keeps the legacy category navigation visible in the serverless stack.</p>
            </div>
            <span className="pill pill--muted">{vehicleCategories.length} categories</span>
          </div>

          {vehicleCategories.length ? (
            <div className="admin-category-list">
              {vehicleCategories.map((category) => (
                <div key={category.category} className="admin-category-item">
                  <div>
                    <strong>{category.category}</strong>
                    <p className="muted">{category.totalVehicles} total vehicles</p>
                  </div>
                  <div className="service-pills service-pills--tight">
                    <span className="pill">{category.luxuryVehicles} luxury</span>
                    <span className="pill pill--muted">{category.totalVehicles - category.luxuryVehicles} standard</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No fleet categories were returned yet.</p>
          )}
        </article>

        <article className="card">
          <div className="section-title-row">
            <div>
              <h2>Featured vehicle roster</h2>
              <p className="muted">A read-only snapshot that mirrors the legacy admin vehicle-management detail surface without requiring CRUD yet.</p>
            </div>
            <span className="pill pill--muted">{featuredVehicles.length} vehicles</span>
          </div>

          {featuredVehicles.length ? (
            <div className="admin-vehicle-snapshot-list">
              {featuredVehicles.map((vehicle) => {
                const vehicleImage = vehicle.imageUrl || vehicle.images[0] || '';
                return (
                  <article key={vehicle.id} className="admin-vehicle-snapshot-item">
                    <div className="admin-vehicle-snapshot__media">
                      {vehicleImage ? (
                        <img className="admin-vehicle-snapshot__image" src={vehicleImage} alt={vehicle.name} loading="lazy" />
                      ) : (
                        <div className="admin-vehicle-snapshot__placeholder">No image available</div>
                      )}
                    </div>

                    <div className="admin-vehicle-snapshot__body">
                      <div className="section-title-row" style={{ marginBottom: 0 }}>
                        <div>
                          <strong>{vehicle.name}</strong>
                          <p className="muted" style={{ margin: '4px 0 0' }}>
                            {vehicle.category} • {vehicle.year} • {vehicle.location}
                          </p>
                        </div>
                        <span className={`pill ${vehicle.status === 'AVAILABLE' ? '' : 'pill--muted'}`}>{vehicle.status}</span>
                      </div>

                      <p className="muted" style={{ margin: 0 }}>
                        {vehicle.capacity} pax • {vehicle.luggage ?? 0} luggage • {vehicle.transmission ?? 'Transmission pending'}
                      </p>
                      {vehicle.rating != null ? <p className="muted" style={{ margin: 0 }}>Rating {vehicle.rating.toFixed(1)} / 5</p> : null}
                      {vehicle.minimumHours ? <p className="muted" style={{ margin: 0 }}>Minimum booking window: {vehicle.minimumHours} hours</p> : null}

                      <div className="service-pills service-pills--tight">
                        {vehicle.services.map((service) => (
                          <span key={service} className="pill pill--muted">
                            {formatVehicleService(service)}
                          </span>
                        ))}
                      </div>

                      <ul className="detail-list" style={{ marginTop: 4 }}>
                        <li>Airport transfer: {formatCurrency(vehicle.pricing.airportTransfer)}</li>
                        <li>6-hour charter: {formatCurrency(vehicle.pricing.sixHours)}</li>
                        <li>12-hour charter: {formatCurrency(vehicle.pricing.twelveHours)}</li>
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="muted">No featured vehicles were returned yet.</p>
          )}
        </article>

        <article className="card">
          <div className="section-title-row">
            <div>
              <h2>Latest booking drafts</h2>
              <p className="muted">The newest public bookings surface here so the admin slice can watch the migration flow end-to-end.</p>
            </div>
            <span className="pill pill--muted">{latestBookings.length} items</span>
          </div>

          {bookingStatusCounts.length ? (
            <div className="service-pills service-pills--tight" style={{ marginBottom: 16 }}>
              {bookingStatusCounts.map((item) => (
                <span key={item.label} className="pill pill--muted">
                  {item.label}: {item.count}
                </span>
              ))}
            </div>
          ) : null}

          {latestBookings.length ? (
            <div className="admin-booking-list">
              {latestBookings.map((booking) => (
                <article key={booking.reference} className="admin-booking-item">
                  <div className="section-title-row" style={{ marginBottom: 8 }}>
                    <div>
                      <strong>{booking.reference}</strong>
                      <p className="muted" style={{ margin: '4px 0 0' }}>
                        {booking.customerName} • {booking.vehicleName}
                      </p>
                    </div>
                    <BookingStatusPill status={booking.status} />
                  </div>
                  <p className="muted" style={{ marginTop: 0 }}>
                    {booking.tripType} • {booking.serviceType} • {booking.customerEmail}
                  </p>
                  <p className="muted" style={{ marginBottom: 0 }}>
                    {formatDateTime(booking.createdAt)} • Deposit ${booking.depositAmount.toFixed(2)}
                  </p>
                  {booking.checkoutSessionId ? (
                    <p className="muted" style={{ marginBottom: 0 }}>
                      Checkout session: {booking.checkoutSessionId}
                    </p>
                  ) : null}
                  {booking.checkoutWebhookEventId ? (
                    <p className="muted" style={{ marginBottom: 0 }}>
                      Last webhook: {booking.checkoutWebhookEventType || 'unknown'} ({booking.checkoutWebhookEventId})
                    </p>
                  ) : null}
                  {booking.paymentTrailUpdatedAt ? (
                    <p className="muted" style={{ marginBottom: 0 }}>
                      Trail updated: {formatDateTime(booking.paymentTrailUpdatedAt)}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <p className="muted">No booking drafts have been created in this runtime yet.</p>
          )}
        </article>
      </section>

      <section className="card admin-dashboard__session-card" style={{ marginTop: 20 }}>
        <div className="section-title-row">
          <div>
            <h2>Admin session snapshot</h2>
            <p className="muted">A visible bridge from the auth slice into the new admin area.</p>
          </div>
          <span className={`pill ${isAdmin ? '' : 'pill--muted'}`}>{isAdmin ? 'ADMIN' : 'NO ADMIN SESSION'}</span>
        </div>

        {session ? (
          <div className="admin-session-grid">
            <div>
              <p className="muted">Signed in as</p>
              <strong>{session.user.displayName}</strong>
              <p className="muted">{session.user.email}</p>
              <p className="muted">Primary route: {session.primaryRoute}</p>
              <p className="muted">Capabilities: {session.capabilities.map(formatSessionCapability).join(', ')}</p>
            </div>
            <ul className="detail-list">
              <li>Token: {session.token.slice(0, 12)}…</li>
              <li>Issued: {session.issuedAt}</li>
              <li>Expires: {session.expiresAt}</li>
              <li>Dashboard status: {dashboard ? dashboard.message : 'Waiting for overview payload'}</li>
            </ul>
          </div>
        ) : (
          <p className="muted">Open the auth workspace, sign in as the admin demo user, and return here.</p>
        )}
      </section>
    </main>
  );
}
