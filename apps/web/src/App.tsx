import { useEffect, useMemo, useState } from 'react';
import {
  buildVehicleQuote,
  type BookingQuoteRequest,
  type BookingQuoteResponse,
  type Vehicle,
  serviceTypeOptions,
} from '@zbk/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787';

type VehiclesResponse = {
  data: Vehicle[];
  meta: {
    total: number;
    source: string;
  };
};

function getDefaultQuoteRequest(vehicle?: Vehicle): BookingQuoteRequest {
  return {
    vehicleId: vehicle?.id || '',
    serviceType: vehicle?.services[0] || 'AIRPORT_TRANSFER',
    hours: 1,
    additionalHours: 0,
  };
}

export default function App() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [quoteRequest, setQuoteRequest] = useState<BookingQuoteRequest>({
    vehicleId: '',
    serviceType: 'AIRPORT_TRANSFER',
    hours: 1,
    additionalHours: 0,
  });
  const [remoteQuote, setRemoteQuote] = useState<BookingQuoteResponse | null>(null);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadVehicles() {
      try {
        setIsLoadingVehicles(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/api/public/vehicles`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load vehicles: ${response.status}`);
        }

        const payload: VehiclesResponse = await response.json();
        setVehicles(payload.data);

        if (payload.data.length > 0) {
          setSelectedVehicleId(payload.data[0].id);
          setQuoteRequest(getDefaultQuoteRequest(payload.data[0]));
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Unknown error loading vehicles');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingVehicles(false);
        }
      }
    }

    loadVehicles();
    return () => controller.abort();
  }, []);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicleId),
    [selectedVehicleId, vehicles],
  );

  const localPreview = useMemo(() => {
    if (!selectedVehicle) return null;
    return buildVehicleQuote(selectedVehicle, quoteRequest);
  }, [selectedVehicle, quoteRequest]);

  async function requestQuote() {
    if (!selectedVehicle) return;

    try {
      setIsLoadingQuote(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/public/booking/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteRequest),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || `Quote request failed: ${response.status}`);
      }

      setRemoteQuote(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error requesting quote');
      setRemoteQuote(null);
    } finally {
      setIsLoadingQuote(false);
    }
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>Vehicles + booking quote phase sudah mulai hidup.</h1>
        <p>
          UI React ini sekarang memakai contract shared dan endpoint Hono untuk membaca katalog
          kendaraan seed dan meminta booking quote dari backend Workers.
        </p>
      </section>

      {error ? <div className="alert error">{error}</div> : null}

      <section className="card-grid">
        <article className="card card--wide">
          <div className="section-title-row">
            <div>
              <h2>Seed vehicle catalog</h2>
              <p className="muted">Sementara memakai seed catalog sebelum Neon dihubungkan penuh.</p>
            </div>
            <span className="pill">{isLoadingVehicles ? 'Loading…' : `${vehicles.length} vehicles`}</span>
          </div>

          <div className="vehicle-grid">
            {vehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                className={`vehicle-card ${vehicle.id === selectedVehicleId ? 'vehicle-card--active' : ''}`}
                onClick={() => {
                  setSelectedVehicleId(vehicle.id);
                  setQuoteRequest(getDefaultQuoteRequest(vehicle));
                  setRemoteQuote(null);
                }}
              >
                <div className="vehicle-card__header">
                  <strong>{vehicle.name}</strong>
                  <span>{vehicle.status}</span>
                </div>
                <p>{vehicle.model} • {vehicle.year}</p>
                <p>{vehicle.location} • {vehicle.capacity} pax</p>
                <div className="service-pills">
                  {vehicle.services.map((service) => (
                    <span key={service} className="pill pill--muted">{service}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </article>

        <article className="card">
          <h2>Vehicle detail</h2>
          {selectedVehicle ? (
            <>
              <p className="vehicle-detail__name">{selectedVehicle.name}</p>
              <p className="muted">{selectedVehicle.description}</p>
              <ul className="detail-list">
                <li>Location: {selectedVehicle.location}</li>
                <li>Capacity: {selectedVehicle.capacity} pax</li>
                <li>Luggage: {selectedVehicle.luggage ?? '-'} bags</li>
                <li>Airport transfer: ${selectedVehicle.pricing.airportTransfer}</li>
                <li>6 hours: ${selectedVehicle.pricing.sixHours}</li>
                <li>12 hours: ${selectedVehicle.pricing.twelveHours}</li>
                <li>Per hour: ${selectedVehicle.pricing.perHour}</li>
              </ul>
            </>
          ) : (
            <p className="muted">Pilih vehicle dulu.</p>
          )}
        </article>

        <article className="card">
          <h2>Booking quote request</h2>
          <label>
            Service type
            <select
              value={quoteRequest.serviceType}
              onChange={(e) =>
                setQuoteRequest((prev) => ({
                  ...prev,
                  serviceType: e.target.value as BookingQuoteRequest['serviceType'],
                }))
              }
            >
              {(selectedVehicle?.services || serviceTypeOptions).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            Hours
            <input
              type="number"
              min={1}
              value={quoteRequest.hours}
              onChange={(e) =>
                setQuoteRequest((prev) => ({
                  ...prev,
                  hours: Number(e.target.value),
                }))
              }
            />
          </label>

          <label>
            Additional hours
            <input
              type="number"
              min={0}
              value={quoteRequest.additionalHours}
              onChange={(e) =>
                setQuoteRequest((prev) => ({
                  ...prev,
                  additionalHours: Number(e.target.value),
                }))
              }
            />
          </label>

          <button className="primary-button" onClick={requestQuote} disabled={!selectedVehicle || isLoadingQuote}>
            {isLoadingQuote ? 'Requesting…' : 'Request quote from API'}
          </button>

          {localPreview ? (
            <div className="quote-box">
              <div>
                <strong>Local preview</strong>
                <p className="muted">Shared pricing logic preview di browser.</p>
              </div>
              <div className="quote-box__amount">
                <span>${localPreview.totalAmount.toFixed(2)}</span>
                <small>Deposit ${localPreview.depositAmount.toFixed(2)}</small>
              </div>
            </div>
          ) : null}

          {remoteQuote ? (
            <div className="quote-box quote-box--success">
              <div>
                <strong>API quote ready</strong>
                <p className="muted">{remoteQuote.vehicleName} • {remoteQuote.serviceType}</p>
              </div>
              <div className="quote-box__amount">
                <span>${remoteQuote.totalAmount.toFixed(2)}</span>
                <small>Deposit ${remoteQuote.depositAmount.toFixed(2)}</small>
              </div>
            </div>
          ) : null}
        </article>
      </section>
    </main>
  );
}
