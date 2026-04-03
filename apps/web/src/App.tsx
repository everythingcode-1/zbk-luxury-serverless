import { useMemo, useState } from 'react';
import { computeBookingQuote, type BookingQuoteInput, serviceTypeOptions } from '@zbk/shared';

const initial: BookingQuoteInput = {
  serviceType: 'AIRPORT_TRANSFER',
  hours: 1,
  priceAirportTransfer: 80,
  price6Hours: 360,
  price12Hours: 720,
  pricePerHour: 75,
  additionalHours: 0,
};

export default function App() {
  const [state, setState] = useState<BookingQuoteInput>(initial);
  const quote = useMemo(() => computeBookingQuote(state), [state]);

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>React Pages UI siap terhubung ke Hono Workers API.</h1>
        <p>
          Ini shell awal migrasi dari legacy Next.js ke Cloudflare Pages + Workers.
        </p>
      </section>

      <section className="card-grid">
        <article className="card">
          <h2>Current migration state</h2>
          <ul>
            <li>Legacy app disimpan di folder <code>legacy/original-next-app</code></li>
            <li>Shared contract + pricing logic sudah diextract</li>
            <li>Hono API skeleton sudah aktif</li>
            <li>Neon + Drizzle schema sudah disiapkan</li>
          </ul>
        </article>

        <article className="card">
          <h2>Quote simulator</h2>
          <label>
            Service Type
            <select
              value={state.serviceType}
              onChange={(e) => setState((prev) => ({ ...prev, serviceType: e.target.value as BookingQuoteInput['serviceType'] }))}
            >
              {serviceTypeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label>
            Additional hours
            <input
              type="number"
              min={0}
              value={state.additionalHours}
              onChange={(e) => setState((prev) => ({ ...prev, additionalHours: Number(e.target.value) }))}
            />
          </label>

          <div className="quote-box">
            <strong>Total quote:</strong>
            <span>${quote.totalAmount.toFixed(2)}</span>
          </div>
          <p className="muted">Deposit 20%: ${quote.depositAmount.toFixed(2)}</p>
        </article>
      </section>
    </main>
  );
}
