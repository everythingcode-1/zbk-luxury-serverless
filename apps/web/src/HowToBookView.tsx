type HowToBookViewProps = {
  vehicleCount: number;
  vehicleCategoryCount: number;
  featuredVehicleName?: string;
  bookingWorkspaceHref: string;
  bookingLandingHref: string;
  fleetDemoHref: string;
};

const faqItems = [
  {
    question: 'Do I need an account before I can book?',
    answer:
      'No. The serverless booking workspace still accepts a guest-style booking draft, then offers a typed auth session when the user wants to sign in later.',
  },
  {
    question: 'How do I choose the right vehicle?',
    answer:
      'Start from the public fleet preview, filter by category or luxury-only, then open the spotlighted detail card before submitting the quote.',
  },
  {
    question: 'What happens after I submit the booking?',
    answer:
      'The Workers API generates a booking reference, stores the draft in the runtime snapshot, and can hand off to the Stripe checkout slice when payment is configured.',
  },
  {
    question: 'Is this flow ready for static hosting?',
    answer:
      'Yes. The guide uses hash routes, so the booking workspace, booking demo, and payment return screens can all live behind static hosting plus Workers.',
  },
];

export default function HowToBookView({
  vehicleCount,
  vehicleCategoryCount,
  featuredVehicleName,
  bookingWorkspaceHref,
  bookingLandingHref,
  fleetDemoHref,
}: HowToBookViewProps) {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>How to book now lives in the React/Vite migration.</h1>
        <p>
          This page mirrors the legacy public guide with a tighter serverless layout: choose ride details, pick a
          vehicle from the live Workers catalog, then continue into the migrated checkout flow.
        </p>
        <div className="service-pills">
          <span className="pill">{vehicleCount} live vehicles</span>
          <span className="pill pill--muted">{vehicleCategoryCount} categories</span>
          {featuredVehicleName ? <span className="pill">Featured: {featuredVehicleName}</span> : null}
        </div>
      </section>

      <section className="card-grid">
        <article className="card">
          <p className="eyebrow">Step 1</p>
          <h2>Choose your ride details</h2>
          <p className="muted">
            Start with pickup date, pickup time, trip type, and airport notes. The booking form keeps the one-way vs
            round-trip logic aligned with the shared Workers contract.
          </p>
          <ul className="detail-list">
            <li>Pickup and dropoff locations are validated in the booking workspace.</li>
            <li>Airport locations surface note fields so pickup instructions stay attached to the draft.</li>
            <li>Round trips calculate rental hours from the entered return schedule.</li>
          </ul>
        </article>

        <article className="card">
          <p className="eyebrow">Step 2</p>
          <h2>Select your vehicle</h2>
          <p className="muted">
            Browse the live fleet preview, filter by category, and open the spotlighted vehicle detail before sending
            the booking draft.
          </p>
          <ul className="detail-list">
            <li>The current serverless catalog already exposes {vehicleCount} vehicles.</li>
            <li>{vehicleCategoryCount} categories are available for public filtering.</li>
            <li>Vehicle detail loads from the Workers API instead of the retired Next.js runtime.</li>
          </ul>
        </article>

        <article className="card">
          <p className="eyebrow">Step 3</p>
          <h2>Review and pay securely</h2>
          <p className="muted">
            After the draft is created, the Worker can create a Stripe checkout session and return to the hash-routed
            success or cancel page on static hosting.
          </p>
          <ul className="detail-list">
            <li>The checkout handoff is safe for Workers and keeps the booking reference in the return URL.</li>
            <li>Webhook confirmation is the next payment persistence slice.</li>
            <li>Users can reopen the booking workspace or fleet preview at any time.</li>
          </ul>
        </article>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <div className="section-title-row">
          <div>
            <h2>Frequently asked questions</h2>
            <p className="muted">The new guide keeps the most common legacy booking questions visible in one place.</p>
          </div>
        </div>

        <div className="card-grid">
          {faqItems.map((item) => (
            <article key={item.question} className="card">
              <h3 style={{ marginTop: 0 }}>{item.question}</h3>
              <p className="muted" style={{ marginBottom: 0 }}>
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <div className="section-title-row">
          <div>
            <h2>Ready to continue?</h2>
            <p className="muted">
              Jump into the live booking workspace or open the public fleet demo to keep exploring the migrated flow.
            </p>
          </div>
        </div>
        <div className="service-pills">
          <a className="primary-button primary-button--inline" href={bookingWorkspaceHref}>
            Open booking workspace
          </a>
          <a className="secondary-link" href={bookingLandingHref} style={{ minWidth: 0 }}>
            Open booking landing
          </a>
          <a className="secondary-link" href={fleetDemoHref} style={{ minWidth: 0 }}>
            Open public fleet
          </a>
          <a className="secondary-link" href="#/booking-demo" style={{ minWidth: 0 }}>
            Open booking demo
          </a>
          <a className="secondary-link" href="#/" style={{ minWidth: 0 }}>
            Back to homepage
          </a>
        </div>
      </section>
    </main>
  );
}
