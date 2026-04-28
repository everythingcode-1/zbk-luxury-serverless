import { useEffect } from 'react';

type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

type PageSeoProps = {
  title: string;
  description: string;
  canonicalUrl?: string;
  keywords?: string[];
  jsonLd?: JsonLdValue;
  noIndex?: boolean;
};

function setManagedMeta(
  documentRef: Document,
  selector: string,
  createAttributes: Record<string, string>,
  content: string | undefined,
) {
  const existing = documentRef.head.querySelector<HTMLMetaElement>(selector);

  if (existing) {
    const previousContent = existing.getAttribute('content');
    if (content) {
      existing.setAttribute('content', content);
    }

    return () => {
      if (previousContent === null) {
        existing.removeAttribute('content');
      } else {
        existing.setAttribute('content', previousContent);
      }
    };
  }

  if (!content) {
    return () => undefined;
  }

  const meta = documentRef.createElement('meta');
  Object.entries(createAttributes).forEach(([attributeName, attributeValue]) => {
    meta.setAttribute(attributeName, attributeValue);
  });
  meta.setAttribute('content', content);
  documentRef.head.appendChild(meta);

  return () => {
    meta.remove();
  };
}

function setManagedLink(documentRef: Document, rel: string, href: string | undefined) {
  const selector = `link[rel="${rel}"]`;
  const existing = documentRef.head.querySelector<HTMLLinkElement>(selector);

  if (existing) {
    const previousHref = existing.getAttribute('href');
    if (href) {
      existing.setAttribute('href', href);
    }

    return () => {
      if (previousHref === null) {
        existing.removeAttribute('href');
      } else {
        existing.setAttribute('href', previousHref);
      }
    };
  }

  if (!href) {
    return () => undefined;
  }

  const link = documentRef.createElement('link');
  link.setAttribute('rel', rel);
  link.setAttribute('href', href);
  documentRef.head.appendChild(link);

  return () => {
    link.remove();
  };
}

export default function PageSeo({ title, description, canonicalUrl, keywords, jsonLd, noIndex }: PageSeoProps) {
  useEffect(() => {
    const cleanupFns: Array<() => void> = [];
    const previousTitle = document.title;

    document.title = title;
    cleanupFns.push(() => {
      document.title = previousTitle;
    });

    cleanupFns.push(
      setManagedMeta(document, 'meta[name="description"]', { name: 'description' }, description),
      setManagedMeta(document, 'meta[name="keywords"]', { name: 'keywords' }, keywords?.join(', ')),
      setManagedLink(document, 'canonical', canonicalUrl),
      setManagedMeta(
        document,
        'meta[name="robots"]',
        { name: 'robots' },
        noIndex ? 'noindex, nofollow' : undefined,
      ),
    );

    return () => {
      cleanupFns.reverse().forEach((cleanup) => cleanup());
    };
  }, [canonicalUrl, description, keywords, noIndex, title]);

  if (!jsonLd) {
    return null;
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
