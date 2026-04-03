import type { Metadata } from 'next';
import Image from 'next/image';
import Breadcrumb from '@/components/molecules/Breadcrumb';

export const metadata: Metadata = {
  title: "About ZBK Limousine Tours - Premium Luxury Transport in Singapore",
  description: "Learn about ZBK Limousine Tours, Singapore's premier luxury car rental service. Discover our story, mission, vision, and commitment to excellence in premium transportation with Toyota Alphard, Noah, and Hiace vehicles.",
  keywords: [
    "about ZBK Limousine",
    "luxury transport Singapore",
    "premium car rental company",
    "ZBK company profile",
    "Singapore limousine service",
    "professional chauffeur service",
    "luxury vehicle rental Singapore"
  ],
  openGraph: {
    title: "About ZBK Limousine Tours - Premium Luxury Transport",
    description: "Discover ZBK Limousine Tours' commitment to excellence in luxury transportation. Premium Toyota vehicles, professional service, and unforgettable journeys in Singapore.",
    url: "https://www.zbktransportservices.com/about",
    siteName: "ZBK Limousine Tours",
    images: [
      {
        url: "/2025-01-31.webp",
        width: 1200,
        height: 630,
        alt: "ZBK Limousine Tours - About Us",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About ZBK Limousine Tours - Premium Luxury Transport",
    description: "Learn about Singapore's premier luxury car rental service with Toyota Alphard, Noah, and Hiace vehicles.",
    images: ["/2025-01-31.webp"],
  },
  alternates: {
    canonical: "https://www.zbktransportservices.com/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-off-white">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'About Us', href: '/about' }
        ]}
      />

      {/* Hero Section */}
      <section className="relative bg-deep-navy py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              About ZBK Luxury
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Redefining luxury travel with premium vehicles, exceptional service, 
              and an unwavering commitment to excellence since our inception.
            </p>
            <div className="w-24 h-1 bg-luxury-gold mx-auto rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-deep-navy mb-6">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Founded with a vision to transform the luxury car rental experience, ZBK Luxury 
                has been serving discerning clients worldwide with an unmatched 
                commitment to excellence.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                What started as a passion for luxury automobiles has evolved into a premier 
                car rental service that combines the finest vehicles with personalized service, 
                creating memorable experiences for every journey.
              </p>
              <p className="text-lg text-gray-600">
                Today, we continue to set new standards in luxury travel, ensuring that every 
                client receives not just a vehicle, but a gateway to extraordinary experiences.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden">
                <Image
                  src="/2025-01-31.webp"
                  alt="ZBK Luxury Car Rental Story"
                  width={600}
                  height={450}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-deep-navy mb-4">
              Our Mission & Vision
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <div className="w-12 h-12 bg-luxury-gold bg-opacity-10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-deep-navy mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To provide exceptional luxury car rental experiences that exceed expectations, 
                combining premium vehicles with personalized service to create unforgettable 
                journeys for our valued clients.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-lg">
              <div className="w-12 h-12 bg-luxury-gold bg-opacity-10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-deep-navy mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To be the leading luxury car rental service, recognized for our commitment 
                to excellence, innovation, and creating extraordinary travel experiences 
                that inspire and delight our clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-deep-navy mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do and define who we are
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                ),
                title: "Excellence",
                description: "We strive for perfection in every aspect of our service"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Integrity",
                description: "Honest, transparent, and ethical in all our dealings"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
                title: "Passion",
                description: "Genuine love for luxury automobiles and exceptional service"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                ),
                title: "Innovation",
                description: "Continuously improving and adapting to exceed expectations"
              }
            ].map((value, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-luxury-gold bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-20 transition-colors duration-300">
                  <div className="text-luxury-gold">
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-deep-navy mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
