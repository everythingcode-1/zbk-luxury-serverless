type AboutStat = {
  value: string;
  label: string;
};

type AboutValue = {
  title: string;
  description: string;
};

const aboutStats: AboutStat[] = [
  { value: '24/7', label: 'support availability' },
  { value: '3', label: 'core service families' },
  { value: '1', label: 'serverless booking stack' },
];

const aboutValues: AboutValue[] = [
  {
    title: 'Excellence',
    description: 'Every touchpoint should feel premium, whether the user is browsing the fleet or completing a booking draft.',
  },
  {
    title: 'Integrity',
    description: 'The migration keeps the public content honest about what is live, what is transitional, and what still needs persistence.',
  },
  {
    title: 'Service',
    description: 'The new React/Vite pages preserve the helpful guidance and call-to-action structure from the legacy site.',
  },
  {
    title: 'Innovation',
    description: 'Workers-safe routes, hash navigation, and shared contracts replace the old Next.js runtime assumptions.',
  },
];

const aboutMilestones: string[] = [
  'Legacy about copy translated into a static-friendly React/Vite surface.',
  'Route-safe links connect the story page back into the live booking, fleet, services, and contact flows.',
  'The page stays compatible with Cloudflare Pages because it avoids server-only rendering features.',
];

export default function AboutView() {
  return (
    <main className="page about-page">
      <section className="hero about-hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>About ZBK Luxury now has a serverless-friendly home.</h1>
        <p>
          This slice lifts the legacy Next.js company-profile page into the React/Vite app so visitors can review the
          brand story, understand the service promise, and continue into the migrated booking flow without leaving the
          new stack.
        </p>
        <div className="service-pills">
          <a className="primary-button primary-button--inline" href="#/booking">
            Start a booking draft
          </a>
          <a className="secondary-link" href="#/fleet" style={{ minWidth: 0 }}>
            Browse public fleet
          </a>
          <a className="secondary-link" href="#/services" style={{ minWidth: 0 }}>
            Services
          </a>
          <a className="secondary-link" href="#/contact" style={{ minWidth: 0 }}>
            Contact
          </a>
        </div>
      </section>

      <section className="card-grid">
        <article className="card card--wide">
          <p className="eyebrow">Our story</p>
          <h2>Premium transport with a clearer migration path</h2>
          <p className="muted">
            The legacy about page focused on luxury service, dependable chauffeurs, and memorable journeys. The
            serverless version keeps that message visible while aligning the page structure to the new Workers + Vite
            architecture.
          </p>
          <p className="muted">
            Instead of a Node-rendered marketing page, reviewers now get a static-friendly route that looks and behaves
            like the rest of the migrated experience.
          </p>
          <div className="service-pills service-pills--tight">
            {aboutStats.map((stat) => (
              <span key={stat.label} className="pill">
                {stat.value} {stat.label}
              </span>
            ))}
          </div>
        </article>

        <article className="card">
          <p className="eyebrow">Why this matters</p>
          <h2>One more legacy surface is now visible in GitHub</h2>
          <ul className="detail-list">
            {aboutMilestones.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <div className="section-title-row">
          <div>
            <h2>Our core values</h2>
            <p className="muted">These are the same brand themes from the legacy page, now simplified for the React/Vite workspace.</p>
          </div>
        </div>

        <div className="card-grid">
          {aboutValues.map((value) => (
            <article key={value.title} className="card">
              <p className="eyebrow">{value.title}</p>
              <p style={{ marginBottom: 0 }}>{value.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <div className="section-title-row">
          <div>
            <h2>Continue the journey</h2>
            <p className="muted">
              The about route is intentionally lightweight and acts as a bridge back into the live public booking
              surfaces already migrated to Workers.
            </p>
          </div>
        </div>

        <div className="service-pills">
          <a className="primary-button primary-button--inline" href="#/booking">
            Open booking workspace
          </a>
          <a className="secondary-link" href="#/booking-demo" style={{ minWidth: 0 }}>
            Booking demo
          </a>
          <a className="secondary-link" href="#/my-bookings" style={{ minWidth: 0 }}>
            My bookings
          </a>
        </div>
      </section>
    </main>
  );
}
