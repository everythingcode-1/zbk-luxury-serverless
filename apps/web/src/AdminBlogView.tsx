import { useEffect, useMemo, useState } from 'react';
import type { AuthSession, BlogArticle, BlogArticlesResponse } from '@zbk/shared';
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

function StatusPill({ article }: { article: BlogArticle }) {
  return <span className={`pill ${article.isPublished ? '' : 'pill--muted'}`.trim()}>{article.isPublished ? 'Published' : 'Draft'}</span>;
}

export default function AdminBlogView() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [blog, setBlog] = useState<BlogArticlesResponse | null>(null);
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

    async function loadBlogSnapshot() {
      if (!sessionLoaded) return;

      if (!session || session.user.role !== 'ADMIN') {
        setBlog(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/admin/blog`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
          credentials: 'include',
        });
        const payload: BlogArticlesResponse | { message?: string } = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || `Admin blog snapshot failed: ${response.status}`);
        }

        setBlog(payload as BlogArticlesResponse);
      } catch (err) {
        if (controller.signal.aborted) return;
        setBlog(null);
        setError(err instanceof Error ? err.message : 'Unknown error loading admin blog snapshot');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadBlogSnapshot();
    return () => controller.abort();
  }, [refreshTick, session, sessionLoaded]);

  const articles = useMemo(
    () => [...(blog?.data ?? [])].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()),
    [blog],
  );

  const summary = useMemo(() => {
    const total = articles.length;
    const published = articles.filter((article) => article.isPublished).length;
    const drafts = total - published;
    const publishedThisMonth = articles.filter((article) => {
      if (!article.isPublished) return false;
      const publishedAt = article.publishedAt || article.updatedAt;
      const publishedDate = new Date(publishedAt);
      const now = new Date();
      return publishedDate.getMonth() === now.getMonth() && publishedDate.getFullYear() === now.getFullYear();
    }).length;
    const latestUpdatedAt = articles[0]?.updatedAt || blog?.meta.latestPublishedAt || '';

    return { total, published, drafts, publishedThisMonth, latestUpdatedAt };
  }, [articles, blog]);

  const latestArticle = articles[0] ?? null;
  const featuredArticle = articles.find((article) => article.isPublished) ?? latestArticle;
  const isAdmin = session?.user.role === 'ADMIN';

  return (
    <main className="page admin-dashboard-page">
      <section className="hero admin-dashboard-hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>Blog management now has a serverless content snapshot.</h1>
        <p>
          This slice brings the legacy admin blog screen into the React/Vite workspace as a read-only overview backed by
          the Workers blog article contract. It is intentionally inspection-first so reviewers can track the content
          migration without reopening the old Next.js CRUD stack.
        </p>
        <div className="service-pills">
          <a className="secondary-link" href="#/admin">
            Back to dashboard
          </a>
          <a className="secondary-link" href="#/admin/analysis">
            Analysis snapshot
          </a>
          <a className="secondary-link" href="#/admin/vehicles">
            Vehicle management
          </a>
          <a className="secondary-link" href="#/admin/bookings">
            Booking management
          </a>
          <a className="secondary-link" href="#/blog">
            Public blog
          </a>
          <button className="secondary-button admin-dashboard__refresh-button" type="button" onClick={() => setRefreshTick((tick) => tick + 1)}>
            Refresh blog snapshot
          </button>
        </div>
      </section>

      {!sessionLoaded ? <div className="card">Checking stored auth session…</div> : null}

      {sessionLoaded && !session ? (
        <div className="alert error">
          No stored auth session was found. Sign in with the admin demo account from the auth workspace to open the blog snapshot.
        </div>
      ) : null}

      {sessionLoaded && session && !isAdmin ? (
        <div className="alert error">
          The stored session belongs to {session.user.role}. Blog management access requires an ADMIN session.
        </div>
      ) : null}

      {error ? <div className="alert error">{error}</div> : null}

      <section className="card-grid admin-dashboard__summary-grid">
        <StatCard
          label="Auth session"
          value={session ? session.user.displayName : 'Signed out'}
          note={session ? `${session.user.role} • ${session.user.email}` : 'Sign in to inspect the blog snapshot.'}
        />
        <StatCard
          label="Articles"
          value={summary.total || '—'}
          note={summary.total ? `${summary.published} published • ${summary.drafts} drafts` : 'Loaded from the Workers seed blog catalog.'}
        />
        <StatCard
          label="Published this month"
          value={summary.publishedThisMonth || '—'}
          note={summary.total ? 'Useful for checking the content cadence during migration.' : 'The blog snapshot is still loading.'}
        />
        <StatCard
          label="Last updated"
          value={summary.latestUpdatedAt ? formatDateTime(summary.latestUpdatedAt) : '—'}
          note={blog?.meta.source ? `Source: ${blog.meta.source}` : 'Tracked from the Workers article response.'}
        />
      </section>

      <section className="card-grid" style={{ marginTop: 20 }}>
        <article className="card card--wide">
          <div className="section-title-row">
            <div>
              <h2>Latest article</h2>
              <p className="muted">
                The article list is still read-only, but it now has a dedicated admin inspection route that mirrors the legacy blog management entry point.
              </p>
            </div>
          </div>

          {latestArticle ? (
            <div>
              <h3>{latestArticle.title}</h3>
              <p className="muted">{latestArticle.excerpt}</p>
              <p style={{ marginBottom: 12 }}>{latestArticle.content}</p>
              <div className="service-pills service-pills--tight">
                <span className="pill">{latestArticle.author}</span>
                <StatusPill article={latestArticle} />
                <span className="pill pill--muted">{latestArticle.readingMinutes || 0} min read</span>
                <span className="pill pill--muted">Updated {formatDateTime(latestArticle.updatedAt)}</span>
              </div>
              <div className="service-pills service-pills--tight" style={{ marginTop: 16 }}>
                <a className="primary-button primary-button--inline" href={`#/blog/${encodeURIComponent(latestArticle.slug)}`}>
                  Open public article
                </a>
                {latestArticle.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="pill pill--muted">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="muted">{isLoading ? 'Loading blog articles…' : 'No blog articles are available yet.'}</p>
          )}
        </article>

        <article className="card">
          <p className="eyebrow">Public content flow</p>
          <h2>{featuredArticle ? featuredArticle.title : 'No featured article yet'}</h2>
          <p className="muted">
            {featuredArticle?.excerpt || 'The admin view still points readers into the public blog and booking flow.'}
          </p>
          {featuredArticle ? (
            <div className="service-pills service-pills--tight">
              <span className="pill">{featuredArticle.author}</span>
              <span className="pill pill--muted">{featuredArticle.isPublished ? 'Published' : 'Draft'}</span>
              <span className="pill pill--muted">{featuredArticle.readingMinutes || 0} min read</span>
            </div>
          ) : null}
          <div className="service-pills service-pills--tight" style={{ marginTop: 16 }}>
            <a className="secondary-link" href="#/booking" style={{ minWidth: 0 }}>
              Booking workspace
            </a>
            <a className="secondary-link" href="#/contact" style={{ minWidth: 0 }}>
              Contact
            </a>
            <a className="secondary-link" href={`${API_BASE_URL}/api/public/articles/rss.xml`} target="_blank" rel="noreferrer" style={{ minWidth: 0 }}>
              RSS feed
            </a>
          </div>
        </article>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <div className="section-title-row">
          <div>
            <h2>Recent articles</h2>
            <p className="muted">
              This read-only list gives the admin workflow a stable serverless landing zone while full post editing remains a later migration slice.
            </p>
          </div>
        </div>

        <div className="card-grid">
          {articles.map((article) => (
            <article key={article.id} className="card">
              <div className="service-pills service-pills--tight" style={{ marginBottom: 12 }}>
                <span className="pill">{article.author}</span>
                <StatusPill article={article} />
                <span className="pill pill--muted">{article.readingMinutes || 0} min read</span>
              </div>
              <h3>{article.title}</h3>
              <p className="muted">{article.excerpt}</p>
              <p className="muted" style={{ marginBottom: 12 }}>
                {article.slug} • updated {formatDateTime(article.updatedAt)}
              </p>
              <p style={{ marginBottom: 12 }}>{article.content}</p>
              <div className="service-pills service-pills--tight">
                {article.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="pill pill--muted">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="service-pills service-pills--tight" style={{ marginTop: 16 }}>
                <a className="secondary-link" href={`#/blog/${encodeURIComponent(article.slug)}`} style={{ minWidth: 0 }}>
                  View article
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
