import { z } from 'zod';

export const heroSectionSchema = z.object({
  id: z.string(),
  headline: z.string(),
  description: z.string(),
  image: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type HeroSection = z.infer<typeof heroSectionSchema>;

export const heroSectionResponseSchema = z.object({
  message: z.string(),
  data: heroSectionSchema,
  meta: z.object({
    source: z.string(),
    activeHeroId: z.string().nullable(),
    total: z.number().int().nonnegative(),
  }),
});

export type HeroSectionResponse = z.infer<typeof heroSectionResponseSchema>;

export const heroSectionsResponseSchema = z.object({
  message: z.string(),
  data: z.array(heroSectionSchema),
  meta: z.object({
    source: z.string(),
    activeHeroId: z.string().nullable(),
    total: z.number().int().nonnegative(),
    activeCount: z.number().int().nonnegative(),
  }),
});

export type HeroSectionsResponse = z.infer<typeof heroSectionsResponseSchema>;
