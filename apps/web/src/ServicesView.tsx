const serviceHighlights = [
  {
    title: 'Airport limousine transfer',
    eyebrow: 'Legacy service card',
    description:
      'Fast, punctual transfers to and from Changi Airport and other airport touchpoints, now surfaced as a static-friendly React/Vite page.',
    bullets: ['Flight-friendly pickup notes', 'Matches one-way airport trips', 'Pairs with live fleet availability'],
    match: 'Best matched vehicle categories: Executive and Group',
  },
  {
    title: 'Hourly limousine rental',
    eyebrow: 'Legacy service card',
    description:
      'Flexible hourly rentals for city rides, sightseeing, and long-form point-to-point travel in the new serverless stack.',
    bullets: ['Round-trip rental fits the booking quote flow', 'Supports a multi-hour service window', 'Works with the live booking workspace'],
    match: 'Best matched vehicle categories: Executive and Wedding',
  },
  {
    title: 'Corporate and special events',
    eyebrow: 'Legacy service card',
    description:
      'Executive transport, wedding cars, and event-day coordination for the same premium brand story that existed in the legacy Next.js app.',
    bullets: ['Dedicated chauffeur positioning', 'Useful for admin review and fleet planning', 'Creates a clean CTA into the migrated booking flow'],
    match: 'Best matched vehicle categories: Executive, Wedding, and Group',
  },
];

const supportTouchpoints = [
  '24/7 booking support with route-safe links back into the Vite app',
  'Airport pickup/drop-off notes stay aligned with the current booking draft contract',
  'Fleet and services pages now sit beside the booking workspace instead of the old Next.js router',
  'The page is intentionally static so it stays compatible with Cloudflare Workers + Vite hosting',
];

export default function ServicesView() {
  return (
    <main className="page services-page">
      <section className="hero services-hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>Public services now have a dedicated hash-routed page.</h1>
        <p>
          This slice migrates the legacy services landing page into the React/Vite workspace so visitors can review
          the offer structure, understand the booking pathways, and jump back into the Workers-backed fleet and
          booking flow without leaving the new stack.
        </p>
        <div className="service-pills">
          <a className="primary-button primary-button--inline" href="#/booking">
            Open booking workspace
          </a>
          <a className="secondary-link" href="#/fleet" style={{ minWidth: 0 }}>
            Browse public fleet
          </a>
          <a className="secondary-link" href="#/how-to-book" style={{ minWidth: 0 }}>
            How to book
          </a>
        </div>
      </section>

      <section className="card-grid">
        {serviceHighlights.map((service) => (
          <article key={service.title} className="card">
            <p className="eyebrow">{service.eyebrow}</p>
            <h2>{service.title}</h2>
            <p className="muted">{service.description}</p>
            <ul className="detail-list">
              {service.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <p className="muted" style={{ marginBottom: 0 }}>
              {service.match}
            </p>
          </article>
        ))}
      </section>

      <section className="card-grid" style={{ marginTop: 20 }}>
        <article className="card card--wide">
          <div className="section-title-row">
            <div>
              <h2>Why this page matters in the migration</h2>
              <p className="muted">
                The old Next.js services page was a mostly static marketing surface. Recreating it in the Vite app gives
                reviewers a visible public-content checkpoint without depending on Node-only rendering.
              </p>
            </div>
          </div>

          <div className="service-pills service-pills--tight">
            {supportTouchpoints.map((item) => (
              <span key={item} className="pill pill--muted">
                {item}
              </span>
            ))}
          </div>
        </article>

        <article className="card">
          <p className="eyebrow">Next step</p>
          <h2>Continue into the live booking flow</h2>
          <p className="muted">
            The services page is intentionally lightweight. Its purpose is to lead customers into the live fleet,
            booking, and payment slices already running in Workers.
          </p>
          <div className="service-pills">
            <a className="primary-button primary-button--inline" href="#/booking">
              Start a booking draft
            </a>
            <a className="secondary-link" href="#/booking-demo" style={{ minWidth: 0 }}>
              Try booking demo
            </a>
          </div>
        </article>
      </section>
    </main>
  );
}
