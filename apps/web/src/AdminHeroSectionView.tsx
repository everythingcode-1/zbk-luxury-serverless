import { useEffect, useMemo, useState } from 'react';
import type { AuthSession, HeroSection, HeroSectionsResponse } from '@zbk/shared';
import { AUTH_SESSION_STORAGE_KEY, loadAuthSessionFromApi, normalizeStoredSession } from './authSession';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787';

function formatDateTime(value: string) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      hour12: false,
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function StatCard({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <article className="admin-stat-card">
      <p className="eyebrow">{label}</p>
      <strong>{value}</strong>
      <p className="muted">{note}</p>
    </article>
  );
}

function HeroStatusPill({ hero }: { hero: HeroSection }) {
  return <span className={`pill ${hero.isActive ? '' : 'pill--muted'}`.trim()}>{hero.isActive ? 'Active' : 'Inactive'}</span>;
}

export default function AdminHeroSectionView() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [heroSections, setHeroSections] = useState<HeroSectionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const storedSession = normalizeStoredSession(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY));

    if (storedSession) {
      setSession(storedSession);
    }

    async function bootstrapSession() {
      try {
        const loadedSession = await loadAuthSessionFromApi(API_BASE_URL, controller.signal);
        if (controller.signal.aborted) return;

        if (loadedSession) {
          setSession(loadedSession);
          window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(loadedSession));
          return;
        }

        if (!storedSession) {
          setSession(null);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        if (!storedSession) {
          setError(err instanceof Error ? err.message : 'Unable to bootstrap the admin session from Workers.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setSessionLoaded(true);
        }
      }
    }

    void bootstrapSession();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadHeroSnapshot() {
      if (!sessionLoaded) return;

      if (!session || session.user.role !== 'ADMIN') {
        setHeroSections(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/admin/hero-section`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
          credentials: 'include',
        });
        const payload: HeroSectionsResponse | { message?: string } = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || `Admin hero snapshot failed: ${response.status}`);
        }

        setHeroSections(payload as HeroSectionsResponse);
      } catch (err) {
        if (controller.signal.aborted) return;
        setHeroSections(null);
        setError(err instanceof Error ? err.message : 'Unknown error loading hero section snapshot');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadHeroSnapshot();
    return () => controller.abort();
  }, [refreshTick, session, sessionLoaded]);

  const sections = heroSections?.data ?? [];
  const activeHero = useMemo(
    () => sections.find((section) => section.isActive) ?? sections[0] ?? null,
    [sections],
  );
  const latestUpdatedAt = useMemo(
    () => sections.reduce((latest, section) => (section.updatedAt > latest ? section.updatedAt : latest), ''),
    [sections],
  );
  const imageConfiguredCount = sections.filter((section) => Boolean(section.image)).length;
  const isAdmin = session?.user.role === 'ADMIN';

  return (
    <main className="page admin-dashboard-page">
      <section className="hero admin-dashboard-hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>Hero section management now has a serverless snapshot.</h1>
        <p>
          This slice ports the legacy homepage hero contract into the Workers stack as a read-only inspection route.
          It keeps the migration visible without reopening the old Next.js CRUD and upload workflow yet.
        </p>
        <div className="service-pills">
          <a className="secondary-link" href="#/admin">
            Back to dashboard
          </a>
          <a className="secondary-link" href="#/admin/blog">
            Blog management
          </a>
          <a className="secondary-link" href="#/admin/vehicles">
            Vehicle management
          </a>
          <a className="secondary-link" href="#/">
            Public home
          </a>
          <button className="secondary-button admin-dashboard__refresh-button" type="button" onClick={() => setRefreshTick((tick) => tick + 1)}>
            Refresh hero snapshot
          </button>
        </div>
      </section>

      {!sessionLoaded ? <div className="card">Checking stored auth session…</div> : null}

      {sessionLoaded && !session ? (
        <div className="alert error">
          No stored auth session was found. Sign in with the admin demo account from the auth workspace to open the hero snapshot.
        </div>
      ) : null}

      {sessionLoaded && session && !isAdmin ? (
        <div className="alert error">
          The stored session belongs to {session.user.role}. Hero section management access requires an ADMIN session.
        </div>
      ) : null}

      {error ? <div className="alert error">{error}</div> : null}

      <section className="card-grid admin-dashboard__summary-grid">
        <StatCard
          label="Auth session"
          value={session ? session.user.displayName : 'Signed out'}
          note={session ? `${session.user.role} • ${session.user.email}` : 'Sign in to inspect the hero snapshot.'}
        />
        <StatCard
          label="Hero sections"
          value={heroSections?.meta.total ?? '—'}
          note={heroSections ? `${heroSections.meta.activeCount} active • source ${heroSections.meta.source}` : 'Loaded from the Workers seed catalog.'}
        />
        <StatCard
          label="Active hero"
          value={activeHero ? activeHero.headline : '—'}
          note={activeHero ? `Hero id: ${activeHero.id}` : 'The active hero section has not loaded yet.'}
        />
        <StatCard
          label="Image coverage"
          value={heroSections ? `${imageConfiguredCount}/${sections.length}` : '—'}
          note="Shows how many legacy hero entries still point at an image path."
        />
        <StatCard
          label="Last updated"
          value={latestUpdatedAt ? formatDateTime(latestUpdatedAt) : '—'}
          note={heroSections ? 'Derived from the seed snapshot timestamps.' : 'Waiting for the hero snapshot to load.'}
        />
        <StatCard
          label="Source"
          value={heroSections ? 'Workers seed' : '—'}
          note={heroSections ? heroSections.meta.activeHeroId || 'No active hero id' : 'The response is fetched from the admin hero endpoint.'}
        />
      </section>

      <section className="card-grid" style={{ marginTop: 20 }}>
        <article className="card card--wide">
          <div className="section-title-row">
            <div>
              <h2>Active hero snapshot</h2>
              <p className="muted">
                The active record mirrors the public homepage hero contract. The image path is preserved for future asset migration.
              </p>
            </div>
            {activeHero ? <HeroStatusPill hero={activeHero} /> : <span className="pill pill--muted">No active hero</span>}
          </div>

          {activeHero ? (
            <div className="card-grid" style={{ gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', marginTop: 16 }}>
              <div>
                <h3>{activeHero.headline}</h3>
                <p className="muted" style={{ marginBottom: 16 }}>
                  {activeHero.description}
                </p>
                <div className="service-pills service-pills--tight">
                  <span className="pill">{activeHero.id}</span>
                  <span className="pill pill--muted">Created {formatDateTime(activeHero.createdAt)}</span>
                  <span className="pill pill--muted">Updated {formatDateTime(activeHero.updatedAt)}</span>
                </div>
              </div>

              <div className="admin-stat-card" style={{ minHeight: 180, justifyContent: 'space-between' }}>
                <div>
                  <p className="eyebrow">Hero image</p>
                  <strong>{activeHero.image || 'No image configured'}</strong>
                  <p className="muted">
                    {activeHero.image ? 'Legacy-compatible asset path preserved from the original Next.js hero data.' : 'This hero variant intentionally omits an image.'}
                  </p>
                </div>
                <div className="service-pills service-pills--tight">
                  <span className="pill pill--muted">Read-only slice</span>
                  <span className="pill pill--muted">Workers API</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="muted">The hero snapshot is still loading.</p>
          )}
        </article>

        <article className="card">
          <div className="section-title-row">
            <div>
              <h2>Migration note</h2>
              <p className="muted">This route is the first serverless bridge for the legacy homepage hero content-management surface.</p>
            </div>
          </div>

          <ul className="stack-list" style={{ marginTop: 0 }}>
            <li>Public hero data is now available from <code>/api/public/hero-section</code>.</li>
            <li>Admin inspection is now protected by the existing Workers auth session.</li>
            <li>CRUD, upload, and durable persistence remain for a future slice.</li>
          </ul>
        </article>
      </section>

      <section className="card-grid" style={{ marginTop: 20 }}>
        <article className="card card--wide">
          <div className="section-title-row">
            <div>
              <h2>All hero entries</h2>
              <p className="muted">The snapshot remains read-only, but it now exposes the full legacy-style hero list for review.</p>
            </div>
            <span className="pill pill--muted">{sections.length} records</span>
          </div>

          <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginTop: 16 }}>
            {sections.map((hero) => (
              <article key={hero.id} className="admin-stat-card" style={{ gap: 10 }}>
                <div className="section-title-row" style={{ alignItems: 'center' }}>
                  <HeroStatusPill hero={hero} />
                  <span className="pill pill--muted">{hero.id}</span>
                </div>
                <strong style={{ fontSize: '1rem', lineHeight: 1.4 }}>{hero.headline}</strong>
                <p className="muted" style={{ marginBottom: 0 }}>
                  {hero.description}
                </p>
                <div className="service-pills service-pills--tight">
                  <span className="pill pill--muted">{hero.image || 'image: none'}</span>
                  <span className="pill pill--muted">Updated {formatDateTime(hero.updatedAt)}</span>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
