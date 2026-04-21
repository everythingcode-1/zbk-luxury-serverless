import {
  heroSectionResponseSchema,
  heroSectionSchema,
  heroSectionsResponseSchema,
  type HeroSection,
} from '@zbk/shared';

const heroSectionSeeds = [
  {
    id: 'hero-home',
    headline: 'Premium Limousine Service in Singapore',
    description:
      'Professional limousine rental services with premium Toyota Alphard & Hiace. Experience luxury limo transportation for airport transfers, city tours, corporate events, and special occasions. Book your elegant ride today.',
    image: '/Hero.jpg',
    isActive: true,
    createdAt: '2026-03-18T08:15:00.000Z',
    updatedAt: '2026-04-21T08:30:00.000Z',
  },
  {
    id: 'hero-corporate',
    headline: 'Executive chauffeur support for corporate travel',
    description:
      'A legacy-inspired alternate hero section that highlights airport transfers, board meetings, and premium chauffeur coordination for enterprise clients.',
    image: '/Hero.jpg',
    isActive: false,
    createdAt: '2026-03-19T10:45:00.000Z',
    updatedAt: '2026-04-20T12:00:00.000Z',
  },
  {
    id: 'hero-airport',
    headline: 'Reliable airport transfer coverage with luxury fleet options',
    description:
      'A serverless-friendly snapshot of the legacy homepage variations, keeping the public hero contract ready for future editable persistence.',
    image: null,
    isActive: false,
    createdAt: '2026-03-20T13:10:00.000Z',
    updatedAt: '2026-04-19T09:20:00.000Z',
  },
] satisfies Array<HeroSection>;

const heroSections = heroSectionSeeds.map((heroSection) => heroSectionSchema.parse(heroSection));

function sortHeroSections(sections: HeroSection[]) {
  return [...sections].sort((left, right) => {
    if (left.isActive !== right.isActive) {
      return left.isActive ? -1 : 1;
    }

    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
}

export function getHeroSections() {
  return sortHeroSections(heroSections);
}

export function getActiveHeroSection() {
  return getHeroSections()[0] ?? heroSectionSchema.parse(heroSectionSeeds[0]);
}

export function buildHeroSectionResponse() {
  const activeHero = getActiveHeroSection();
  return heroSectionResponseSchema.parse({
    message: 'Loaded the Workers-backed hero section snapshot.',
    data: activeHero,
    meta: {
      source: 'seed-catalog',
      activeHeroId: activeHero.id,
      total: heroSections.length,
    },
  });
}

export function buildHeroSectionsResponse() {
  const sections = getHeroSections();
  const activeHero = sections.find((section) => section.isActive) ?? null;

  return heroSectionsResponseSchema.parse({
    message: 'Loaded the Workers-backed admin hero section snapshot.',
    data: sections,
    meta: {
      source: 'seed-catalog',
      activeHeroId: activeHero?.id ?? null,
      total: sections.length,
      activeCount: sections.filter((section) => section.isActive).length,
    },
  });
}
