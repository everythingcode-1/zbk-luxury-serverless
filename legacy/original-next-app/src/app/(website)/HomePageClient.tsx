'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Hero from "@/components/organisms/Hero";
import FleetSection from "@/components/organisms/FleetSection";
import ServicesSection from "@/components/organisms/ServicesSection";
import Link from 'next/link';

const TestimonialsSection = dynamic(() => import("@/components/organisms/TestimonialsSection"), {
  ssr: false
});

const GalleryCarousel = dynamic(() => import("@/components/organisms/GalleryCarousel"), {
  ssr: false
});

export default function HomePageClient() {
  const router = useRouter();

  const handleViewAllFleet = () => {
    router.push('/fleet');
  };

  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Fleet Section */}
      <FleetSection onViewAll={handleViewAllFleet} />

      {/* Gallery Carousel Section */}
      <GalleryCarousel />

      {/* Services Section */}
      <ServicesSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Service Highlights Section */}
      <section className="py-16 lg:py-20 bg-deep-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Premium Limousine Services
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Professional limo rental services tailored to your specific needs. Experience elegance and comfort with our premium limousine fleet in Singapore.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {[
              {
                id: 'airport-transport',
                title: 'Airport Limousine Transfer',
                description: 'Premium limo service for reliable and punctual airport transfers in Singapore',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                ),
                features: ['Flight Monitoring', 'Meet & Greet', 'Professional Chauffeurs']
              },
              {
                id: 'city-tour-hourly',
                title: 'City Tour Limousine Rental',
                description: 'Flexible limo rental for city exploration and hourly limousine services',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                features: ['Flexible Hours', 'Local Expertise', 'Competitive Rates']
              },
              {
                id: 'corporate-event',
                title: 'Corporate Limousine Service',
                description: 'Professional limo transportation for corporate events and business functions',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
                features: ['Executive Comfort', 'Business Functions', 'Reliable Service']
              },
            ].map((service) => (
              <div
                key={service.id}
                className="text-center group"
              >
                <div className="mb-6">
                  <div className="w-16 h-16 bg-luxury-gold/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-luxury-gold/20 transition-all duration-300 mb-4">
                    <div className="text-luxury-gold">
                      {service.icon}
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white mb-3">
                  {service.title}
                </h3>

                <p className="text-gray-300 leading-relaxed mb-4">
                  {service.description}
                </p>

                <div className="flex flex-wrap justify-center gap-2">
                  {service.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-luxury-gold/20 text-luxury-gold text-sm rounded-full border border-luxury-gold/30"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-deep-navy mb-4">
            Stay Updated with ZBK
          </h2>
          <p className="text-lg text-deep-navy mb-8 opacity-80">
            Get the latest offers, new vehicle arrivals, and exclusive deals delivered to your inbox
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-compact border border-deep-navy border-opacity-20 focus:border-deep-navy focus:outline-none"
            />
            <button className="px-8 py-3 bg-deep-navy text-white rounded-compact hover:bg-charcoal transition-colors duration-micro font-semibold">
              Subscribe
            </button>
          </div>

          <p className="text-sm text-deep-navy opacity-60 mt-4">
            No spam, unsubscribe at any time
          </p>
        </div>
      </section>
    </>
  );
}
