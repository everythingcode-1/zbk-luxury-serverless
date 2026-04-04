import { useEffect, useMemo, useState } from 'react';
import {
  buildVehicleQuote,
  type BookingQuoteRequest,
  type BookingQuoteResponse,
  type CreateBookingResponse,
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

type BookingFormState = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  pickupTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  notes: string;
};

const initialBookingForm: BookingFormState = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  startDate: '',
  endDate: '',
  pickupTime: '09:00',
  pickupLocation: '',
  dropoffLocation: '',
  notes: '',
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
  const [bookingForm, setBookingForm] = useState<BookingFormState>(initialBookingForm);
  const [remoteQuote, setRemoteQuote] = useState<BookingQuoteResponse | null>(null);
  const [bookingResult, setBookingResult] = useState<CreateBookingResponse | null>(null);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
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

  function resetBookingArtifacts() {
    setBookingResult(null);
    setRemoteQuote(null);
  }

  function updateBookingForm(field: keyof BookingFormState, value: string) {
    setBookingForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'startDate' && !prev.endDate ? { endDate: value } : {}),
    }));
  }

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
      setBookingResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error requesting quote');
      setRemoteQuote(null);
    } finally {
      setIsLoadingQuote(false);
    }
  }

  async function submitBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedVehicle) {
      setError('Pilih vehicle dulu sebelum submit booking.');
      return;
    }

    if (!bookingForm.startDate || !bookingForm.pickupLocation) {
      setError('Tanggal mulai dan pickup location wajib diisi.');
      return;
    }

    try {
      setIsSubmittingBooking(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/public/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingForm,
          vehicleId: selectedVehicle.id,
          serviceType: quoteRequest.serviceType,
          startDate: bookingForm.startDate,
          endDate: bookingForm.endDate || bookingForm.startDate,
          hours: quoteRequest.hours,
          additionalHours: quoteRequest.additionalHours,
        }),
      });

      const payload: CreateBookingResponse | { message?: string } = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || `Booking request failed: ${response.status}`);
      }

      setBookingResult(payload as CreateBookingResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error submitting booking');
      setBookingResult(null);
    } finally {
      setIsSubmittingBooking(false);
    }
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>Public vehicles + booking draft flow sudah bergerak ke Workers.</h1>
        <p>
          UI React ini memakai contract shared untuk membaca katalog, meminta booking quote,
          lalu mengirim booking draft ke backend Hono/Workers dengan response yang siap
          dipasangkan ke Stripe checkout berikutnya.
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
                  resetBookingArtifacts();
                }}
                type="button"
              >
                <div className="vehicle-card__header">
                  <strong>{vehicle.name}</strong>
                  <span>{vehicle.status}</span>
                </div>
                <p>
                  {vehicle.model} • {vehicle.year}
                </p>
                <p>
                  {vehicle.location} • {vehicle.capacity} pax
                </p>
                <div className="service-pills">
                  {vehicle.services.map((service) => (
                    <span key={service} className="pill pill--muted">
                      {service}
                    </span>
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
              onChange={(e) => {
                setQuoteRequest((prev) => ({
                  ...prev,
                  serviceType: e.target.value as BookingQuoteRequest['serviceType'],
                }));
                resetBookingArtifacts();
              }}
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
              onChange={(e) => {
                setQuoteRequest((prev) => ({
                  ...prev,
                  hours: Number(e.target.value),
                }));
                resetBookingArtifacts();
              }}
            />
          </label>

          <label>
            Additional hours
            <input
              type="number"
              min={0}
              value={quoteRequest.additionalHours}
              onChange={(e) => {
                setQuoteRequest((prev) => ({
                  ...prev,
                  additionalHours: Number(e.target.value),
                }));
                resetBookingArtifacts();
              }}
            />
          </label>

          <button className="primary-button" onClick={requestQuote} disabled={!selectedVehicle || isLoadingQuote} type="button">
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
                <p className="muted">
                  {remoteQuote.vehicleName} • {remoteQuote.serviceType}
                </p>
              </div>
              <div className="quote-box__amount">
                <span>${remoteQuote.totalAmount.toFixed(2)}</span>
                <small>Deposit ${remoteQuote.depositAmount.toFixed(2)}</small>
              </div>
            </div>
          ) : null}
        </article>

        <article className="card card--wide">
          <div className="section-title-row">
            <div>
              <h2>Booking draft submission</h2>
              <p className="muted">
                Slice ini memigrasikan form booking publik agar bisa mengirim booking draft ke Workers.
              </p>
            </div>
            <span className="pill pill--muted">
              {bookingResult ? bookingResult.data.status : 'Draft not submitted'}
            </span>
          </div>

          <form className="booking-form-grid" onSubmit={submitBooking}>
            <label>
              Customer name
              <input
                required
                value={bookingForm.customerName}
                onChange={(e) => updateBookingForm('customerName', e.target.value)}
              />
            </label>
            <label>
              Customer email
              <input
                required
                type="email"
                value={bookingForm.customerEmail}
                onChange={(e) => updateBookingForm('customerEmail', e.target.value)}
              />
            </label>
            <label>
              Customer phone
              <input
                required
                value={bookingForm.customerPhone}
                onChange={(e) => updateBookingForm('customerPhone', e.target.value)}
              />
            </label>
            <label>
              Pickup date
              <input
                required
                type="date"
                value={bookingForm.startDate}
                onChange={(e) => updateBookingForm('startDate', e.target.value)}
              />
            </label>
            <label>
              End date
              <input
                required
                type="date"
                value={bookingForm.endDate}
                onChange={(e) => updateBookingForm('endDate', e.target.value)}
              />
            </label>
            <label>
              Pickup time
              <input
                type="time"
                value={bookingForm.pickupTime}
                onChange={(e) => updateBookingForm('pickupTime', e.target.value)}
              />
            </label>
            <label>
              Pickup location
              <input
                required
                value={bookingForm.pickupLocation}
                onChange={(e) => updateBookingForm('pickupLocation', e.target.value)}
              />
            </label>
            <label>
              Dropoff location
              <input
                value={bookingForm.dropoffLocation}
                onChange={(e) => updateBookingForm('dropoffLocation', e.target.value)}
              />
            </label>
            <label className="booking-form-grid__full">
              Notes
              <textarea
                rows={4}
                value={bookingForm.notes}
                onChange={(e) => updateBookingForm('notes', e.target.value)}
              />
            </label>

            <div className="booking-submit-row booking-form-grid__full">
              <div className="muted booking-submit-row__summary">
                <span>Selected vehicle: {selectedVehicle?.name || '—'}</span>
                <span>Service: {quoteRequest.serviceType}</span>
                <span>
                  Current quote: ${localPreview?.totalAmount.toFixed(2) || '0.00'} / deposit ${localPreview?.depositAmount.toFixed(2) || '0.00'}
                </span>
              </div>
              <button className="primary-button primary-button--inline" disabled={!selectedVehicle || isSubmittingBooking} type="submit">
                {isSubmittingBooking ? 'Submitting…' : 'Submit booking draft'}
              </button>
            </div>
          </form>

          {bookingResult ? (
            <div className="quote-box quote-box--success booking-result">
              <div>
                <strong>{bookingResult.message}</strong>
                <p className="muted">
                  Ref {bookingResult.data.reference} • {bookingResult.data.vehicleName} • {bookingResult.data.startDate}
                </p>
                <p className="muted">Next: {bookingResult.payment.nextStep}</p>
              </div>
              <div className="quote-box__amount">
                <span>${bookingResult.data.totalAmount.toFixed(2)}</span>
                <small>Deposit ${bookingResult.data.depositAmount.toFixed(2)}</small>
              </div>
            </div>
          ) : null}
        </article>
      </section>
    </main>
  );
}
