import { z } from 'zod';

import { prisma } from '../../../../lib/prisma';
import {
  createPublishedArticleData,
  formatValidationErrors,
  normalizeSlugCandidate,
  parsePublicArticleInput,
  resolveUniqueSlug,
  type PublicArticleCreateData,
} from '../../../../lib/blog-public-api';

interface CreatedPublicArticleRecord {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  publishedAt: Date | null;
}

export interface PublicArticleRouteDeps {
  articleApiToken?: string;
  now?: () => Date;
  findPostBySlug: (slug: string) => Promise<{ id: string } | null>;
  createPost: (data: PublicArticleCreateData) => Promise<CreatedPublicArticleRecord>;
}

function extractBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

export function buildPublicArticlesPostHandler(deps: PublicArticleRouteDeps) {
  return async function POST(request: Request): Promise<Response> {
    if (!deps.articleApiToken) {
      return Response.json(
        {
          success: false,
          error: 'ARTICLE_API_TOKEN is not configured on the server',
        },
        { status: 500 },
      );
    }

    const bearerToken = extractBearerToken(request.headers.get('Authorization'));

    if (bearerToken !== deps.articleApiToken) {
      return Response.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 },
      );
    }

    const contentType = request.headers.get('Content-Type');

    if (!contentType || !contentType.toLowerCase().includes('application/json')) {
      return Response.json(
        {
          success: false,
          error: 'Validation failed',
          details: {
            body: ['Content-Type must be application/json'],
          },
        },
        { status: 400 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        {
          success: false,
          error: 'Validation failed',
          details: {
            body: ['Request body must be valid JSON'],
          },
        },
        { status: 400 },
      );
    }

    try {
      const input = parsePublicArticleInput(body);
      const slugBase = normalizeSlugCandidate(input.slug ?? input.title);
      const slug = await resolveUniqueSlug(
        slugBase,
        async (candidate) => Boolean(await deps.findPostBySlug(candidate)),
      );
      const post = await deps.createPost(
        createPublishedArticleData(input, slug, deps.now ? deps.now() : new Date()),
      );

      return Response.json(
        {
          success: true,
          message: 'Article published successfully',
          data: {
            id: post.id,
            title: post.title,
            slug: post.slug,
            isPublished: post.isPublished,
            publishedAt: post.publishedAt,
            url: `/blog/${post.slug}`,
          },
        },
        { status: 201 },
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Response.json(
          {
            success: false,
            error: 'Validation failed',
            details: formatValidationErrors(error),
          },
          { status: 400 },
        );
      }

      console.error('Error publishing article via public API:', error);

      return Response.json(
        {
          success: false,
          error: 'Failed to publish article',
        },
        { status: 500 },
      );
    }
  };
}

export const POST = buildPublicArticlesPostHandler({
  articleApiToken: process.env.ARTICLE_API_TOKEN,
  now: () => new Date(),
  findPostBySlug: async (slug) =>
    prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true },
    }),
  createPost: async (data) =>
    prisma.blogPost.create({
      data,
      select: {
        id: true,
        title: true,
        slug: true,
        isPublished: true,
        publishedAt: true,
      },
    }),
});
