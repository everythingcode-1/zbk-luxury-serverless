import type { Vehicle } from '@zbk/shared';

type BookingDemoViewProps = {
  isLoadingVehicles: boolean;
  vehicles: Vehicle[];
  vehicleCategories: string[];
};

function formatPrice(vehicle: Vehicle) {
  const price = vehicle.pricing?.airportTransfer ?? vehicle.pricing?.perHour ?? 0;
  return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function BookingDemoVehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const image = vehicle.images?.[0] || vehicle.imageUrl;

  return (
    <article className="card">
      {image ? (
        <img
          alt={`${vehicle.name} preview`}
          src={image}
          style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', borderRadius: 12, marginBottom: 16 }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            aspectRatio: '16 / 10',
            borderRadius: 12,
            marginBottom: 16,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(255,255,255,0.04)',
            border: '1px dashed rgba(255,255,255,0.12)',
            color: '#b2bdd8',
          }}
        >
          No image yet
        </div>
      )}

      <div className="section-title-row" style={{ marginBottom: 8 }}>
        <div>
          <strong>{vehicle.name}</strong>
          <p className="muted" style={{ margin: '4px 0 0' }}>
            {vehicle.model} • {vehicle.year}
          </p>
        </div>
        <span className="pill pill--muted">{vehicle.capacity} pax</span>
      </div>

      <p className="muted" style={{ marginTop: 0 }}>
        {vehicle.location}
      </p>

      <div className="service-pills service-pills--tight">
        <span className="pill">{vehicle.category}</span>
        <span className="pill pill--muted">{vehicle.plateNumber}</span>
        {vehicle.isLuxury ? <span className="pill">Luxury</span> : null}
        {vehicle.rating ? <span className="pill pill--muted">{vehicle.rating.toFixed(1)} rating</span> : null}
      </div>

      {vehicle.features.length > 0 ? (
        <p className="muted" style={{ marginBottom: 0 }}>
          {vehicle.features.slice(0, 3).join(' • ')}
        </p>
      ) : null}

      <div className="quote-box" style={{ marginTop: 16 }}>
        <div>
          <p style={{ margin: 0, fontWeight: 700 }}>From SGD {formatPrice(vehicle)}</p>
          <p className="muted" style={{ margin: '4px 0 0' }}>
            Live seed catalog card from the Workers API
          </p>
        </div>
        <a className="secondary-link" href={`#/booking?vehicleId=${encodeURIComponent(vehicle.id)}`} style={{ minWidth: 0 }}>
          Book now
        </a>
      </div>
    </article>
  );
}

export default function BookingDemoView({ isLoadingVehicles, vehicles, vehicleCategories }: BookingDemoViewProps) {
  const featuredVehicle = vehicles[0];
  const previewVehicles = vehicles.slice(0, 4);

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>Booking demo route now lives in the React/Vite app.</h1>
        <p>
          This hash-routed page mirrors the legacy booking-demo experience with a public fleet preview,
          a 3-step booking guide, and direct links back into the migrated booking workspace.
        </p>
        <div className="service-pills">
          <span className="pill">{isLoadingVehicles ? 'Loading fleet…' : `${vehicles.length} vehicles`}</span>
          <span className="pill pill--muted">{vehicleCategories.length || 0} categories</span>
          <a className="secondary-link" href="#/how-to-book" style={{ minWidth: 0 }}>
            How to book
          </a>
          <a className="secondary-link" href="#/fleet" style={{ minWidth: 0 }}>
            Open public fleet
          </a>
          <a className="secondary-link" href="#/" style={{ minWidth: 0 }}>
            Back to booking workspace
          </a>
        </div>
      </section>

      <section className="card-grid">
        <article className="card">
          <p className="eyebrow">Step 1</p>
          <h2>Enter ride details</h2>
          <p className="muted">
            Capture pickup date, pickup time, route, trip type, and airport notes before the quote and checkout
            handoff are prepared.
          </p>
          <ul className="detail-list" style={{ marginTop: 12 }}>
            <li>Pickup and dropoff locations flow into the booking draft.</li>
            <li>Trip type keeps the quote logic aligned with the Workers contract.</li>
            <li>Pickup and dropoff notes stay with the booking record.</li>
          </ul>
        </article>

        <article className="card">
          <p className="eyebrow">Step 2</p>
          <h2>Choose a vehicle</h2>
          <p className="muted">
            The Workers catalog supplies live vehicle cards, including category, capacity, and legacy-inspired
            fleet highlights.
          </p>
          <ul className="detail-list" style={{ marginTop: 12 }}>
            <li>{vehicleCategories.length || 0} public categories are available in the current seed catalog.</li>
            <li>Vehicle details still come from the Workers API instead of the retired Next.js stack.</li>
            <li>The booking workspace can reopen the selected vehicle from this route.</li>
          </ul>
        </article>

        <article className="card">
          <p className="eyebrow">Step 3</p>
          <h2>Review and pay securely</h2>
          <p className="muted">
            The migrated flow now hands off to a Workers-safe Stripe checkout session and returns through hash-routed
            success/cancel views that work on static hosting.
          </p>
          <ul className="detail-list" style={{ marginTop: 12 }}>
            <li>Deposit checkout is created only when Stripe is configured in the Worker.</li>
            <li>Return pages use the same shared response contracts as the booking workspace.</li>
            <li>Webhook confirmation remains the next payment persistence slice.</li>
          </ul>
        </article>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <div className="section-title-row">
          <div>
            <h2>Live fleet snapshot</h2>
            <p className="muted">A small preview of the current Workers seed catalog, lifted into the migrated demo route.</p>
          </div>
          <span className="pill pill--muted">{isLoadingVehicles ? 'Loading…' : 'Ready'}</span>
        </div>

        {isLoadingVehicles ? (
          <p className="muted">Loading fleet preview…</p>
        ) : previewVehicles.length > 0 ? (
          <div className="vehicle-grid">
            {previewVehicles.map((vehicle) => (
              <BookingDemoVehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <div className="alert error">No public vehicles were returned yet. The route is still wired to the serverless API.</div>
        )}
      </section>

      {featuredVehicle ? (
        <section className="card" style={{ marginTop: 20 }}>
          <div className="section-title-row">
            <div>
              <h2>Featured vehicle handoff</h2>
              <p className="muted">
                {featuredVehicle.name} is the currently featured catalog item and can be opened directly from the main booking workspace or the new public fleet page.
              </p>
            </div>
            <span className="pill">{featuredVehicle.category}</span>
          </div>

          <div className="quote-box">
            <div>
              <p style={{ margin: 0, fontWeight: 700 }}>
                {featuredVehicle.name} • {featuredVehicle.model}
              </p>
              <p className="muted" style={{ margin: '4px 0 0' }}>
                {featuredVehicle.capacity} passengers • {featuredVehicle.location}
              </p>
            </div>
            <a className="primary-button primary-button--inline" href={`#/booking?vehicleId=${encodeURIComponent(featuredVehicle.id)}`} style={{ width: 'auto', textDecoration: 'none' }}>
              Open booking landing
            </a>
          </div>
        </section>
      ) : null}
    </main>
  );
}
