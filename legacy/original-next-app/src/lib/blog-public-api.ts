import { z } from 'zod';

export interface NormalizedPublicArticleInput {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  tags: string[];
  images: string[];
  slug?: string;
}

export interface PublicArticleCreateData extends NormalizedPublicArticleInput {
  slug: string;
  isPublished: true;
  publishedAt: Date;
}

const publicArticleInputSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(10, 'Title must be at least 10 characters')
      .max(160, 'Title must be 160 characters or fewer'),
    excerpt: z
      .string()
      .trim()
      .min(50, 'Excerpt must be at least 50 characters')
      .max(300, 'Excerpt must be 300 characters or fewer'),
    content: z
      .string()
      .trim()
      .min(200, 'Content must be at least 200 characters'),
    author: z
      .string()
      .trim()
      .max(80, 'Author must be 80 characters or fewer')
      .optional(),
    tags: z
      .array(z.string().trim().max(40, 'Each tag must be 40 characters or fewer'))
      .optional(),
    images: z
      .array(z.string().trim().max(2048, 'Each image URL must be 2048 characters or fewer'))
      .optional(),
    slug: z
      .string()
      .trim()
      .max(160, 'Slug must be 160 characters or fewer')
      .optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const normalizedTags = dedupeNonEmpty(value.tags ?? []);
    const normalizedImages = dedupeNonEmpty(value.images ?? []);

    if (normalizedTags.length > 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tags'],
        message: 'Tags must contain 10 items or fewer',
      });
    }

    if (normalizedImages.length > 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['images'],
        message: 'Images must contain 5 items or fewer',
      });
    }

    normalizedImages.forEach((image, index) => {
      try {
        const parsedUrl = new URL(image);

        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['images', index],
            message: 'Image URLs must start with http:// or https://',
          });
        }
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['images', index],
          message: 'Each image must be a valid absolute URL',
        });
      }
    });
  });

function dedupeNonEmpty(values: string[]): string[] {
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value, index, allValues) => allValues.indexOf(value) === index);
}

export function parsePublicArticleInput(input: unknown): NormalizedPublicArticleInput {
  const parsed = publicArticleInputSchema.parse(input);

  return {
    title: parsed.title,
    excerpt: parsed.excerpt,
    content: parsed.content,
    author: parsed.author || 'ZBK AI Writer',
    tags: dedupeNonEmpty(parsed.tags ?? []),
    images: dedupeNonEmpty(parsed.images ?? []),
    slug: parsed.slug || undefined,
  };
}

export function normalizeSlugCandidate(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');

  return normalized || 'article';
}

export async function resolveUniqueSlug(
  baseSlug: string,
  slugExists: (slug: string) => Promise<boolean>,
): Promise<string> {
  let candidate = baseSlug;
  let counter = 1;

  while (await slugExists(candidate)) {
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return candidate;
}

export function createPublishedArticleData(
  input: NormalizedPublicArticleInput,
  slug: string,
  publishedAt = new Date(),
): PublicArticleCreateData {
  return {
    ...input,
    slug,
    isPublished: true,
    publishedAt,
  };
}

export function formatValidationErrors(error: z.ZodError): Record<string, string[]> {
  return error.issues.reduce<Record<string, string[]>>((details, issue) => {
    const key = issue.path.length > 0 ? issue.path.join('.') : 'body';
    details[key] ??= [];
    details[key].push(issue.message);
    return details;
  }, {});
}
