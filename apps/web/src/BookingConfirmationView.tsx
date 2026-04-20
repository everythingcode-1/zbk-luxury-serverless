import { useEffect, useState } from 'react';
import type { BookingLookupResponse, CreateCheckoutSessionResponse, VehicleDetailResponse } from '@zbk/shared';

type BookingConfirmationViewProps = {
  searchParams: URLSearchParams;
  bookingWorkspaceHref: string;
  fleetHref: string;
  bookingDemoHref: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787';

function formatTripTypeLabel(tripType: BookingLookupResponse['data']['tripType']) {
  return tripType === 'ROUND_TRIP' ? 'Round trip' : 'One way';
}

function formatServiceTypeLabel(serviceType: BookingLookupResponse['data']['serviceType']) {
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

function formatCurrency(value: number) {
  return `SGD ${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function formatLuggage(vehicle?: VehicleDetailResponse['data'] | null) {
  if (vehicle?.luggage === null || vehicle?.luggage === undefined) return 'Luggage n/a';
  return `${vehicle.luggage} bags`;
}

function buildConfirmationSummary(booking: BookingLookupResponse['data']) {
  return [
    ['Vehicle', booking.vehicleName],
    ['Trip type', formatTripTypeLabel(booking.tripType)],
    ['Service type', formatServiceTypeLabel(booking.serviceType)],
    ['Pickup date', booking.startDate],
    booking.pickupTime ? ['Pickup time', booking.pickupTime] : null,
    booking.tripType === 'ROUND_TRIP' && booking.endTime ? ['Return time', `${booking.endDate} • ${booking.endTime}`] : null,
    ['Pickup', booking.pickupLocation],
    booking.dropoffLocation ? ['Dropoff', booking.dropoffLocation] : null,
    ['Reference', booking.reference],
  ].filter((item): item is [string, string] => Boolean(item));
}

export default function BookingConfirmationView({
  searchParams,
  bookingWorkspaceHref,
  fleetHref,
  bookingDemoHref,
}: BookingConfirmationViewProps) {
  const reference = searchParams.get('reference')?.trim().toUpperCase() || '';
  const email = searchParams.get('email')?.trim().toLowerCase() || '';
  const [result, setResult] = useState<BookingLookupResponse | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleDetailResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(false);
  const [isPreparingCheckout, setIsPreparingCheckout] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [vehicleError, setVehicleError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadConfirmation() {
      if (!reference || !email) {
        setError('Booking confirmation link is missing the reference or customer email.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/api/public/bookings/${encodeURIComponent(reference)}?email=${encodeURIComponent(email)}`,
          { signal: controller.signal },
        );
        const payload: BookingLookupResponse | { message?: string } = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || `Unable to load booking confirmation: ${response.status}`);
        }

        setResult(payload as BookingLookupResponse);
      } catch (err) {
        if (controller.signal.aborted) return;
        setResult(null);
        setError(err instanceof Error ? err.message : 'Unknown error loading booking confirmation');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadConfirmation();
    return () => controller.abort();
  }, [email, reference]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadVehicleDetails() {
      const vehicleId = result?.data.vehicleId;
      if (!vehicleId) {
        setSelectedVehicle(null);
        setVehicleError(null);
        setIsLoadingVehicle(false);
        return;
      }

      try {
        setIsLoadingVehicle(true);
        setVehicleError(null);

        const response = await fetch(`${API_BASE_URL}/api/public/vehicles/${encodeURIComponent(vehicleId)}`, {
          signal: controller.signal,
        });
        const payload: VehicleDetailResponse | { message?: string } = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || `Unable to load selected vehicle: ${response.status}`);
        }

        setSelectedVehicle((payload as VehicleDetailResponse).data);
      } catch (err) {
        if (controller.signal.aborted) return;
        setSelectedVehicle(null);
        setVehicleError(err instanceof Error ? err.message : 'Unknown error loading selected vehicle');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingVehicle(false);
        }
      }
    }

    loadVehicleDetails();
    return () => controller.abort();
  }, [result]);

  async function startCheckout() {
    if (!result) return;

    try {
      setIsPreparingCheckout(true);
      setCheckoutMessage(null);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/public/bookings/${encodeURIComponent(result.data.reference)}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: result.data.customerEmail,
          origin: window.location.origin,
        }),
      });

      const payload: CreateCheckoutSessionResponse | { message?: string } = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || `Checkout initialization failed: ${response.status}`);
      }

      const checkoutPayload = payload as CreateCheckoutSessionResponse;
      setCheckoutMessage(checkoutPayload.message);

      if (checkoutPayload.data.checkoutUrl) {
        window.location.assign(checkoutPayload.data.checkoutUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error starting checkout');
    } finally {
      setIsPreparingCheckout(false);
    }
  }

  const booking = result?.data;
  const summaryItems = booking ? buildConfirmationSummary(booking) : [];

  if (isLoading) {
    return (
      <main className="page">
        <section className="card" style={{ marginTop: 24 }}>
          <p className="eyebrow">ZBK Luxury Serverless</p>
          <h1>Preparing booking confirmation…</h1>
          <p className="muted">The serverless booking confirmation route is loading the draft from the Workers API.</p>
        </section>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="page">
        <section className="hero">
          <p className="eyebrow">ZBK Luxury Serverless</p>
          <h1>Booking confirmation not available yet.</h1>
          <p>
            This hash-routed confirmation page needs a booking reference and customer email so it can rehydrate the
            draft from the Workers API.
          </p>
        </section>

        {error ? <div className="alert error">{error}</div> : null}

        <section className="service-pills">
          <a className="primary-button primary-button--inline" href={bookingWorkspaceHref}>
            Return to booking workspace
          </a>
          <a className="secondary-link" href={fleetHref} style={{ minWidth: 0 }}>
            Browse fleet
          </a>
          <a className="secondary-link" href={bookingDemoHref} style={{ minWidth: 0 }}>
            Open booking demo
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>Booking confirmation now lives in the React/Vite + Workers stack.</h1>
        <p>
          The migrated confirmation step rehydrates the booking draft from the public Workers API, shows the booking
          summary, and continues into the Workers-safe Stripe checkout handoff when payment is ready.
        </p>
        <div className="service-pills">
          <span className="pill">{booking.status}</span>
          <span className="pill pill--muted">{result.payment.checkoutReady ? 'Checkout ready' : 'Checkout pending'}</span>
          <span className="pill pill--muted">{result.payment.nextStep}</span>
        </div>
      </section>

      {error ? <div className="alert error">{error}</div> : null}
      {checkoutMessage ? <div className="alert success">{checkoutMessage}</div> : null}

      <section className="card-grid">
        <article className="card card--wide">
          <div className="section-title-row">
            <div>
              <h2>Review the booking draft</h2>
              <p className="muted">This route mirrors the legacy confirmation step without depending on Next.js runtime.</p>
            </div>
            <span className="pill pill--muted">{booking.reference}</span>
          </div>

          <div className="quote-box" style={{ marginTop: 12 }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700 }}>{booking.customerName}</p>
              <p className="muted" style={{ margin: '4px 0 0' }}>
                {booking.customerEmail} • {booking.customerPhone}
              </p>
              <p className="muted" style={{ margin: '4px 0 0' }}>
                {booking.vehicleName} • {booking.pickupLocation}
              </p>
            </div>
            <div className="quote-box__amount">
              <span>${booking.totalAmount.toFixed(2)}</span>
              <small>Deposit ${booking.depositAmount.toFixed(2)}</small>
            </div>
          </div>

          {isLoadingVehicle ? <p className="muted" style={{ marginTop: 12 }}>Loading selected vehicle details…</p> : null}
          {vehicleError ? <div className="alert error" style={{ marginTop: 12 }}>{vehicleError}</div> : null}
          {selectedVehicle ? (
            <>
              <ul className="detail-list" style={{ marginTop: 16 }}>
                <li>Model: {selectedVehicle.model}</li>
                <li>Year: {selectedVehicle.year}</li>
                <li>Plate number: {selectedVehicle.plateNumber}</li>
                <li>Color: {selectedVehicle.color}</li>
                <li>Luggage capacity: {formatLuggage(selectedVehicle)}</li>
                <li>Supported services: {selectedVehicle.services.map(formatServiceTypeLabel).join(', ')}</li>
                <li>6-hour charter: {formatCurrency(selectedVehicle.pricing.sixHours)}</li>
                <li>12-hour charter: {formatCurrency(selectedVehicle.pricing.twelveHours)}</li>
                <li>Per hour: {formatCurrency(selectedVehicle.pricing.perHour)}</li>
              </ul>

              {selectedVehicle.features.length > 0 ? (
                <div style={{ marginTop: 16 }}>
                  <p className="muted" style={{ marginBottom: 8 }}>
                    Vehicle highlights
                  </p>
                  <div className="service-pills service-pills--tight">
                    {selectedVehicle.features.map((feature) => (
                      <span key={feature} className="pill pill--muted">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          <ul className="detail-list" style={{ marginTop: 16 }}>
            {summaryItems.map(([label, value]) => (
              <li key={label}>
                {label}: {value}
              </li>
            ))}
            {booking.pickupNote ? <li>Pickup note: {booking.pickupNote}</li> : null}
            {booking.dropoffNote ? <li>Dropoff note: {booking.dropoffNote}</li> : null}
            <li>Created at: {booking.createdAt}</li>
          </ul>
        </article>

        <article className="card">
          <p className="eyebrow">Next step</p>
          <h2>{booking.status === 'CONFIRMED' ? 'Payment confirmed' : 'Continue to Stripe checkout'}</h2>
          <p className="muted">{result.payment.nextStep}</p>
          <div className="service-pills service-pills--tight" style={{ marginTop: 12 }}>
            <button
              className="primary-button primary-button--inline"
              disabled={!result.payment.checkoutReady || isPreparingCheckout}
              onClick={startCheckout}
              type="button"
            >
              {isPreparingCheckout ? 'Preparing checkout…' : 'Open deposit checkout'}
            </button>
            <a className="secondary-link" href={`#/booking?vehicleId=${encodeURIComponent(booking.vehicleId)}`} style={{ minWidth: 0 }}>
              Reopen booking landing
            </a>
          </div>
        </article>

        <article className="card">
          <p className="eyebrow">Cross-navigation</p>
          <h2>Keep the migrated flow moving</h2>
          <p className="muted">
            This confirmation step stays within the serverless surface and can bounce back to the public fleet or booking demo if the customer wants to compare vehicles again.
          </p>
          <div className="service-pills service-pills--tight" style={{ marginTop: 12 }}>
            <a className="secondary-link" href={fleetHref} style={{ minWidth: 0 }}>
              Open public fleet
            </a>
            <a className="secondary-link" href={bookingDemoHref} style={{ minWidth: 0 }}>
              Open booking demo
            </a>
            <a className="secondary-link" href={bookingWorkspaceHref} style={{ minWidth: 0 }}>
              Return to workspace
            </a>
          </div>
        </article>
      </section>
    </main>
  );
}
