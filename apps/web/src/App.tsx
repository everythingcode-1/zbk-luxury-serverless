import { useEffect, useMemo, useState } from 'react';
import {
  buildVehicleQuote,
  type BookingHistoryResponse,
  type BookingLookupResponse,
  type BookingQuoteRequest,
  type BookingQuoteResponse,
  type CreateBookingResponse,
  type Vehicle,
  vehicleCategoryOptions,
  serviceTypeOptions,
} from '@zbk/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787';

type VehiclesResponse = {
  data: Vehicle[];
  meta: {
    total: number;
    categories: string[];
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
  pickupNote: string;
  dropoffLocation: string;
  dropoffNote: string;
  notes: string;
};

type BookingLookupFormState = {
  reference: string;
  email: string;
};

type BookingHistoryFormState = {
  email: string;
};

const initialBookingForm: BookingFormState = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  startDate: '',
  endDate: '',
  pickupTime: '09:00',
  pickupLocation: '',
  pickupNote: '',
  dropoffLocation: '',
  dropoffNote: '',
  notes: '',
};

const initialLookupForm: BookingLookupFormState = {
  reference: '',
  email: '',
};

const initialHistoryForm: BookingHistoryFormState = {
  email: '',
};

function getDefaultQuoteRequest(vehicle?: Vehicle): BookingQuoteRequest {
  return {
    vehicleId: vehicle?.id || '',
    serviceType: vehicle?.services[0] || 'AIRPORT_TRANSFER',
    hours: 1,
    additionalHours: 0,
  };
}

function isAirportLocation(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;
  return ['airport', 'terminal', 'arrival', 'departure', 'gate'].some((keyword) => normalized.includes(keyword));
}

export default function App() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleCategories, setVehicleCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<(typeof vehicleCategoryOptions)[number] | 'ALL'>('ALL');
  const [luxuryOnly, setLuxuryOnly] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [quoteRequest, setQuoteRequest] = useState<BookingQuoteRequest>({
    vehicleId: '',
    serviceType: 'AIRPORT_TRANSFER',
    hours: 1,
    additionalHours: 0,
  });
  const [bookingForm, setBookingForm] = useState<BookingFormState>(initialBookingForm);
  const [lookupForm, setLookupForm] = useState<BookingLookupFormState>(initialLookupForm);
  const [historyForm, setHistoryForm] = useState<BookingHistoryFormState>(initialHistoryForm);
  const [remoteQuote, setRemoteQuote] = useState<BookingQuoteResponse | null>(null);
  const [bookingResult, setBookingResult] = useState<CreateBookingResponse | null>(null);
  const [lookupResult, setLookupResult] = useState<BookingLookupResponse | null>(null);
  const [historyResult, setHistoryResult] = useState<BookingHistoryResponse | null>(null);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [isLookingUpBooking, setIsLookingUpBooking] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadVehicles() {
      try {
        setIsLoadingVehicles(true);
        setError(null);
        const params = new URLSearchParams();
        if (selectedCategory !== 'ALL') {
          params.set('category', selectedCategory);
        }
        if (luxuryOnly) {
          params.set('luxuryOnly', 'true');
        }

        const response = await fetch(`${API_BASE_URL}/api/public/vehicles${params.size ? `?${params.toString()}` : ''}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load vehicles: ${response.status}`);
        }

        const payload: VehiclesResponse = await response.json();
        setVehicles(payload.data);
        setVehicleCategories(payload.meta.categories);

        const nextVehicle = payload.data.find((vehicle) => vehicle.id === selectedVehicleId) || payload.data[0];
        setSelectedVehicleId(nextVehicle?.id || '');
        setQuoteRequest(getDefaultQuoteRequest(nextVehicle));
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
  }, [luxuryOnly, selectedCategory]);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicleId),
    [selectedVehicleId, vehicles],
  );

  const localPreview = useMemo(() => {
    if (!selectedVehicle) return null;
    return buildVehicleQuote(selectedVehicle, quoteRequest);
  }, [selectedVehicle, quoteRequest]);

  const showPickupNoteField = useMemo(() => isAirportLocation(bookingForm.pickupLocation), [bookingForm.pickupLocation]);
  const showDropoffNoteField = useMemo(
    () => isAirportLocation(bookingForm.dropoffLocation),
    [bookingForm.dropoffLocation],
  );

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

  function updateLookupForm(field: keyof BookingLookupFormState, value: string) {
    setLookupForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateHistoryForm(field: keyof BookingHistoryFormState, value: string) {
    setHistoryForm((prev) => ({
      ...prev,
      [field]: value,
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
          pickupNote: showPickupNoteField ? bookingForm.pickupNote.trim() : '',
          dropoffLocation: bookingForm.dropoffLocation.trim() || bookingForm.pickupLocation.trim(),
          dropoffNote: showDropoffNoteField ? bookingForm.dropoffNote.trim() : '',
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

      const bookingResponse = payload as CreateBookingResponse;
      setBookingResult(bookingResponse);
      setLookupForm({
        reference: bookingResponse.data.reference,
        email: bookingResponse.data.customerEmail,
      });
      setHistoryForm({
        email: bookingResponse.data.customerEmail,
      });
      setHistoryResult((prev) => ({
        message: prev?.message || 'Booking drafts loaded for this customer email.',
        data: [bookingResponse.data, ...(prev?.data || []).filter((item) => item.reference !== bookingResponse.data.reference)],
        meta: {
          total: (prev?.data || []).filter((item) => item.reference !== bookingResponse.data.reference).length + 1,
          pendingPayment:
            (prev?.data || []).filter((item) => item.reference !== bookingResponse.data.reference && item.status === 'PENDING_PAYMENT')
              .length + (bookingResponse.data.status === 'PENDING_PAYMENT' ? 1 : 0),
        },
      }));
      setLookupResult({
        message: 'Freshly created booking draft is ready to track from this page.',
        data: bookingResponse.data,
        payment: {
          ...bookingResponse.payment,
          checkoutReady: false,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error submitting booking');
      setBookingResult(null);
    } finally {
      setIsSubmittingBooking(false);
    }
  }

  async function lookupBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!lookupForm.reference || !lookupForm.email) {
      setError('Masukkan booking reference dan email untuk melacak draft.');
      return;
    }

    try {
      setIsLookingUpBooking(true);
      setError(null);
      const reference = encodeURIComponent(lookupForm.reference.trim().toUpperCase());
      const email = encodeURIComponent(lookupForm.email.trim());
      const response = await fetch(`${API_BASE_URL}/api/public/bookings/${reference}?email=${email}`);
      const payload: BookingLookupResponse | { message?: string } = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || `Lookup failed: ${response.status}`);
      }

      setLookupResult(payload as BookingLookupResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error looking up booking');
      setLookupResult(null);
    } finally {
      setIsLookingUpBooking(false);
    }
  }

  async function loadBookingHistory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!historyForm.email) {
      setError('Masukkan email customer untuk memuat daftar booking draft.');
      return;
    }

    try {
      setIsLoadingHistory(true);
      setError(null);
      const email = encodeURIComponent(historyForm.email.trim());
      const response = await fetch(`${API_BASE_URL}/api/public/bookings?email=${email}`);
      const payload: BookingHistoryResponse | { message?: string } = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || `History lookup failed: ${response.status}`);
      }

      setHistoryResult(payload as BookingHistoryResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error loading booking history');
      setHistoryResult(null);
    } finally {
      setIsLoadingHistory(false);
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
              <h2>Legacy-inspired vehicle catalog</h2>
              <p className="muted">Kategori dan highlight kendaraan publik sudah ikut dimigrasikan ke Workers seed catalog.</p>
            </div>
            <span className="pill">{isLoadingVehicles ? 'Loading…' : `${vehicles.length} vehicles`}</span>
          </div>

          <div className="catalog-filter-row">
            <div className="service-pills">
              <button
                type="button"
                className={`pill pill-button ${selectedCategory === 'ALL' ? '' : 'pill--muted'}`}
                onClick={() => setSelectedCategory('ALL')}
              >
                All categories
              </button>
              {vehicleCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`pill pill-button ${selectedCategory === category ? '' : 'pill--muted'}`}
                  onClick={() => setSelectedCategory(category as (typeof vehicleCategoryOptions)[number])}
                >
                  {category}
                </button>
              ))}
            </div>

            <label className="checkbox-inline">
              <input type="checkbox" checked={luxuryOnly} onChange={(e) => setLuxuryOnly(e.target.checked)} />
              Luxury only
            </label>
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
                  <div>
                    <strong>{vehicle.name}</strong>
                    <div className="service-pills service-pills--tight">
                      <span className="pill pill--muted">{vehicle.category}</span>
                      {vehicle.isLuxury ? <span className="pill">Luxury</span> : null}
                    </div>
                  </div>
                  <span>{vehicle.status}</span>
                </div>
                <p>
                  {vehicle.model} • {vehicle.year}
                </p>
                <p>
                  {vehicle.location} • {vehicle.capacity} pax
                </p>
                <p className="muted">{vehicle.features.slice(0, 2).join(' • ')}</p>
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
                <li>Category: {selectedVehicle.category}</li>
                <li>Location: {selectedVehicle.location}</li>
                <li>Capacity: {selectedVehicle.capacity} pax</li>
                <li>Luggage: {selectedVehicle.luggage ?? '-'} bags</li>
                <li>Transmission: {selectedVehicle.transmission || '-'}</li>
                <li>Rating: {selectedVehicle.rating ? `${selectedVehicle.rating.toFixed(1)} / 5` : '-'}</li>
                <li>Airport transfer: ${selectedVehicle.pricing.airportTransfer}</li>
                <li>6 hours: ${selectedVehicle.pricing.sixHours}</li>
                <li>12 hours: ${selectedVehicle.pricing.twelveHours}</li>
                <li>Per hour: ${selectedVehicle.pricing.perHour}</li>
              </ul>
              {selectedVehicle.features.length ? (
                <div>
                  <p className="muted">Legacy feature highlights</p>
                  <div className="service-pills">
                    {selectedVehicle.features.map((feature) => (
                      <span key={feature} className="pill pill--muted">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
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
            {showPickupNoteField ? (
              <label>
                Pickup note
                <input
                  maxLength={160}
                  placeholder="Terminal 3 arrival hall / gate details"
                  value={bookingForm.pickupNote}
                  onChange={(e) => updateBookingForm('pickupNote', e.target.value)}
                />
              </label>
            ) : null}
            {showDropoffNoteField ? (
              <label>
                Dropoff note
                <input
                  maxLength={160}
                  placeholder="Terminal 1 departure hall / gate details"
                  value={bookingForm.dropoffNote}
                  onChange={(e) => updateBookingForm('dropoffNote', e.target.value)}
                />
              </label>
            ) : null}
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
                <p className="muted">
                  Pickup {bookingResult.data.pickupLocation}
                  {bookingResult.data.pickupNote ? ` (${bookingResult.data.pickupNote})` : ''}
                  {' → '}
                  {bookingResult.data.dropoffLocation}
                  {bookingResult.data.dropoffNote ? ` (${bookingResult.data.dropoffNote})` : ''}
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

        <article className="card">
          <div className="section-title-row">
            <div>
              <h2>Track booking draft</h2>
              <p className="muted">
                Lookup publik ini memigrasikan status check dasar dari flow legacy agar customer bisa cek draft dengan reference + email.
              </p>
            </div>
            <span className="pill pill--muted">
              {lookupResult ? lookupResult.data.status : 'Lookup ready'}
            </span>
          </div>

          <form className="lookup-form" onSubmit={lookupBooking}>
            <label>
              Booking reference
              <input
                placeholder="BK-20260404-ABCD"
                value={lookupForm.reference}
                onChange={(e) => updateLookupForm('reference', e.target.value.toUpperCase())}
              />
            </label>
            <label>
              Customer email
              <input
                required
                type="email"
                placeholder="name@example.com"
                value={lookupForm.email}
                onChange={(e) => updateLookupForm('email', e.target.value)}
              />
            </label>
            <button className="primary-button primary-button--inline" disabled={isLookingUpBooking} type="submit">
              {isLookingUpBooking ? 'Looking up…' : 'Lookup booking draft'}
            </button>
          </form>

          {lookupResult ? (
            <div className="quote-box quote-box--success booking-result">
              <div>
                <strong>{lookupResult.message}</strong>
                <p className="muted">
                  Ref {lookupResult.data.reference} • {lookupResult.data.customerName} • {lookupResult.data.vehicleName}
                </p>
                <p className="muted">
                  {lookupResult.data.startDate} {lookupResult.data.pickupTime ? `• ${lookupResult.data.pickupTime}` : ''}
                </p>
                <p className="muted">
                  Pickup {lookupResult.data.pickupLocation}
                  {lookupResult.data.pickupNote ? ` (${lookupResult.data.pickupNote})` : ''}
                  {lookupResult.data.dropoffLocation ? ` → ${lookupResult.data.dropoffLocation}` : ''}
                  {lookupResult.data.dropoffNote ? ` (${lookupResult.data.dropoffNote})` : ''}
                </p>
                <p className="muted">Payment: {lookupResult.payment.status} • Checkout ready: {lookupResult.payment.checkoutReady ? 'Yes' : 'Not yet'}</p>
                <p className="muted">Next: {lookupResult.payment.nextStep}</p>
              </div>
              <div className="quote-box__amount">
                <span>${lookupResult.data.totalAmount.toFixed(2)}</span>
                <small>Deposit ${lookupResult.data.depositAmount.toFixed(2)}</small>
              </div>
            </div>
          ) : (
            <p className="muted lookup-empty">Belum ada hasil lookup. Submit draft di atas atau masukkan reference yang sudah ada.</p>
          )}
        </article>

        <article className="card card--wide">
          <div className="section-title-row">
            <div>
              <h2>Customer booking history snapshot</h2>
              <p className="muted">
                Slice ini memigrasikan tampilan dasar mirip “my bookings” versi publik berbasis email, sebelum auth/session serverless selesai.
              </p>
            </div>
            <span className="pill pill--muted">
              {historyResult ? `${historyResult.meta.total} drafts` : 'History ready'}
            </span>
          </div>

          <form className="lookup-form" onSubmit={loadBookingHistory}>
            <label>
              Customer email
              <input
                required
                type="email"
                placeholder="name@example.com"
                value={historyForm.email}
                onChange={(e) => updateHistoryForm('email', e.target.value)}
              />
            </label>
            <button className="primary-button primary-button--inline" disabled={isLoadingHistory} type="submit">
              {isLoadingHistory ? 'Loading…' : 'Load booking drafts by email'}
            </button>
          </form>

          {historyResult ? (
            <div className="booking-history-stack">
              <div className="quote-box quote-box--success booking-result">
                <div>
                  <strong>{historyResult.message}</strong>
                  <p className="muted">
                    Total drafts: {historyResult.meta.total} • Pending payment: {historyResult.meta.pendingPayment}
                  </p>
                </div>
              </div>

              {historyResult.data.length > 0 ? (
                historyResult.data.map((booking) => (
                  <div key={booking.reference} className="quote-box booking-result">
                    <div>
                      <strong>
                        {booking.reference} • {booking.vehicleName}
                      </strong>
                      <p className="muted">
                        {booking.customerName} • {booking.startDate}
                        {booking.pickupTime ? ` • ${booking.pickupTime}` : ''}
                      </p>
                      <p className="muted">
                        Pickup {booking.pickupLocation}
                        {booking.pickupNote ? ` (${booking.pickupNote})` : ''}
                        {booking.dropoffLocation ? ` → ${booking.dropoffLocation}` : ''}
                        {booking.dropoffNote ? ` (${booking.dropoffNote})` : ''}
                      </p>
                      <p className="muted">Status: {booking.status} • Service: {booking.serviceType}</p>
                    </div>
                    <div className="quote-box__amount">
                      <span>${booking.totalAmount.toFixed(2)}</span>
                      <small>Deposit ${booking.depositAmount.toFixed(2)}</small>
                    </div>
                  </div>
                ))
              ) : (
                <p className="muted lookup-empty">Belum ada draft untuk email ini di worker memory scaffold saat ini.</p>
              )}
            </div>
          ) : (
            <p className="muted lookup-empty">Belum ada history yang dimuat. Gunakan email customer untuk melihat semua draft terbaru.</p>
          )}
        </article>
      </section>
    </main>
  );
}
