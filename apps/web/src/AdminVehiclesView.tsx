import { useEffect, useMemo, useState } from 'react';
import { getVehicleCapacityBandLabel, type AdminVehicleCatalogResponse, type AdminVehicleUpdateRequest, type AuthSession, type Vehicle } from '@zbk/shared';
import { AUTH_SESSION_STORAGE_KEY, loadAuthSessionFromApi, normalizeStoredSession } from './authSession';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787';

type VehicleEditFormState = {
  status: Vehicle['status'];
  location: string;
  carouselOrder: string;
  isLuxury: boolean;
  description: string;
  minimumHours: string;
};

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

function getVehicleCapacityLabel(vehicle: Vehicle) {
  return `${vehicle.capacity} pax • ${getVehicleCapacityBandLabel(vehicle.capacity <= 4 ? 'COMPACT' : vehicle.capacity <= 8 ? 'MID_SIZE' : 'GROUP')}`;
}

function getVehicleSummary(vehicle: Vehicle) {
  const lines = [vehicle.category, vehicle.year.toString(), vehicle.location].filter(Boolean);
  return lines.join(' • ');
}

function buildFormFromVehicle(vehicle: Vehicle): VehicleEditFormState {
  return {
    status: vehicle.status,
    location: vehicle.location,
    carouselOrder: vehicle.carouselOrder?.toString() || '',
    isLuxury: Boolean(vehicle.isLuxury),
    description: vehicle.description || '',
    minimumHours: vehicle.minimumHours?.toString() || '',
  };
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
  const [catalog, setCatalog] = useState<AdminVehicleCatalogResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [form, setForm] = useState<VehicleEditFormState>({
    status: 'AVAILABLE',
    location: '',
    carouselOrder: '',
    isLuxury: false,
    description: '',
    minimumHours: '',
  });

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

    async function loadCatalog() {
      if (!sessionLoaded) return;

      if (!session || session.user.role !== 'ADMIN') {
        setCatalog(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/admin/vehicles`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
          credentials: 'include',
        });
        const payload: AdminVehicleCatalogResponse | { message?: string } = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || `Vehicle catalog failed: ${response.status}`);
        }

        const nextCatalog = payload as AdminVehicleCatalogResponse;
        setCatalog(nextCatalog);
        setNotice((current) => current || nextCatalog.message);
        setSelectedVehicleId((current) => {
          const selectedVehicle = nextCatalog.data.vehicles.find((vehicle) => vehicle.id === current);
          return selectedVehicle ? current : nextCatalog.data.vehicles[0]?.id || null;
        });
      } catch (err) {
        if (controller.signal.aborted) return;
        setCatalog(null);
        setError(err instanceof Error ? err.message : 'Unknown error loading the vehicle catalog');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadCatalog();
    return () => controller.abort();
  }, [refreshTick, session, sessionLoaded]);

  const vehicles = catalog?.data.vehicles ?? [];
  const summary = catalog?.data.summary;
  const categories = useMemo(() => {
    return vehicles.reduce<Record<string, { total: number; luxury: number }>>((acc, vehicle) => {
      const current = acc[vehicle.category] || { total: 0, luxury: 0 };
      acc[vehicle.category] = {
        total: current.total + 1,
        luxury: current.luxury + (vehicle.isLuxury ? 1 : 0),
      };
      return acc;
    }, {});
  }, [vehicles]);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicleId) || null,
    [selectedVehicleId, vehicles],
  );

  useEffect(() => {
    if (!selectedVehicle) return;
    setForm(buildFormFromVehicle(selectedVehicle));
  }, [selectedVehicle]);

  const isAdmin = session?.user.role === 'ADMIN';
  const vehicleCount = summary?.totalVehicles ?? vehicles.length;
  const availableCount = summary?.availableVehicles ?? vehicles.filter((vehicle) => vehicle.status === 'AVAILABLE').length;

  async function handleSaveVehicle() {
    if (!session || !selectedVehicle) return;

    try {
      setIsSaving(true);
      setError(null);
      setNotice(null);

      const payload: AdminVehicleUpdateRequest = {
        status: form.status,
        location: form.location.trim(),
        carouselOrder: form.carouselOrder.trim() ? Number(form.carouselOrder) : null,
        isLuxury: form.isLuxury,
        description: form.description.trim() || undefined,
        minimumHours: form.minimumHours.trim() ? Number(form.minimumHours) : null,
      };

      const response = await fetch(`${API_BASE_URL}/api/admin/vehicles/${encodeURIComponent(selectedVehicle.id)}`, {
        method: 'PATCH',
        signal: new AbortController().signal,
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data: AdminVehicleCatalogResponse | { message?: string } = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Vehicle update failed: ${response.status}`);
      }

      const nextCatalog = data as AdminVehicleCatalogResponse;
      setCatalog(nextCatalog);
      setNotice(nextCatalog.message);
      setSelectedVehicleId(selectedVehicle.id);
      setForm(buildFormFromVehicle(nextCatalog.data.vehicles.find((vehicle) => vehicle.id === selectedVehicle.id) || selectedVehicle));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error saving the vehicle snapshot');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="page admin-dashboard-page">
      <section className="hero admin-dashboard-hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>The vehicle management surface now supports a Workers-safe edit snapshot.</h1>
        <p>
          This slice moves the legacy admin vehicle page beyond read-only inspection by wiring a lightweight catalog edit
          flow into the Cloudflare Workers API. Reviewers can now update the fleet status, location, featured order, and
          operating notes without leaving the serverless stack.
        </p>
        <div className="service-pills">
          <a className="secondary-link" href="#/admin">
            Back to dashboard
          </a>
          <a className="secondary-link" href="#/admin/bookings">
            Booking management
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
      {notice ? <div className="alert success">{notice}</div> : null}

      <section className="card-grid admin-dashboard__summary-grid">
        <StatCard
          label="Auth session"
          value={session ? session.user.displayName : 'Signed out'}
          note={session ? `${session.user.role} • ${session.user.email}` : 'Sign in to inspect the fleet snapshot.'}
        />
        <StatCard
          label="Vehicles"
          value={vehicleCount || '—'}
          note={summary ? `${availableCount} currently available` : 'Loaded from the Workers seed catalog.'}
        />
        <StatCard
          label="Luxury"
          value={summary?.luxuryVehicles ?? '—'}
          note="Quickly see which vehicles are marked as premium fleet stock."
        />
        <StatCard
          label="Featured order"
          value={summary?.featuredVehicles ?? '—'}
          note="Vehicles with a carousel order can stay pinned in the public roster."
        />
        <StatCard
          label="Maintenance"
          value={summary?.maintenanceVehicles ?? '—'}
          note="Vehicles in maintenance are excluded from active availability."
        />
        <StatCard
          label="Source"
          value={catalog ? 'Workers edit snapshot' : '—'}
          note={catalog ? catalog.data.updatedAt : 'The editable catalog is still loading.'}
        />
      </section>

      <section className="card-grid" style={{ marginTop: 20 }}>
        <article className="card">
          <div className="section-title-row">
            <div>
              <h2>Fleet categories</h2>
              <p className="muted">Category totals still mirror the legacy management tab, now derived from the live editable roster.</p>
            </div>
            <span className="pill pill--muted">{Object.keys(categories).length} groups</span>
          </div>

          {Object.keys(categories).length ? (
            <div className="admin-category-list">
              {Object.entries(categories).map(([category, data]) => (
                <div key={category} className="admin-category-item">
                  <div>
                    <strong>{category}</strong>
                    <p className="muted">{data.total} total vehicles</p>
                  </div>
                  <div className="service-pills service-pills--tight">
                    <span className="pill">{data.luxury} luxury</span>
                    <span className="pill pill--muted">{data.total - data.luxury} standard</span>
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
              <h2>Editable vehicle roster</h2>
              <p className="muted">Select one vehicle, change a few operational fields, then persist the update through the Workers API.</p>
            </div>
            <span className="pill pill--muted">{vehicles.length} vehicles</span>
          </div>

          {isLoading ? <p className="muted">Loading vehicle catalog…</p> : null}

          {vehicles.length ? (
            <div className="admin-vehicle-snapshot-list">
              {vehicles.map((vehicle) => {
                const vehicleImage = getVehicleImage(vehicle);
                const isSelected = vehicle.id === selectedVehicleId;
                return (
                  <article
                    key={vehicle.id}
                    className="admin-vehicle-snapshot-item"
                    style={{ borderColor: isSelected ? 'var(--accent-gold, #c7a96b)' : undefined }}
                  >
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
                            {getVehicleSummary(vehicle)}
                          </p>
                          <p className="muted" style={{ margin: '4px 0 0' }}>
                            Plate number: {vehicle.plateNumber}
                          </p>
                        </div>
                        <span className={`pill ${vehicle.status === 'AVAILABLE' ? '' : 'pill--muted'}`}>{vehicle.status}</span>
                      </div>

                      <p className="muted" style={{ margin: 0 }}>
                        {getVehicleCapacityLabel(vehicle)} • {vehicle.luggage ?? 0} luggage • {vehicle.transmission ?? 'Transmission pending'}
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

                      <div className="service-pills service-pills--tight" style={{ marginTop: 12 }}>
                        <button className="primary-button primary-button--inline" type="button" onClick={() => setSelectedVehicleId(vehicle.id)}>
                          Edit snapshot
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="muted">No vehicles were returned yet.</p>
          )}
        </article>

        <article className="card">
          <div className="section-title-row">
            <div>
              <h2>Quick-edit panel</h2>
              <p className="muted">The current vehicle snapshot updates the catalog in place and keeps the public fleet view in sync.</p>
            </div>
            <span className="pill pill--muted">{selectedVehicle ? selectedVehicle.name : 'No selection'}</span>
          </div>

          {selectedVehicle ? (
            <div className="card" style={{ padding: 20 }}>
              <div className="section-title-row">
                <div>
                  <strong>{selectedVehicle.name}</strong>
                  <p className="muted" style={{ margin: '4px 0 0' }}>
                    {selectedVehicle.category} • {selectedVehicle.year} • {selectedVehicle.location}
                  </p>
                </div>
                <span className={`pill ${selectedVehicle.status === 'AVAILABLE' ? '' : 'pill--muted'}`}>{selectedVehicle.status}</span>
              </div>

              <form
                className="stack-form"
                style={{ display: 'grid', gap: 14 }}
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSaveVehicle();
                }}
              >
                <label className="field-group">
                  <span className="field-label">Status</span>
                  <select
                    className="text-input"
                    value={form.status}
                    onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as Vehicle['status'] }))}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="IN_USE">IN_USE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="RESERVED">RESERVED</option>
                  </select>
                </label>

                <label className="field-group">
                  <span className="field-label">Location</span>
                  <input
                    className="text-input"
                    value={form.location}
                    onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                    placeholder="Singapore, Jakarta, Bali…"
                  />
                </label>

                <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                  <label className="field-group">
                    <span className="field-label">Carousel order</span>
                    <input
                      className="text-input"
                      inputMode="numeric"
                      value={form.carouselOrder}
                      onChange={(event) => setForm((current) => ({ ...current, carouselOrder: event.target.value }))}
                      placeholder="Leave blank to remove"
                    />
                  </label>

                  <label className="field-group">
                    <span className="field-label">Minimum hours</span>
                    <input
                      className="text-input"
                      inputMode="numeric"
                      value={form.minimumHours}
                      onChange={(event) => setForm((current) => ({ ...current, minimumHours: event.target.value }))}
                      placeholder="Leave blank to clear"
                    />
                  </label>
                </div>

                <label className="field-group">
                  <span className="field-label">Description</span>
                  <textarea
                    className="text-input"
                    rows={4}
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                    placeholder="Short note for the ops team or public roster"
                  />
                </label>

                <label className="field-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <input
                    type="checkbox"
                    checked={form.isLuxury}
                    onChange={(event) => setForm((current) => ({ ...current, isLuxury: event.target.checked }))}
                  />
                  <span className="field-label" style={{ marginBottom: 0 }}>
                    Mark as luxury vehicle
                  </span>
                </label>

                <div className="service-pills service-pills--tight">
                  <button className="primary-button primary-button--inline" type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving…' : 'Save vehicle snapshot'}
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => setForm(buildFormFromVehicle(selectedVehicle))}
                    disabled={isSaving}
                  >
                    Reset form
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <p className="muted">Select a vehicle from the roster to edit its snapshot.</p>
          )}
        </article>
      </section>
    </main>
  );
}
