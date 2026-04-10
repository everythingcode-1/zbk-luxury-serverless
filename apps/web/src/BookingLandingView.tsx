import { useMemo } from 'react';
import type { Vehicle } from '@zbk/shared';

type BookingLandingViewProps = {
  vehicles: Vehicle[];
  searchParams: URLSearchParams;
  bookingWorkspaceHref: string;
  fleetHref: string;
  bookingDemoHref: string;
};

type LegacyBookingData = {
  tripType?: string;
  pickupDate?: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
  pickupLocation?: string;
  dropOffLocation?: string;
  dropoffLocation?: string;
  vehicleId?: string;
  selectedVehicleId?: string;
  hours?: string | number;
};

function formatTripType(value?: string) {
  if (!value) return 'One way';
  return value.toLowerCase().includes('round') ? 'Round trip' : 'One way';
}

function parseLegacyBookingData(raw: string | null): LegacyBookingData | null {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as LegacyBookingData;
  } catch {
    return null;
  }
}

function getVehicleImage(vehicle?: Vehicle | null) {
  if (!vehicle) return '';
  return vehicle.images?.[0] || vehicle.imageUrl || '';
}

function getVehiclePrice(vehicle?: Vehicle | null) {
  if (!vehicle) return 0;
  return vehicle.pricing?.airportTransfer ?? vehicle.pricing?.perHour ?? 0;
}

export default function BookingLandingView({
  vehicles,
  searchParams,
  bookingWorkspaceHref,
  fleetHref,
  bookingDemoHref,
}: BookingLandingViewProps) {
  const bookingData = useMemo(() => parseLegacyBookingData(searchParams.get('bookingData')), [searchParams]);
  const vehicleId = searchParams.get('vehicleId') || bookingData?.vehicleId || bookingData?.selectedVehicleId || '';
  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === vehicleId) || vehicles[0] || null,
    [vehicleId, vehicles],
  );
  const selectedVehicleImage = getVehicleImage(selectedVehicle);
  const selectedVehiclePrice = getVehiclePrice(selectedVehicle);
  const bookingSummaryItems = [
    bookingData?.tripType ? ['Trip type', formatTripType(bookingData.tripType)] : null,
    bookingData?.pickupDate ? ['Pickup date', bookingData.pickupDate] : null,
    bookingData?.pickupTime ? ['Pickup time', bookingData.pickupTime] : null,
    bookingData?.returnDate ? ['Return date', bookingData.returnDate] : null,
    bookingData?.returnTime ? ['Return time', bookingData.returnTime] : null,
    bookingData?.pickupLocation ? ['Pickup', bookingData.pickupLocation] : null,
    bookingData?.dropOffLocation || bookingData?.dropoffLocation
      ? ['Dropoff', bookingData.dropOffLocation || bookingData?.dropoffLocation || '']
      : null,
    bookingData?.hours ? ['Hours', String(bookingData.hours)] : null,
  ].filter((item): item is [string, string] => Boolean(item));

  return (
    <main className="page booking-landing-page">
      <section className="hero booking-landing-hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>Complete Your Booking</h1>
        <p>
          The legacy Next.js booking entry point now lives as a hash-routed landing page in the React/Vite app.
          It can preview a vehicle from the live Workers catalog, preserve legacy booking-data links, and hand off
          into the serverless booking workspace without leaving the new stack.
        </p>
        <div className="service-pills">
          <span className="pill">{vehicles.length} live vehicles</span>
          <span className="pill pill--muted">#{bookingWorkspaceHref.replace('#/', '') || 'workspace'}</span>
          <a className="primary-button primary-button--inline" href={bookingWorkspaceHref}>
            Open booking workspace
          </a>
          <a className="secondary-link" href={fleetHref} style={{ minWidth: 0 }}>
            Open public fleet
          </a>
          <a className="secondary-link" href="#/services" style={{ minWidth: 0 }}>
            Services
          </a>
          <a className="secondary-link" href={bookingDemoHref} style={{ minWidth: 0 }}>
            Open booking demo
          </a>
        </div>
      </section>

      <section className="card-grid">
        <article className="card">
          <p className="eyebrow">Step 1</p>
          <h2>Review the entry point</h2>
          <p className="muted">
            This route is useful for old links, hash-based sharing, and legacy handoffs that previously landed on the
            Next.js booking page.
          </p>
          <ul className="detail-list">
            <li>Hash routing keeps the page deployable on static hosting.</li>
            <li>The booking workspace remains the main place to draft the trip.</li>
            <li>Fleet and booking demo routes stay one click away for review.</li>
          </ul>
        </article>

        <article className="card">
          <p className="eyebrow">Step 2</p>
          <h2>Inspect the selected vehicle</h2>
          <p className="muted">
            {selectedVehicle
              ? `${selectedVehicle.name} is currently in focus from the live Workers catalog.`
              : 'Select a vehicle from the public fleet or pass a vehicleId in the hash query to preload this page.'}
          </p>
          {selectedVehicle ? (
            <div className="quote-box" style={{ marginTop: 12 }}>
              <div>
                <strong>{selectedVehicle.name}</strong>
                <p className="muted" style={{ margin: '4px 0 0' }}>
                  {selectedVehicle.model} • {selectedVehicle.year} • {selectedVehicle.capacity} pax
                </p>
                <p className="muted" style={{ margin: '4px 0 0' }}>
                  {selectedVehicle.location} • {selectedVehicle.category}
                </p>
              </div>
              <div className="quote-box__amount">
                <span>${selectedVehiclePrice.toFixed(2)}</span>
                <small>from the Workers seed catalog</small>
              </div>
            </div>
          ) : null}
          {selectedVehicleImage ? (
            <img
              alt={`${selectedVehicle?.name || 'Selected vehicle'} preview`}
              src={selectedVehicleImage}
              style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 12, marginTop: 12 }}
            />
          ) : null}
        </article>

        <article className="card">
          <p className="eyebrow">Step 3</p>
          <h2>Continue with the draft</h2>
          <p className="muted">
            If the old booking flow handed us encoded draft data, the landing page can display the important fields
            before you move on to the React workspace.
          </p>
          {bookingSummaryItems.length ? (
            <ul className="detail-list">
              {bookingSummaryItems.map(([label, value]) => (
                <li key={label}>
                  {label}: {value}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No encoded booking payload was supplied, so the page is using the live catalog preview only.</p>
          )}
        </article>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <div className="section-title-row">
          <div>
            <h2>Legacy booking handoff bridge</h2>
            <p className="muted">
              This is the visible migration step that replaces the old Next.js booking entry page with a serverless
              landing page and route-safe links.
            </p>
          </div>
        </div>

        <div className="service-pills">
          <a className="primary-button primary-button--inline" href={bookingWorkspaceHref}>
            Continue to booking workspace
          </a>
          <a className="secondary-link" href={fleetHref} style={{ minWidth: 0 }}>
            Browse fleet
          </a>
          <a className="secondary-link" href={bookingDemoHref} style={{ minWidth: 0 }}>
            Open booking demo
          </a>
          {selectedVehicle ? (
            <a className="secondary-link" href={`#/fleet?vehicle=${encodeURIComponent(selectedVehicle.id)}`} style={{ minWidth: 0 }}>
              Reopen selected vehicle in fleet
            </a>
          ) : null}
        </div>
      </section>
    </main>
  );
}
