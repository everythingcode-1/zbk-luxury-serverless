import { useMemo } from 'react';
import {
  calculateTripHours,
  deriveAdditionalHours,
  inferServiceTypeFromTrip,
  isAirportLocation,
  type ServiceType,
  type TripType,
  type Vehicle,
} from '@zbk/shared';
import { buildLegacyBookingWorkspaceHref, parseLegacyBookingData } from './legacyBookingData';

type BookingLandingViewProps = {
  vehicles: Vehicle[];
  searchParams: URLSearchParams;
  bookingWorkspaceHref: string;
  fleetHref: string;
  bookingDemoHref: string;
};


function formatTripType(value?: string) {
  if (!value) return 'One way';
  return value.toLowerCase().includes('round') ? 'Round trip' : 'One way';
}

function getVehicleImage(vehicle?: Vehicle | null) {
  if (!vehicle) return '';
  return vehicle.images?.[0] || vehicle.imageUrl || '';
}

function getVehiclePrice(vehicle?: Vehicle | null) {
  if (!vehicle) return 0;
  return vehicle.pricing?.airportTransfer ?? vehicle.pricing?.perHour ?? 0;
}

function normalizeTripType(value?: string): TripType {
  return value?.toLowerCase().includes('round') ? 'ROUND_TRIP' : 'ONE_WAY';
}

function formatServiceTypeLabel(serviceType: ServiceType) {
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

function formatServiceLabel(serviceType: ServiceType) {
  return formatServiceTypeLabel(serviceType);
}

function formatCurrency(value: number) {
  return `SGD ${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function formatLuggage(vehicle?: Vehicle | null) {
  if (vehicle?.luggage === null || vehicle?.luggage === undefined) return 'Luggage n/a';
  return `${vehicle.luggage} bags`;
}

function formatCalculatedHours(hours: number, additionalHours: number) {
  if (additionalHours > 0) {
    return `${hours} hours (${additionalHours} additional)`;
  }

  return `${hours} hours`;
}

function sortVehiclesByCarouselOrder(left: Vehicle, right: Vehicle) {
  const leftOrder = left.carouselOrder ?? Number.MAX_SAFE_INTEGER;
  const rightOrder = right.carouselOrder ?? Number.MAX_SAFE_INTEGER;

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  const nameDelta = left.name.localeCompare(right.name);
  if (nameDelta !== 0) {
    return nameDelta;
  }

  return left.id.localeCompare(right.id);
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
  const bookingWorkspaceLink = useMemo(
    () => buildLegacyBookingWorkspaceHref(bookingWorkspaceHref, bookingData, vehicleId),
    [bookingData, bookingWorkspaceHref, vehicleId],
  );
  const orderedVehicles = useMemo(() => [...vehicles].sort(sortVehiclesByCarouselOrder), [vehicles]);
  const selectedVehicle = useMemo(
    () => orderedVehicles.find((vehicle) => vehicle.id === vehicleId) || orderedVehicles[0] || null,
    [orderedVehicles, vehicleId],
  );
  const selectedVehicleImage = getVehicleImage(selectedVehicle);
  const selectedVehiclePrice = getVehiclePrice(selectedVehicle);
  const tripType = normalizeTripType(bookingData?.tripType);
  const pickupLocation = bookingData?.pickupLocation || '';
  const dropoffLocation = bookingData?.dropOffLocation || bookingData?.dropoffLocation || '';
  const derivedServiceType = inferServiceTypeFromTrip(tripType, pickupLocation, dropoffLocation);
  const calculatedTripHours =
    tripType === 'ROUND_TRIP' && bookingData?.pickupDate && bookingData?.pickupTime && bookingData?.returnDate && bookingData?.returnTime
      ? calculateTripHours(bookingData.pickupDate, bookingData.pickupTime, bookingData.returnDate, bookingData.returnTime)
      : null;
  const derivedHours = tripType === 'ROUND_TRIP' ? calculatedTripHours || Number(bookingData?.hours || 1) : Number(bookingData?.hours || 1);
  const derivedAdditionalHours = derivedServiceType === 'RENTAL' ? deriveAdditionalHours(derivedHours) : 0;
  const airportNotesPrompt = isAirportLocation(pickupLocation) || isAirportLocation(dropoffLocation)
    ? 'Airport note fields stay visible in the workspace because the route looks airport-related.'
    : 'Airport note fields remain hidden unless one of the locations looks airport-related.';
  const bookingSummaryItems = [
    bookingData?.tripType ? ['Trip type', formatTripType(bookingData.tripType)] : null,
    ['Service type', formatServiceTypeLabel(derivedServiceType)],
    bookingData?.pickupDate ? ['Pickup date', bookingData.pickupDate] : null,
    bookingData?.pickupTime ? ['Pickup time', bookingData.pickupTime] : null,
    bookingData?.returnDate ? ['Return date', bookingData.returnDate] : null,
    bookingData?.returnTime ? ['Return time', bookingData.returnTime] : null,
    bookingData?.pickupLocation ? ['Pickup', bookingData.pickupLocation] : null,
    bookingData?.dropOffLocation || bookingData?.dropoffLocation
      ? ['Dropoff', bookingData.dropOffLocation || bookingData?.dropoffLocation || '']
      : null,
    ['Calculated hours', formatCalculatedHours(derivedHours, derivedAdditionalHours)],
    bookingData?.hours ? ['Legacy payload hours', String(bookingData.hours)] : null,
    selectedVehicle ? ['Supported services', selectedVehicle.services.map(formatServiceLabel).join(', ')] : null,
    selectedVehicle?.luggage != null ? ['Luggage capacity', formatLuggage(selectedVehicle)] : null,
    selectedVehicle?.minimumHours ? ['Minimum booking window', `${selectedVehicle.minimumHours} hour(s)`] : null,
    selectedVehicle ? ['6-hour charter', formatCurrency(selectedVehicle.pricing.sixHours)] : null,
    selectedVehicle ? ['12-hour charter', formatCurrency(selectedVehicle.pricing.twelveHours)] : null,
    selectedVehicle ? ['Per hour', formatCurrency(selectedVehicle.pricing.perHour)] : null,
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
          <a className="primary-button primary-button--inline" href={bookingWorkspaceLink}>
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
                <p className="muted" style={{ margin: '4px 0 0' }}>
                  Plate number: {selectedVehicle.plateNumber}
                </p>
              </div>
              <div className="quote-box__amount">
                <span>${selectedVehiclePrice.toFixed(2)}</span>
                <small>from the Workers seed catalog</small>
              </div>
            </div>
          ) : null}
          {selectedVehicle ? (
            <div className="service-pills" style={{ marginTop: 12 }}>
              {selectedVehicle.services.map((service) => (
                <span key={service} className="pill pill--muted">
                  {formatServiceLabel(service)}
                </span>
              ))}
              <span className="pill">{selectedVehicle.minimumHours ? `Min ${selectedVehicle.minimumHours}h` : 'No minimum'}</span>
              {selectedVehicle.carouselOrder ? <span className="pill pill--muted">Order #{selectedVehicle.carouselOrder}</span> : null}
            </div>
          ) : null}
          {selectedVehicle ? (
            <ul className="detail-list" style={{ marginTop: 12 }}>
              <li>Luggage capacity: {formatLuggage(selectedVehicle)}</li>
              <li>6-hour charter: {formatCurrency(selectedVehicle.pricing.sixHours)}</li>
              <li>12-hour charter: {formatCurrency(selectedVehicle.pricing.twelveHours)}</li>
              <li>Per hour: {formatCurrency(selectedVehicle.pricing.perHour)}</li>
            </ul>
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
            <h2>Legacy ride-detail parity</h2>
            <p className="muted">
              The migrated landing page now mirrors the old round-trip logic by deriving service type, rental hours,
              and airport note prompts from the shared booking contract.
            </p>
          </div>
          <span className="pill pill--muted">{formatServiceTypeLabel(derivedServiceType)}</span>
        </div>

        <div className="card-grid">
          <article className="card">
            <p className="eyebrow">Trip math</p>
            <h3 style={{ marginTop: 0 }}>{formatCalculatedHours(derivedHours, derivedAdditionalHours)}</h3>
            <p className="muted" style={{ marginBottom: 0 }}>
              {tripType === 'ROUND_TRIP'
                ? 'Round-trip bookings recalculate hours from pickup and return timestamps so the Workers API stays authoritative.'
                : 'One-way bookings keep the legacy one-hour default unless a draft explicitly passes a different value.'}
            </p>
          </article>

          <article className="card">
            <p className="eyebrow">Service logic</p>
            <h3 style={{ marginTop: 0 }}>{formatServiceTypeLabel(derivedServiceType)}</h3>
            <p className="muted" style={{ marginBottom: 0 }}>
              {derivedServiceType === 'AIRPORT_TRANSFER'
                ? 'Airport keywords on either end of the route keep the booking aligned with the airport transfer quote.'
                : derivedServiceType === 'RENTAL'
                  ? 'Round trips map to the rental workflow so the checkout summary can carry the longer-duration pricing.'
                  : 'Standard one-way routes stay on the trip pricing path.'}
            </p>
          </article>

          <article className="card">
            <p className="eyebrow">Notes</p>
            <h3 style={{ marginTop: 0 }}>Airport guidance</h3>
            <p className="muted" style={{ marginBottom: 0 }}>
              {airportNotesPrompt}
            </p>
          </article>
        </div>
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
          <a className="primary-button primary-button--inline" href={bookingWorkspaceLink}>
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
