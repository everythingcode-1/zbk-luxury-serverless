import { useEffect, useMemo, useState } from 'react';
import type { BlogArticle, BlogArticleResponse } from '@zbk/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787';

type BlogArticleViewProps = {
  slug: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function BlogArticleView({ slug }: BlogArticleViewProps) {
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadArticle() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/public/articles/${encodeURIComponent(slug)}`, {
          signal: controller.signal,
        });
        const payload: BlogArticleResponse | { message?: string } = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || `Unable to load blog article: ${response.status}`);
        }

        setArticle((payload as BlogArticleResponse).data);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Unknown error loading blog article');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadArticle();
    return () => controller.abort();
  }, [slug]);

  const publishedAt = article?.publishedAt || article?.createdAt || '';
  const primaryTag = useMemo(() => article?.tags?.[0] || 'blog', [article]);

  return (
    <main className="page blog-article-page">
      <section className="hero blog-article-hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>{article?.title || (isLoading ? 'Loading article…' : 'Blog article not found')}</h1>
        <p>
          This detail slice migrates the legacy article route into the React/Vite workspace and reads the content from
          the same Workers-backed public API used by the blog index and RSS feed.
        </p>
        <div className="service-pills">
          <a className="primary-button primary-button--inline" href="#/blog">
            Back to blog index
          </a>
          <a className="secondary-link" href="#/booking" style={{ minWidth: 0 }}>
            Open booking workspace
          </a>
          <a className="secondary-link" href="#/fleet" style={{ minWidth: 0 }}>
            Browse fleet
          </a>
        </div>
      </section>

      {isLoading ? <div className="card">Loading article detail…</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      {article ? (
        <article className="card card--wide blog-article-card">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">{primaryTag}</p>
              <h2>{article.title}</h2>
              <p className="muted">
                {article.author} • {article.readingMinutes || 0} min read • {publishedAt ? formatDate(publishedAt) : 'Recent'}
              </p>
            </div>
            <div className="service-pills service-pills--tight">
              <span className="pill">Published</span>
              {article.isPublished ? <span className="pill pill--muted">Live</span> : <span className="pill pill--muted">Draft</span>}
            </div>
          </div>

          <p className="blog-article__excerpt">{article.excerpt}</p>
          <p className="blog-article__content">{article.content}</p>

          <div className="service-pills service-pills--tight" style={{ marginTop: 20 }}>
            {article.tags.map((tag) => (
              <span key={tag} className="pill pill--muted">
                #{tag}
              </span>
            ))}
          </div>
        </article>
      ) : null}

      <section className="card-grid" style={{ marginTop: 20 }}>
        <article className="card">
          <p className="eyebrow">Why this matters</p>
          <h2>A content route the static stack can own</h2>
          <p className="muted">
            The legacy Next.js blog detail view depended on database and image helpers. This serverless version keeps the
            public article surface lightweight while preserving a reviewable migration target for readers and search.
          </p>
        </article>

        <article className="card">
          <p className="eyebrow">Next slice</p>
          <h2>Bring more legacy public pages across</h2>
          <p className="muted">
            With the article detail route in place, the remaining smaller content routes can follow the same hash-routed
            pattern without waiting on the legacy app.
          </p>
        </article>
      </section>
    </main>
  );
}
