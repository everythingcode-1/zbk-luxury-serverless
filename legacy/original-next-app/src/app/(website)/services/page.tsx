import type { Metadata } from 'next';
import Link from 'next/link';
import ServicesSection from "@/components/organisms/ServicesSection";
import Breadcrumb from '@/components/molecules/Breadcrumb';

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "ZBK Limousine Services Singapore",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Service",
        "name": "Airport Limousine Transfer",
        "description": "Premium limo service for reliable and punctual airport transfers at Changi Airport Singapore.",
        "provider": { "@type": "Organization", "name": "ZBK Limousine Tours" },
        "areaServed": "Singapore",
        "url": "https://www.zbktransportservices.com/services"
      }
    },
    {
      "@type": "ListItem",
      "position": 2,
      "item": {
        "@type": "Service",
        "name": "Hourly Limousine Rental",
        "description": "Flexible hourly limousine rental for city tours, sightseeing, and corporate use in Singapore.",
        "provider": { "@type": "Organization", "name": "ZBK Limousine Tours" },
        "areaServed": "Singapore",
        "url": "https://www.zbktransportservices.com/services"
      }
    },
    {
      "@type": "ListItem",
      "position": 3,
      "item": {
        "@type": "Service",
        "name": "Corporate Limousine Service",
        "description": "Professional limousine transportation for corporate events, business meetings, and executive travel in Singapore.",
        "provider": { "@type": "Organization", "name": "ZBK Limousine Tours" },
        "areaServed": "Singapore",
        "url": "https://www.zbktransportservices.com/services"
      }
    },
    {
      "@type": "ListItem",
      "position": 4,
      "item": {
        "@type": "Service",
        "name": "Wedding Limousine Service",
        "description": "Elegant wedding car and limousine rental for weddings and special occasions in Singapore.",
        "provider": { "@type": "Organization", "name": "ZBK Limousine Tours" },
        "areaServed": "Singapore",
        "url": "https://www.zbktransportservices.com/services"
      }
    }
  ]
};

export const metadata: Metadata = {
  title: "Premium Limousine Services - Airport Transfer, Hourly Rental & Corporate Transport | ZBK",
  description: "Comprehensive luxury limousine services in Singapore: Changi Airport transfers, hourly rentals, corporate transportation, wedding cars, and special events. Professional chauffeur service with Toyota Alphard, Noah & Hiace. Book 24/7.",
  keywords: [
    "limousine services Singapore",
    "airport transfer service",
    "hourly car rental Singapore",
    "corporate limousine service",
    "wedding car rental",
    "chauffeur service Singapore",
    "VIP transport Singapore",
    "business car service",
    "luxury transport services",
    "Changi airport limo"
  ],
  openGraph: {
    title: "Premium Limousine Services - Airport, Corporate & Special Events",
    description: "Professional limousine services in Singapore: Airport transfers, hourly rentals, corporate events, and special occasions. Premium Toyota vehicles with expert chauffeurs.",
    url: "https://www.zbktransportservices.com/services",
    siteName: "ZBK Limousine Tours",
    images: [
      {
        url: "/4.-alphard-colors-black.png",
        width: 1200,
        height: 630,
        alt: "ZBK Limousine Services - Premium Transport Solutions",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Limousine Services Singapore | ZBK",
    description: "Airport transfers, hourly rentals, corporate transport. Professional chauffeur service with luxury Toyota vehicles.",
    images: ["/4.-alphard-colors-black.png"],
  },
  alternates: {
    canonical: "https://www.zbktransportservices.com/services",
  },
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-off-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Services', href: '/services' }
        ]}
      />

      {/* Hero Section for Services */}
      <section className="relative bg-deep-navy py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Our Premium Services
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Enjoy luxury travel with our premium services. We go above and beyond to deliver comfort and style. Your journey, elevated.
            </p>
            <div className="w-24 h-1 bg-luxury-gold mx-auto rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <ServicesSection />

      {/* Additional Services Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-deep-navy mb-4">
              Additional Premium Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enhance your luxury experience with our exclusive additional services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
                title: "Professional Chauffeur",
                description: "Experienced and professional drivers for your comfort and safety",
                features: ["Licensed & Insured", "Local Area Expertise", "Multilingual Support"]
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Flexible Timing",
                description: "24/7 availability with flexible pickup and drop-off times",
                features: ["24/7 Availability", "Flexible Scheduling", "Last-minute Bookings"]
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Premium Insurance",
                description: "Comprehensive insurance coverage for complete peace of mind",
                features: ["Full Coverage", "Zero Deductible", "Roadside Assistance"]
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: "Delivery Service",
                description: "Vehicle delivery and pickup at your preferred location",
                features: ["Hotel Delivery", "Airport Pickup", "Home Service"]
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Express Service",
                description: "Fast-track booking and priority vehicle allocation",
                features: ["Priority Booking", "Express Check-in", "VIP Treatment"]
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
                title: "Concierge Service",
                description: "Personal assistance for reservations and recommendations",
                features: ["Restaurant Bookings", "Event Planning", "Local Recommendations"]
              }
            ].map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 bg-luxury-gold bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-luxury-gold">
                    {service.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-deep-navy mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-luxury-gold mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-deep-navy mb-4">
            Ready to Experience Luxury?
          </h2>
          <p className="text-lg text-deep-navy mb-8 opacity-80">
            Book your premium vehicle today and enjoy our exceptional services
          </p>
          <Link href="/booking" className="px-8 py-4 bg-deep-navy text-white rounded-compact hover:bg-charcoal transition-colors duration-300 font-semibold text-lg inline-block">
            Book Now
          </Link>
        </div>
      </section>
    </div>
  );
}
