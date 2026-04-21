type LegacyServiceHighlight = {
  id: string;
  title: string;
  description: string;
  features: string[];
};

const serviceHighlights: LegacyServiceHighlight[] = [
  {
    id: 'airport-transport',
    title: 'Airport Limousine Transfer',
    description:
      'Premium airport transfers with flight-aware pickup planning, chauffeur coordination, and the same polished presentation the legacy homepage used to promote.',
    features: ['Flight monitoring', 'Meet & greet', 'Professional chauffeurs'],
  },
  {
    id: 'city-tour-hourly',
    title: 'City Tour Limousine Rental',
    description:
      'Flexible hourly and city-tour transport that keeps the luxury fleet positioning visible while the booking workspace stays in the serverless stack.',
    features: ['Flexible hours', 'Local expertise', 'Competitive rates'],
  },
  {
    id: 'corporate-event',
    title: 'Corporate Limousine Service',
    description:
      'Executive-ready transport for conferences, meetings, and business functions with the premium service language ported from the original marketing pages.',
    features: ['Executive comfort', 'Business functions', 'Reliable service'],
  },
];

const trustSignals = ['Best price guarantee', 'Fully insured', 'Instant booking', '24/7 support'];

export default function HomepageLegacyHighlights() {
  return (
    <section className="card" style={{ marginTop: 20 }}>
      <div className="section-title-row">
        <div>
          <h2>Legacy homepage service highlights</h2>
          <p className="muted">
            The original marketing surface is now represented in the React/Vite app so public visitors still see the
            premium-service messaging while the booking flow runs on Workers.
          </p>
        </div>
        <span className="pill pill--muted">Homepage parity</span>
      </div>

      <div className="card-grid" style={{ marginTop: 16 }}>
        {serviceHighlights.map((service) => (
          <article key={service.id} className="card">
            <p className="eyebrow">Legacy service</p>
            <h3>{service.title}</h3>
            <p className="muted">{service.description}</p>
            <div className="service-pills" style={{ marginTop: 12 }}>
              {service.features.map((feature) => (
                <span key={feature} className="pill pill--muted">
                  {feature}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <p className="muted" style={{ marginBottom: 8 }}>
          Legacy trust signals, now shown alongside the serverless booking workspace.
        </p>
        <div className="service-pills">
          {trustSignals.map((signal) => (
            <span key={signal} className="pill">
              {signal}
            </span>
          ))}
        </div>
      </div>

      <div className="payment-return-actions" style={{ marginTop: 16 }}>
        <a className="primary-button primary-button--inline" href="#/services" style={{ width: 'auto', textDecoration: 'none' }}>
          Explore services
        </a>
        <a className="secondary-link" href="#/contact" style={{ minWidth: 0 }}>
          Contact support
        </a>
      </div>
    </section>
  );
}
