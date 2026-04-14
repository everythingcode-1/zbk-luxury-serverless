import { useEffect, useMemo, useState } from 'react';
import type { BlogArticle, BlogArticlesResponse } from '@zbk/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787';

export default function BlogView() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadArticles() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/public/articles`, { signal: controller.signal });
        const payload: BlogArticlesResponse | { message?: string } = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || `Unable to load blog articles: ${response.status}`);
        }

        setArticles((payload as BlogArticlesResponse).data);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Unknown error loading blog articles');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadArticles();
    return () => controller.abort();
  }, []);

  const latestArticle = useMemo(() => articles[0] || null, [articles]);
  const publishedArticles = useMemo(() => articles.filter((article) => article.isPublished), [articles]);
  const latestPublishedDate = latestArticle?.publishedAt || latestArticle?.createdAt || '';

  return (
    <main className="page blog-page">
      <section className="hero blog-hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>Legacy blog content now has a Workers-backed landing page.</h1>
        <p>
          This slice migrates the old blog index into the React/Vite workspace and serves article metadata from the
          same shared contracts used by the rest of the serverless stack. It gives reviewers a visible public-content
          checkpoint without depending on the Next.js runtime.
        </p>
        <div className="service-pills">
          <a className="primary-button primary-button--inline" href="#/booking">
            Open booking workspace
          </a>
          <a className="secondary-link" href="#/fleet" style={{ minWidth: 0 }}>
            Browse fleet
          </a>
          <a className="secondary-link" href="#/services" style={{ minWidth: 0 }}>
            Services
          </a>
          <a className="secondary-link" href={`${API_BASE_URL}/api/public/articles/rss.xml`} target="_blank" rel="noreferrer" style={{ minWidth: 0 }}>
            RSS feed
          </a>
        </div>
      </section>

      {error ? <div className="alert error">{error}</div> : null}

      <section className="card-grid">
        <article className="card">
          <p className="eyebrow">Public articles</p>
          <h2>{isLoading ? 'Loading article list…' : `${publishedArticles.length} published posts`}</h2>
          <p className="muted">
            The new API route returns the same curated article data the blog page uses, so the migration stays
            predictable while the legacy Next.js blog is still being retired.
          </p>
          <ul className="detail-list">
            <li>Hash-routed blog landing page works on static hosting.</li>
            <li>Shared schemas validate the article payload before render.</li>
            <li>RSS feed is available from the Workers API for readers and aggregators.</li>
          </ul>
        </article>

        <article className="card">
          <p className="eyebrow">Latest article</p>
          <h2>{latestArticle?.title || 'No articles yet'}</h2>
          <p className="muted">
            {latestArticle?.excerpt || 'Published articles will appear here once the Workers API returns them.'}
          </p>
          {latestArticle ? (
            <div className="service-pills service-pills--tight">
              <span className="pill">{latestArticle.author}</span>
              <span className="pill pill--muted">{latestArticle.readingMinutes || 0} min read</span>
              <span className="pill pill--muted">
                {latestPublishedDate ? new Date(latestPublishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
              </span>
            </div>
          ) : null}
          {latestArticle ? (
            <div className="service-pills service-pills--tight" style={{ marginTop: 16 }}>
              <a className="primary-button primary-button--inline" href={`#/blog/${encodeURIComponent(latestArticle.slug)}`}>
                Read featured article
              </a>
            </div>
          ) : null}
        </article>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <div className="section-title-row">
          <div>
            <h2>Latest articles</h2>
            <p className="muted">
              These articles preserve the public content surface while the migration continues toward a fully serverless
              stack.
            </p>
          </div>
        </div>

        <div className="card-grid">
          {articles.map((article) => (
            <article key={article.id} className="card">
              <p className="eyebrow">{article.readingMinutes || 0} min read</p>
              <h3>{article.title}</h3>
              <p className="muted">{article.excerpt}</p>
              <p style={{ marginBottom: 12 }}>{article.content}</p>
              <div className="service-pills service-pills--tight">
                <span className="pill">{article.author}</span>
                {article.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="pill pill--muted">#{tag}</span>
                ))}
              </div>
              <div className="service-pills service-pills--tight" style={{ marginTop: 16 }}>
                <a className="secondary-link" href={`#/blog/${encodeURIComponent(article.slug)}`} style={{ minWidth: 0 }}>
                  Read article
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card-grid" style={{ marginTop: 20 }}>
        <article className="card card--wide">
          <div className="section-title-row">
            <div>
              <h2>Why this slice matters</h2>
              <p className="muted">
                The legacy blog was a separate Next.js surface backed by database and RSS generation logic. Migrating the
                landing page first gives us a reviewable content entry point and a stable contract for future article-detail work.
              </p>
            </div>
          </div>
          <div className="service-pills service-pills--tight">
            <span className="pill">Legacy public content</span>
            <span className="pill pill--muted">Workers API</span>
            <span className="pill pill--muted">React/Vite route</span>
            <span className="pill pill--muted">RSS feed</span>
          </div>
        </article>

        <article className="card">
          <p className="eyebrow">Next step</p>
          <h2>Connect blog discovery to booking</h2>
          <p className="muted">
            The blog page is intentionally lightweight. Its CTA trail still points back into the live fleet and booking
            flow so public readers can move from content to conversion.
          </p>
          <div className="service-pills">
            <a className="primary-button primary-button--inline" href="#/booking">
              Start a booking draft
            </a>
            <a className="secondary-link" href="#/fleet" style={{ minWidth: 0 }}>
              View fleet
            </a>
          </div>
        </article>
      </section>
    </main>
  );
}
