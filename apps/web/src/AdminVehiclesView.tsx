import { useEffect, useMemo, useState } from 'react';
import { getVehicleCapacityBandLabel, type AdminDashboardResponse, type AuthSession, type Vehicle } from '@zbk/shared';
import { AUTH_SESSION_STORAGE_KEY, loadAuthSessionFromApi, normalizeStoredSession } from './authSession';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
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

function getVehicleImage(vehicle: Vehicle) {
  return vehicle.imageUrl || vehicle.images[0] || '';
}

function getVehiclePrice(vehicle: Vehicle) {
  return vehicle.pricing.airportTransfer || vehicle.pricing.perHour;
}

function formatVehicleCapacity(vehicle: Vehicle) {
  return `${vehicle.capacity} pax • ${getVehicleCapacityBandLabel(vehicle.capacity <= 4 ? 'COMPACT' : vehicle.capacity <= 8 ? 'MID_SIZE' : 'GROUP')}`;
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

export default function AdminVehiclesView() {
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
        setError(err instanceof Error ? err.message : 'Unknown error loading admin vehicle snapshot');
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
  const vehicleCategories = dashboard?.data.vehicleCategories ?? [];
  const vehicles = dashboard?.data.featuredVehicles ?? [];

  const totalLuggage = useMemo(
    () => vehicles.reduce((total, vehicle) => total + (vehicle.luggage ?? 0), 0),
    [vehicles],
  );

  const availableVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.status === 'AVAILABLE').length,
    [vehicles],
  );

  const isAdmin = session?.user.role === 'ADMIN';

  return (
    <main className="page admin-dashboard-page">
      <section className="hero admin-dashboard-hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>Vehicle management is now visible in the serverless admin stack.</h1>
        <p>
          This read-only slice mirrors the legacy vehicle-management surface with the live Workers catalog,
          category breakdowns, and fleet metadata. It is intentionally scoped to inspection-first parity while the
          broader CRUD migration remains on the roadmap.
        </p>
        <div className="service-pills">
          <a className="secondary-link" href="#/admin">
            Back to dashboard
          </a>
          <a className="secondary-link" href="#/fleet">
            Open public fleet
          </a>
          <button className="secondary-button admin-dashboard__refresh-button" type="button" onClick={() => setRefreshTick((tick) => tick + 1)}>
            Refresh vehicle snapshot
          </button>
        </div>
      </section>

      {!sessionLoaded ? <div className="card">Checking stored auth session…</div> : null}

      {sessionLoaded && !session ? (
        <div className="alert error">
          No stored auth session was found. Sign in with the admin demo account from the auth workspace to open the vehicle snapshot.
        </div>
      ) : null}

      {sessionLoaded && session && !isAdmin ? (
        <div className="alert error">
          The stored session belongs to {session.user.role}. Vehicle management access requires an ADMIN session.
        </div>
      ) : null}

      {error ? <div className="alert error">{error}</div> : null}

      <section className="card-grid admin-dashboard__summary-grid">
        <StatCard
          label="Auth session"
          value={session ? session.user.displayName : 'Signed out'}
          note={session ? `${session.user.role} • ${session.user.email}` : 'Sign in to inspect the fleet snapshot.'}
        />
        <StatCard
          label="Vehicles"
          value={summary?.totalVehicles ?? '—'}
          note={summary ? `${availableVehicles} currently available` : 'Loaded from the Workers seed catalog.'}
        />
        <StatCard
          label="Categories"
          value={vehicleCategories.length || '—'}
          note={vehicleCategories.length ? 'Legacy category navigation is preserved in the snapshot.' : 'Category data is still loading.'}
        />
        <StatCard
          label="Booking value"
          value={summary ? formatCurrency(summary.totalBookingValue) : '—'}
          note={summary ? 'Useful context for fleet planning and sales review.' : 'The admin overview is still loading.'}
        />
        <StatCard
          label="Luggage capacity"
          value={totalLuggage}
          note="Summed from the current featured-vehicle roster."
        />
        <StatCard
          label="Source"
          value={dashboard ? 'Workers seed' : '—'}
          note={dashboard ? dashboard.data.generatedAt : 'The snapshot is fetched from the admin overview endpoint.'}
        />
      </section>

      <section className="card-grid" style={{ marginTop: 20 }}>
        <article className="card">
          <div className="section-title-row">
            <div>
              <h2>Fleet categories</h2>
              <p className="muted">A small operational breakdown that mirrors the legacy management tab without introducing CRUD yet.</p>
            </div>
            <span className="pill pill--muted">{vehicleCategories.length} groups</span>
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
            <p className="muted">No category data returned yet.</p>
          )}
        </article>

        <article className="card">
          <div className="section-title-row">
            <div>
              <h2>Vehicle roster snapshot</h2>
              <p className="muted">The roster is read-only for now, but it keeps the legacy vehicle metadata visible in the new workspace.</p>
            </div>
            <span className="pill pill--muted">{vehicles.length} vehicles</span>
          </div>

          {vehicles.length ? (
            <div className="admin-vehicle-snapshot-list">
              {vehicles.map((vehicle) => {
                const vehicleImage = getVehicleImage(vehicle);
                return (
                  <article key={vehicle.id} className="admin-vehicle-snapshot-item">
                    <div className="admin-vehicle-snapshot__media">
                      {vehicleImage ? (
                        <img className="admin-vehicle-snapshot__image" src={vehicleImage} alt={vehicle.name} loading="lazy" />
                      ) : (
                        <div className="admin-vehicle-snapshot__placeholder">
                          <span>No vehicle image available</span>
                        </div>
                      )}
                    </div>

                    <div className="admin-vehicle-snapshot__body">
                      <div className="section-title-row">
                        <div>
                          <h3 style={{ margin: 0 }}>{vehicle.name}</h3>
                          <p className="muted" style={{ margin: '4px 0 0' }}>
                            {vehicle.model} • {vehicle.year} • {vehicle.location}
                          </p>
                        </div>
                        <span className={`pill ${vehicle.status === 'AVAILABLE' ? '' : 'pill--muted'}`}>{vehicle.status}</span>
                      </div>

                      <p className="muted" style={{ margin: 0 }}>
                        Plate number: {vehicle.plateNumber} • {formatVehicleCapacity(vehicle)} • {vehicle.category}
                      </p>

                      <div className="quote-box" style={{ marginTop: 4 }}>
                        <div>
                          <strong>{formatCurrency(getVehiclePrice(vehicle))}</strong>
                          <p className="muted" style={{ margin: '4px 0 0' }}>
                            Airport transfer starting point in the Workers snapshot.
                          </p>
                        </div>
                        <div className="quote-box__amount">
                          <span>{vehicle.isLuxury ? 'Luxury' : 'Standard'}</span>
                          <small>{vehicle.services.length} service option(s)</small>
                        </div>
                      </div>

                      <div className="service-pills service-pills--tight">
                        {vehicle.services.map((service) => (
                          <span key={service} className="pill">
                            {formatVehicleService(service)}
                          </span>
                        ))}
                      </div>

                      <div className="service-pills service-pills--tight">
                        {vehicle.features.slice(0, 3).map((feature) => (
                          <span key={feature} className="pill pill--muted">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="muted">No vehicles were returned for the admin snapshot.</p>
          )}
        </article>
      </section>
    </main>
  );
}
