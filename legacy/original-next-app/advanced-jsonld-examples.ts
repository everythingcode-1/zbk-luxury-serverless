/**
 * Advanced JSON-LD Structured Data Examples
 * For Future SEO Optimization
 * 
 * Usage: Copy dan paste ke layout.tsx atau page-specific layout
 * sesuai kebutuhan untuk meningkatkan SEO
 */

// =================================================================
// 1. ORGANIZATION WITH COMPLETE INFO (Untuk Homepage)
// =================================================================
export const organizationWithContactInfo = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ZBK Limo Tours",
  "alternateName": "ZBK Transport Services",
  "url": "https://www.zbktransportservices.com",
  "logo": "https://www.zbktransportservices.com/logo-website.png",
  "image": "https://www.zbktransportservices.com/logo-website.png",
  "description": "Premium Toyota Alphard & Hiace rental for Airport Transfers, City Tours, and Special Events. Experience luxury transportation tailored to your needs.",
  
  // Contact Information
  "telephone": "+65-XXXX-XXXX", // Ganti dengan nomor aktual
  "email": "contact@zbktransportservices.com", // Ganti dengan email aktual
  
  // Address
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Your Street Address",
    "addressLocality": "Singapore",
    "addressRegion": "Singapore",
    "postalCode": "XXXXXX",
    "addressCountry": "SG"
  },
  
  // Contact Point dengan jam operasional
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+65-XXXX-XXXX",
    "contactType": "customer service",
    "areaServed": ["SG", "MY"],
    "availableLanguage": ["en", "id", "zh"],
    "hoursAvailable": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    }
  },
  
  // Social Media
  "sameAs": [
    "https://www.facebook.com/zbklimotours",
    "https://www.instagram.com/zbklimotours",
    "https://www.linkedin.com/company/zbklimotours",
    "https://twitter.com/zbklimotours"
  ],
  
  // Additional Info
  "founder": {
    "@type": "Person",
    "name": "ZBK Limo Tours"
  },
  "foundingDate": "2020",
  "slogan": "Premium Luxury Transportation Services",
  
  // Services Offered
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Transportation Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Airport Transfer",
          "description": "Premium airport transfer with Toyota Alphard"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "City Tour",
          "description": "Luxury city tour with professional chauffeur"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Corporate Transport",
          "description": "Premium corporate transportation services"
        }
      }
    ]
  }
};

// =================================================================
// 2. LOCAL BUSINESS (Jika ada lokasi fisik)
// =================================================================
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "ZBK Limo Tours",
  "image": "https://www.zbktransportservices.com/logo-website.png",
  "url": "https://www.zbktransportservices.com",
  "telephone": "+65-XXXX-XXXX",
  "email": "contact@zbktransportservices.com",
  "priceRange": "$$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Your Street Address",
    "addressLocality": "Singapore",
    "postalCode": "XXXXXX",
    "addressCountry": "SG"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 1.3521, // Ganti dengan koordinat aktual
    "longitude": 103.8198 // Ganti dengan koordinat aktual
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ],
    "opens": "00:00",
    "closes": "23:59"
  },
  // Rating jika ada
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "150"
  }
};

// =================================================================
// 3. SERVICE SCHEMA (Untuk halaman Services)
// =================================================================
export const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Premium Car Rental",
  "provider": {
    "@type": "Organization",
    "name": "ZBK Limo Tours",
    "url": "https://www.zbktransportservices.com"
  },
  "areaServed": {
    "@type": "Country",
    "name": ["Singapore", "Malaysia"]
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Transportation Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Toyota Alphard Rental",
          "description": "Luxury 7-seater van with premium amenities"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Toyota Hiace Rental",
          "description": "Spacious 12-seater van for group travel"
        }
      }
    ]
  }
};

// =================================================================
// 4. BREADCRUMB SCHEMA (Untuk navigasi)
// =================================================================
export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

// Example usage:
// const fleetBreadcrumb = breadcrumbSchema([
//   { name: "Home", url: "https://www.zbktransportservices.com" },
//   { name: "Fleet", url: "https://www.zbktransportservices.com/fleet" }
// ]);

// =================================================================
// 5. FAQ SCHEMA (Untuk halaman FAQ atau sections dengan Q&A)
// =================================================================
export const faqSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// Example usage:
// const transportFAQs = faqSchema([
//   {
//     question: "What types of vehicles do you offer?",
//     answer: "We offer premium Toyota Alphard and Toyota Hiace vehicles..."
//   },
//   {
//     question: "Do you provide airport transfer services?",
//     answer: "Yes, we provide 24/7 airport transfer services..."
//   }
// ]);

// =================================================================
// 6. PRODUCT SCHEMA (Untuk halaman individual vehicle/service)
// =================================================================
export const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Toyota Alphard Premium Rental",
  "image": "https://www.zbktransportservices.com/vehicles/alphard.jpg",
  "description": "Premium 7-seater Toyota Alphard with luxury amenities",
  "brand": {
    "@type": "Brand",
    "name": "Toyota"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://www.zbktransportservices.com/fleet/alphard",
    "priceCurrency": "SGD",
    "price": "150",
    "priceSpecification": {
      "@type": "PriceSpecification",
      "price": "150",
      "priceCurrency": "SGD",
      "unitText": "per day"
    },
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "ZBK Limo Tours"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "85"
  }
};

// =================================================================
// 7. WEBSITE SCHEMA (Untuk search box di Google)
// =================================================================
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": "https://www.zbktransportservices.com",
  "name": "ZBK Limo Tours",
  "description": "Premium Luxury Transportation Services",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.zbktransportservices.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

// =================================================================
// 8. ARTICLE SCHEMA (Untuk blog posts)
// =================================================================
export const articleSchema = (article: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  author: string;
  url: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": article.title,
  "description": article.description,
  "image": article.image,
  "datePublished": article.datePublished,
  "dateModified": article.dateModified,
  "author": {
    "@type": "Person",
    "name": article.author
  },
  "publisher": {
    "@type": "Organization",
    "name": "ZBK Limo Tours",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.zbktransportservices.com/logo-website.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": article.url
  }
});

// =================================================================
// 9. REVIEW SCHEMA (Untuk testimonials)
// =================================================================
export const reviewSchema = (reviews: {
  author: string;
  rating: number;
  reviewBody: string;
  datePublished: string;
}[]) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ZBK Limo Tours",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": reviews.length.toString()
  },
  "review": reviews.map(review => ({
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": review.author
    },
    "datePublished": review.datePublished,
    "reviewBody": review.reviewBody,
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating.toString()
    }
  }))
});

// =================================================================
// 10. EVENT SCHEMA (Jika ada events/promotions)
// =================================================================
export const eventSchema = {
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "ZBK Limo Tours - Special Promotion",
  "startDate": "2025-01-01T00:00",
  "endDate": "2025-01-31T23:59",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "eventStatus": "https://schema.org/EventScheduled",
  "location": {
    "@type": "Place",
    "name": "Singapore",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Singapore",
      "addressCountry": "SG"
    }
  },
  "image": "https://www.zbktransportservices.com/promotions/january-sale.jpg",
  "description": "Special promotion for premium car rentals",
  "organizer": {
    "@type": "Organization",
    "name": "ZBK Limo Tours",
    "url": "https://www.zbktransportservices.com"
  }
};

// =================================================================
// USAGE EXAMPLES
// =================================================================

/**
 * Example 1: Add to specific page layout
 * 
 * File: src/app/fleet/layout.tsx
 * 
 * export default function FleetLayout({ children }) {
 *   return (
 *     <>
 *       <script
 *         type="application/ld+json"
 *         dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
 *       />
 *       {children}
 *     </>
 *   );
 * }
 */

/**
 * Example 2: Multiple schemas on one page
 * 
 * const schemas = [organizationWithContactInfo, websiteSchema];
 * 
 * return (
 *   <html>
 *     <head>
 *       {schemas.map((schema, index) => (
 *         <script
 *           key={index}
 *           type="application/ld+json"
 *           dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
 *         />
 *       ))}
 *     </head>
 *     <body>{children}</body>
 *   </html>
 * );
 */

/**
 * Example 3: Dynamic breadcrumb
 * 
 * const pathname = usePathname();
 * const breadcrumb = breadcrumbSchema([
 *   { name: "Home", url: "https://www.zbktransportservices.com" },
 *   { name: "Fleet", url: "https://www.zbktransportservices.com/fleet" },
 *   { name: "Alphard", url: `https://www.zbktransportservices.com${pathname}` }
 * ]);
 */

export default {
  organizationWithContactInfo,
  localBusinessSchema,
  serviceSchema,
  breadcrumbSchema,
  faqSchema,
  productSchema,
  websiteSchema,
  articleSchema,
  reviewSchema,
  eventSchema
};













