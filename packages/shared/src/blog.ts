import { z } from 'zod';

export const blogArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  content: z.string(),
  imageUrl: z.string().url().optional(),
  author: z.string(),
  isPublished: z.boolean(),
  tags: z.array(z.string()).default([]),
  publishedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  readingMinutes: z.number().int().positive().optional(),
});

export type BlogArticle = z.infer<typeof blogArticleSchema>;

export const blogArticlesResponseSchema = z.object({
  message: z.string(),
  data: z.array(blogArticleSchema),
  meta: z.object({
    total: z.number().int().nonnegative(),
    source: z.string(),
    latestPublishedAt: z.string().optional(),
  }),
});

export type BlogArticlesResponse = z.infer<typeof blogArticlesResponseSchema>;
