import type { Metadata } from 'next';
import FleetSection from "@/components/organisms/FleetSection";
import Breadcrumb from '@/components/molecules/Breadcrumb';

const vehicleSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "ZBK Limousine Fleet — Singapore",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Product",
        "name": "Toyota Alphard Limousine",
        "description": "Premium executive MPV with captain chairs, 6 passenger capacity. Ideal for airport transfers and corporate travel in Singapore.",
        "brand": { "@type": "Brand", "name": "Toyota" },
        "offers": {
          "@type": "Offer",
          "priceCurrency": "SGD",
          "availability": "https://schema.org/InStock",
          "seller": { "@type": "Organization", "name": "ZBK Limousine Tours" }
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 2,
      "item": {
        "@type": "Product",
        "name": "Toyota Noah Limousine",
        "description": "Comfortable family MPV with 6 passenger capacity. Perfect for family trips and city tours in Singapore.",
        "brand": { "@type": "Brand", "name": "Toyota" },
        "offers": {
          "@type": "Offer",
          "priceCurrency": "SGD",
          "availability": "https://schema.org/InStock",
          "seller": { "@type": "Organization", "name": "ZBK Limousine Tours" }
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 3,
      "item": {
        "@type": "Product",
        "name": "Toyota Hiace Combi",
        "description": "Spacious minibus with 9 passenger capacity and generous luggage space. Ideal for large group transport in Singapore.",
        "brand": { "@type": "Brand", "name": "Toyota" },
        "offers": {
          "@type": "Offer",
          "priceCurrency": "SGD",
          "availability": "https://schema.org/InStock",
          "seller": { "@type": "Organization", "name": "ZBK Limousine Tours" }
        }
      }
    }
  ]
};

export const metadata: Metadata = {
  title: "Premium Fleet - Toyota Alphard, Noah & Hiace Limousine Rental | ZBK Singapore",
  description: "Browse ZBK's premium fleet of luxury Toyota vehicles in Singapore. Choose from Alphard MPV (6 seats), Noah (6 seats), or Hiace Combi (9 seats). All vehicles feature professional chauffeurs, modern amenities, and competitive rates. Book online now.",
  keywords: [
    "Toyota Alphard rental Singapore",
    "Toyota Noah rental",
    "Toyota Hiace Combi",
    "luxury MPV rental Singapore",
    "premium vehicle fleet",
    "6 seater limousine",
    "9 seater van rental",
    "Singapore luxury car fleet",
    "executive car rental",
    "family car rental Singapore"
  ],
  openGraph: {
    title: "Premium Fleet - Toyota Alphard, Noah & Hiace | ZBK Limousine",
    description: "Explore our fleet of premium Toyota vehicles. Luxury Alphard MPV, comfortable Noah, and spacious Hiace Combi with professional chauffeurs.",
    url: "https://www.zbktransportservices.com/fleet",
    siteName: "ZBK Limousine Tours",
    images: [
      {
        url: "/4.-alphard-colors-black.png",
        width: 1200,
        height: 630,
        alt: "ZBK Premium Fleet - Toyota Alphard, Noah, Hiace",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Fleet - Toyota Alphard, Noah & Hiace | ZBK",
    description: "Luxury Toyota vehicles with professional chauffeurs. Alphard, Noah, and Hiace available for rent in Singapore.",
    images: ["/4.-alphard-colors-black.png"],
  },
  alternates: {
    canonical: "https://www.zbktransportservices.com/fleet",
  },
};

export default function FleetPage() {
  return (
    <div className="min-h-screen bg-off-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleSchema) }}
      />
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Our Fleet', href: '/fleet' }
        ]}
      />

      {/* Hero Section for Fleet */}
      <section className="relative bg-deep-navy py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Our Premium Fleet
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Discover our collection of luxury vehicles, each meticulously maintained 
              and equipped with premium features for your ultimate comfort and style.
            </p>
            <div className="w-24 h-1 bg-luxury-gold mx-auto rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Fleet Section */}
      <FleetSection showAll={true} />

      {/* Fleet Features Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-deep-navy mb-4">
              Why Choose Our Fleet
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every vehicle in our fleet meets the highest standards of luxury, safety, and performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Premium Quality",
                description: "All vehicles are regularly maintained and inspected for optimal performance"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "24/7 Support",
                description: "Round-the-clock customer support and roadside assistance"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: "Flexible Pickup",
                description: "Convenient pickup and drop-off locations across the city"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                ),
                title: "Competitive Rates",
                description: "Transparent pricing with no hidden fees or surprise charges"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-luxury-gold bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-20 transition-colors duration-300">
                  <div className="text-luxury-gold">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-deep-navy mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
