import { useState, type ChangeEvent, type FormEvent } from 'react';

type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const initialContactForm: ContactFormState = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

const contactCards: Array<{ title: string; content: string; href?: string }> = [
  {
    title: 'Address',
    content: 'Jurong West Street 65, ZBK Limousine Tours & Transportation Services, Singapura 640635',
  },
  {
    title: 'Phone',
    content: '+65 9747 6453',
    href: 'tel:+6597476453',
  },
  {
    title: 'Email',
    content: 'info@zbkluxury.com',
    href: 'mailto:info@zbkluxury.com',
  },
  {
    title: 'Hours',
    content: 'Mon - Sun: 24/7 Available',
  },
] as const;

export default function ContactView() {
  const [formData, setFormData] = useState<ContactFormState>(initialContactForm);
  const [submittedName, setSubmittedName] = useState('');

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedName(formData.name.trim() || 'there');
    setFormData(initialContactForm);
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>Contact support now lives in the React/Vite migration.</h1>
        <p>
          This page mirrors the legacy contact entry point with serverless-friendly links, 24/7 support details, and a
          lightweight inquiry form that keeps the interaction entirely inside the new static app.
        </p>
        <div className="service-pills">
          <a className="primary-button primary-button--inline" href="tel:+6597476453">
            Call +65 9747 6453
          </a>
          <a className="secondary-link" href="mailto:info@zbkluxury.com" style={{ minWidth: 0 }}>
            Email support
          </a>
          <a className="secondary-link" href="#/booking" style={{ minWidth: 0 }}>
            Book a ride
          </a>
          <a className="secondary-link" href="#/how-to-book" style={{ minWidth: 0 }}>
            How to book
          </a>
        </div>
      </section>

      {submittedName ? (
        <div className="alert success" style={{ marginBottom: 20 }}>
          Thanks {submittedName}! The local contact draft has been cleared, and the support entry point is ready for the
          next inquiry.
        </div>
      ) : null}

      <section className="card-grid">
        <article className="card card--wide">
          <div className="section-title-row">
            <div>
              <h2>Get in touch</h2>
              <p className="muted">
                The migration keeps the contact surface public, static-host friendly, and easy to reach from the booking
                flow.
              </p>
            </div>
          </div>

          <div className="card-grid">
            {contactCards.map((card) => (
              <article key={card.title} className="card">
                <p className="eyebrow">{card.title}</p>
                {card.href ? (
                  <a className="secondary-link" href={card.href} style={{ display: 'inline-flex', minWidth: 0 }}>
                    {card.content}
                  </a>
                ) : (
                  <p style={{ marginBottom: 0 }}>{card.content}</p>
                )}
              </article>
            ))}
          </div>

          <article className="card" style={{ marginTop: 20 }}>
            <h3 style={{ marginTop: 0 }}>Emergency support</h3>
            <p className="muted" style={{ marginBottom: 8 }}>
              For urgent assistance or roadside support, call our 24/7 line directly.
            </p>
            <p style={{ marginBottom: 0 }}>
              <strong>+65 9747 6453</strong>
            </p>
          </article>
        </article>

        <article className="card">
          <p className="eyebrow">Send a message</p>
          <h2>Start a contact draft</h2>
          <p className="muted">
            The legacy page used a client-side form without a backend handoff, so this serverless version keeps the same
            lightweight pattern while preserving the visible support flow.
          </p>

          <form onSubmit={handleSubmit} className="stack-form" style={{ display: 'grid', gap: 14 }}>
            <label className="field-group">
              <span className="field-label">Full name *</span>
              <input
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="text-input"
                placeholder="Your full name"
              />
            </label>

            <label className="field-group">
              <span className="field-label">Email address *</span>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="text-input"
                placeholder="your.email@example.com"
              />
            </label>

            <label className="field-group">
              <span className="field-label">Phone number</span>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="text-input"
                placeholder="+65 9747 6453"
              />
            </label>

            <label className="field-group">
              <span className="field-label">Subject *</span>
              <select
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="text-input"
              >
                <option value="">Select a subject</option>
                <option value="booking">New Booking</option>
                <option value="inquiry">General Inquiry</option>
                <option value="support">Customer Support</option>
                <option value="feedback">Feedback</option>
                <option value="partnership">Partnership</option>
              </select>
            </label>

            <label className="field-group">
              <span className="field-label">Message *</span>
              <textarea
                name="message"
                required
                rows={6}
                value={formData.message}
                onChange={handleChange}
                className="text-input"
                placeholder="Tell us about your inquiry or booking requirements..."
              />
            </label>

            <button type="submit" className="primary-button primary-button--inline" style={{ justifyContent: 'center' }}>
              Send message
            </button>
          </form>
        </article>
      </section>
    </main>
  );
}
