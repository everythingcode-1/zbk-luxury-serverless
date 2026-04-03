/**
 * SEO Schema.org Structured Data for ZBK Limousine Tours
 * Based on car rental industry best practices and adapted for premium transport services
 */

export interface SEOMetadata {
  title: string
  description: string
  keywords: string[]
  ogImage?: string
  canonicalUrl?: string
}

/**
 * Organization Schema - Main company information
 */
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ZBK Limousine Tours",
  "alternateName": "ZBK Luxury Transport",
  "url": "https://www.zbktransportservices.com",
  "logo": "https://www.zbktransportservices.com/api/logo",
  "description": "Premium luxury car rental and chauffeur services in Singapore. Specializing in Toyota Alphard, Noah, and Hiace vehicles for airport transfers, corporate events, and special occasions.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Jurong West Street 65",
    "addressLocality": "Singapore",
    "postalCode": "640635",
    "addressCountry": "SG"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+65 9747 6453",
    "contactType": "Customer Service",
    "email": "zbklimo@gmail.com",
    "availableLanguage": ["English", "Indonesian"]
  },
  "sameAs": [
    "https://www.facebook.com/zbktransportservices",
    "https://www.instagram.com/zbktransportservices"
  ]
}

/**
 * Local Business Schema - Car Rental Service
 */
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "AutoRental",
  "name": "ZBK Limousine Tours",
  "image": "https://www.zbktransportservices.com/Hero.jpg",
  "description": "Premium car rental and chauffeur service specializing in luxury Toyota vehicles including Alphard, Noah, and Hiace for airport transfers and corporate transportation in Singapore.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Jurong West Street 65",
    "addressLocality": "Singapore",
    "postalCode": "640635",
    "addressCountry": "SG"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "1.3521",
    "longitude": "103.8198"
  },
  "priceRange": "$$$",
  "areaServed": {
    "@type": "City",
    "name": "Singapore"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    }
  ]
}

/**
 * Service Schema - Car Rental Services
 */
export const servicesSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Premium Car Rental and Chauffeur Service",
  "provider": {
    "@type": "Organization",
    "name": "ZBK Limousine Tours"
  },
  "areaServed": {
    "@type": "City",
    "name": "Singapore"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Premium Vehicle Services",
    "itemListElement": [
      {
        "@type": "OfferCatalog",
        "name": "Airport Transfer Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Changi Airport Transfer",
              "description": "Premium airport transfer service to and from Singapore Changi Airport"
            }
          }
        ]
      },
      {
        "@type": "OfferCatalog",
        "name": "Hourly Rental",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "6-Hour Rental",
              "description": "Half-day premium car rental with professional chauffeur"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "12-Hour Rental",
              "description": "Full-day premium car rental with professional chauffeur"
            }
          }
        ]
      }
    ]
  }
}

/**
 * Vehicle Product Schemas - Individual vehicles
 */
export const vehicleSchemas = {
  alphard: {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Toyota Alphard Rental",
    "description": "Luxury Toyota Alphard with premium seating for 6 passengers. Perfect for airport transfers, business meetings, and special occasions.",
    "brand": {
      "@type": "Brand",
      "name": "Toyota"
    },
    "model": "Alphard",
    "vehicleSeatingCapacity": 6,
    "vehicleTransmission": "Automatic",
    "fuelType": "Petrol",
    "image": "/4.-alphard-colors-black.png",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "SGD",
      "price": "80.00",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "80.00",
        "priceCurrency": "SGD",
        "referenceQuantity": {
          "@type": "QuantitativeValue",
          "value": "1",
          "unitText": "Trip"
        }
      },
      "availability": "https://schema.org/InStock",
      "url": "https://www.zbktransportservices.com/fleet"
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Luggage Capacity",
        "value": "4"
      },
      {
        "@type": "PropertyValue",
        "name": "Features",
        "value": "Premium Executive Seating, Captain Chairs, Entertainment System, WiFi, USB Charging"
      }
    ]
  },
  noah: {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Toyota Noah Rental",
    "description": "Comfortable Toyota Noah perfect for families and small groups. Seats 6 passengers with modern amenities.",
    "brand": {
      "@type": "Brand",
      "name": "Toyota"
    },
    "model": "Noah",
    "vehicleSeatingCapacity": 6,
    "vehicleTransmission": "Automatic",
    "fuelType": "Petrol",
    "image": "/4.-alphard-colors-black.png",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "SGD",
      "price": "75.00",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "75.00",
        "priceCurrency": "SGD",
        "referenceQuantity": {
          "@type": "QuantitativeValue",
          "value": "1",
          "unitText": "Trip"
        }
      },
      "availability": "https://schema.org/InStock",
      "url": "https://www.zbktransportservices.com/fleet"
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Luggage Capacity",
        "value": "4"
      },
      {
        "@type": "PropertyValue",
        "name": "Features",
        "value": "Comfortable Seating, Family Friendly, Air Conditioning, Entertainment System"
      }
    ]
  },
  combi: {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Toyota Hiace Combi Rental",
    "description": "Spacious Toyota Hiace Combi for larger groups. Seats up to 9 passengers with ample luggage space.",
    "brand": {
      "@type": "Brand",
      "name": "Toyota"
    },
    "model": "Hiace",
    "vehicleSeatingCapacity": 9,
    "vehicleTransmission": "Automatic",
    "fuelType": "Diesel",
    "image": "/4.-alphard-colors-black.png",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "SGD",
      "price": "90.00",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "90.00",
        "priceCurrency": "SGD",
        "referenceQuantity": {
          "@type": "QuantitativeValue",
          "value": "1",
          "unitText": "Trip"
        }
      },
      "availability": "https://schema.org/InStock",
      "url": "https://www.zbktransportservices.com/fleet"
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Luggage Capacity",
        "value": "8"
      },
      {
        "@type": "PropertyValue",
        "name": "Features",
        "value": "Large Group Transport, Spacious Interior, Air Conditioning, Professional Driver"
      }
    ]
  }
}

/**
 * FAQ Schema - Common questions about car rental
 */
export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much does it cost to rent a luxury car in Singapore?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Premium car rental in Singapore typically ranges from SGD 75-120 per trip for airport transfers, and SGD 360-720 for full-day rentals (6-12 hours). The exact price depends on the vehicle type (Alphard, Noah, or Hiace) and service selected. All prices include professional chauffeur service."
      }
    },
    {
      "@type": "Question",
      "name": "Do you provide airport transfer services from Changi Airport?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we provide premium airport transfer services to and from Singapore Changi Airport (all terminals). Our service includes flight monitoring, meet and greet at arrivals hall, luggage assistance, and direct transport to your destination. Book online or contact us 24/7."
      }
    },
    {
      "@type": "Question",
      "name": "What vehicles are available for rental?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We offer three premium Toyota vehicles: Toyota Alphard (6 passengers, luxury MPV), Toyota Noah (6 passengers, comfortable family vehicle), and Toyota Hiace Combi (9 passengers, group transport). All vehicles are well-maintained, air-conditioned, and come with professional chauffeurs."
      }
    },
    {
      "@type": "Question",
      "name": "How far in advance should I book?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We recommend booking at least 24-48 hours in advance to ensure vehicle availability. For airport transfers, booking can be made up to a few hours before your flight arrival, subject to availability. During peak seasons (holidays, F1 race week, major events), we recommend booking 7-14 days in advance."
      }
    },
    {
      "@type": "Question",
      "name": "Are your chauffeurs professional and licensed?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, all our chauffeurs are professionally trained, fully licensed, and have undergone background checks. They have extensive knowledge of Singapore's roads, speak English, and are committed to providing excellent service. Our chauffeurs are also trained in professional etiquette for corporate and VIP clients."
      }
    },
    {
      "@type": "Question",
      "name": "What is your cancellation policy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Cancellations made 24 hours or more before the scheduled pickup time receive a full refund. Cancellations within 24 hours may be subject to a cancellation fee. For airport transfers, if your flight is delayed or cancelled, we automatically adjust your booking at no extra charge."
      }
    },
    {
      "@type": "Question",
      "name": "Can I book hourly rental for business meetings?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we offer flexible hourly rental packages perfect for business meetings and corporate events. Choose from 6-hour or 12-hour packages. Our vehicles are equipped with WiFi, power outlets, and privacy features ideal for business travelers. We also offer corporate accounts with preferred rates for regular clients."
      }
    },
    {
      "@type": "Question",
      "name": "Do you provide child seats?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, child seats and booster seats are available upon request at the time of booking. Please specify the age and weight of your child so we can provide the appropriate safety seat. This service is provided at no additional charge."
      }
    }
  ]
}

/**
 * Breadcrumb Schema Generator
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@id": item.url,
        "name": item.name
      }
    }))
  }
}

/**
 * Article Schema Generator for Blog Posts
 */
export function generateArticleSchema(article: {
  title: string
  description: string
  author: string
  publishedAt: Date
  modifiedAt?: Date
  image: string
  url: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "ZBK Limousine Tours",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.zbktransportservices.com/api/logo"
      }
    },
    "datePublished": article.publishedAt.toISOString(),
    "dateModified": (article.modifiedAt || article.publishedAt).toISOString(),
    "image": article.image,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    }
  }
}

/**
 * Default SEO Metadata for different pages
 */
export const defaultSEO: Record<string, SEOMetadata> = {
  home: {
    title: "ZBK Limousine Tours - Premium Car Rental & Chauffeur Service in Singapore",
    description: "Experience luxury transport in Singapore with ZBK Limousine Tours. Premium Toyota Alphard, Noah, and Hiace rentals for airport transfers, corporate events, and special occasions. Professional chauffeur service available 24/7.",
    keywords: [
      "Singapore car rental",
      "luxury car rental Singapore",
      "Toyota Alphard rental",
      "airport transfer Singapore",
      "chauffeur service Singapore",
      "premium transport Singapore",
      "Changi airport transfer",
      "corporate car rental"
    ],
    ogImage: "/og-image-home.jpg"
  },
  fleet: {
    title: "Our Premium Fleet - Toyota Alphard, Noah & Hiace | ZBK Limousine Tours",
    description: "Browse our fleet of premium Toyota vehicles. Choose from luxury Alphard MPV, comfortable Noah, or spacious Hiace Combi. All vehicles feature professional chauffeurs, modern amenities, and competitive rates.",
    keywords: [
      "Toyota Alphard Singapore",
      "Toyota Noah rental",
      "Toyota Hiace Combi",
      "luxury MPV rental",
      "premium vehicle fleet",
      "Singapore car hire"
    ],
    ogImage: "/og-image-fleet.jpg"
  },
  services: {
    title: "Premium Transport Services - Airport Transfer & Hourly Rental | ZBK Limousine Tours",
    description: "Comprehensive luxury transport services in Singapore: Changi Airport transfers, hourly rentals, corporate transportation, wedding cars, and special event vehicles. Book online 24/7 with instant confirmation.",
    keywords: [
      "airport transfer service",
      "hourly car rental Singapore",
      "corporate transport",
      "wedding car rental",
      "business car service",
      "VIP transport Singapore"
    ],
    ogImage: "/og-image-services.jpg"
  },
  booking: {
    title: "Book Premium Car Rental Online - Instant Confirmation | ZBK Limousine Tours",
    description: "Book your premium car rental in Singapore with instant confirmation. Easy online booking for airport transfers, hourly rentals, and chauffeur services. Secure payment and flexible cancellation policy.",
    keywords: [
      "book car rental Singapore",
      "online car booking",
      "instant confirmation",
      "reserve luxury car",
      "Singapore transport booking"
    ],
    ogImage: "/og-image-booking.jpg"
  },
  blog: {
    title: "Car Rental Tips & Singapore Travel Guide | ZBK Limousine Tours Blog",
    description: "Expert advice on luxury car rentals, Singapore travel tips, business transport guides, and premium vehicle reviews. Stay informed with ZBK Limousine Tours' comprehensive blog.",
    keywords: [
      "car rental tips",
      "Singapore travel guide",
      "luxury transport blog",
      "business travel Singapore",
      "vehicle rental advice"
    ],
    ogImage: "/og-image-blog.jpg"
  }
}

/**
 * Generate complete SEO tags for a page
 */
export function generateSEOTags(page: keyof typeof defaultSEO, customData?: Partial<SEOMetadata>) {
  const seo = { ...defaultSEO[page], ...customData }
  
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords.join(', '),
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: [{ url: seo.ogImage || '/og-default.jpg' }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [seo.ogImage || '/og-default.jpg'],
    },
    alternates: {
      canonical: seo.canonicalUrl,
    },
  }
}










