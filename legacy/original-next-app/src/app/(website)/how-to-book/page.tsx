import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/molecules/Breadcrumb';

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Do I need to create an account to book?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No, you can book as a guest. No registration is required. Simply fill in your ride details, select a vehicle, and pay."
      }
    },
    {
      "@type": "Question",
      "name": "What payment methods are accepted?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We accept credit/debit cards (Visa, Mastercard, AMEX), PayNow, and Stripe Link. All payments are processed securely through Stripe."
      }
    },
    {
      "@type": "Question",
      "name": "When will I receive my booking confirmation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You will receive a confirmation email immediately after successful payment with your booking details and receipt."
      }
    },
    {
      "@type": "Question",
      "name": "Can I cancel or modify my booking?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Please contact us via WhatsApp or email as soon as possible if you need to cancel or modify your booking. Our team will assist you."
      }
    },
    {
      "@type": "Question",
      "name": "What is the midnight charge?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A surcharge of SGD 10 applies for pickups between 23:00 and 06:00 Singapore time."
      }
    },
    {
      "@type": "Question",
      "name": "How will I know when my driver arrives?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our driver will contact you 15 minutes before your scheduled pickup time. You'll also receive the driver's contact details in your confirmation email."
      }
    }
  ]
};

export const metadata: Metadata = {
  title: "How to Book - Step by Step Booking Guide | ZBK Limousine Tours",
  description: "Learn how to book your premium limousine ride with ZBK Limousine Tours in Singapore. Simple 3-step booking process: choose your ride, select vehicle, and pay securely via Stripe.",
  keywords: [
    "how to book limousine Singapore",
    "ZBK booking guide",
    "limousine booking process",
    "book airport transfer Singapore",
    "luxury car booking online",
  ],
  openGraph: {
    title: "How to Book Your Ride | ZBK Limousine Tours",
    description: "Simple 3-step guide to booking your premium limousine in Singapore. Choose ride, select vehicle, pay securely.",
    url: "https://www.zbktransportservices.com/how-to-book",
    siteName: "ZBK Limousine Tours",
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "https://www.zbktransportservices.com/how-to-book",
  },
};

export default function HowToBookPage() {
  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Breadcrumb
        items={[
          { label: 'How to Book', href: '/how-to-book' }
        ]}
      />

      {/* Hero */}
      <section className="relative bg-deep-navy py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-luxury-gold blur-[150px]"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-luxury-gold to-transparent mx-auto mb-8"></div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            How to Book Your Ride
          </h1>
          <p className="text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-light">
            Book your premium limousine in just 3 simple steps. No registration required — fast, secure, and hassle-free.
          </p>
        </div>
      </section>

      {/* Steps Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Step 1 */}
          <div className="relative mb-20">
            <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-luxury-gold">1</span>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  Choose Your Ride Details
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Click the <strong className="text-luxury-gold">&quot;Book Your Ride&quot;</strong> button on our homepage. A booking form will appear where you need to fill in your trip details.
                </p>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">What you&apos;ll need to provide:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-luxury-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Pickup Date & Time</p>
                        <p className="text-gray-500 text-xs">When do you need the ride?</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-luxury-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Pickup & Drop-off Location</p>
                        <p className="text-gray-500 text-xs">Where are you going?</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-luxury-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Trip Type</p>
                        <p className="text-gray-500 text-xs">One-way or round-trip</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-luxury-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Duration (Round-trip)</p>
                        <p className="text-gray-500 text-xs">6 hours, 12 hours, or custom</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Connector line */}
            <div className="hidden lg:block absolute left-8 top-20 bottom-0 w-px bg-gradient-to-b from-luxury-gold/30 to-transparent"></div>
          </div>

          {/* Step 2 */}
          <div className="relative mb-20">
            <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-luxury-gold">2</span>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  Select Your Vehicle
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Browse our fleet of premium vehicles and choose the one that best suits your needs. Each vehicle shows its capacity, features, and price.
                </p>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Our Fleet:</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100">
                      <div className="w-12 h-12 rounded-xl bg-deep-navy flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10m10 0H3m10 0h4m0 0a1 1 0 001-1v-4a1 1 0 00-.8-.97l-3-1A1 1 0 0014 9V6" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Toyota Alphard</p>
                        <p className="text-gray-500 text-sm">6 passengers &bull; Premium executive seating &bull; Captain chairs</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100">
                      <div className="w-12 h-12 rounded-xl bg-deep-navy flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10m10 0H3m10 0h4m0 0a1 1 0 001-1v-4a1 1 0 00-.8-.97l-3-1A1 1 0 0014 9V6" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Toyota Noah</p>
                        <p className="text-gray-500 text-sm">6 passengers &bull; Comfortable seating &bull; Family friendly</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100">
                      <div className="w-12 h-12 rounded-xl bg-deep-navy flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10m10 0H3m10 0h4m0 0a1 1 0 001-1v-4a1 1 0 00-.8-.97l-3-1A1 1 0 0014 9V6" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Toyota Hiace Combi</p>
                        <p className="text-gray-500 text-sm">9 passengers &bull; Large group transport &bull; Spacious luggage area</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block absolute left-8 top-20 bottom-0 w-px bg-gradient-to-b from-luxury-gold/30 to-transparent"></div>
          </div>

          {/* Step 3 */}
          <div className="relative mb-20">
            <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-luxury-gold">3</span>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  Review & Pay Securely
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Review your booking details in the Order Summary, fill in your contact information, then proceed to our secure Stripe payment page.
                </p>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Customer Information Required:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                      <svg className="w-5 h-5 text-luxury-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm text-gray-700">Full Name</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                      <svg className="w-5 h-5 text-luxury-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-700">Email</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                      <svg className="w-5 h-5 text-luxury-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm text-gray-700">Phone Number</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Accepted Payment Methods:</h3>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-100">
                      <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="1" y="4" width="22" height="16" rx="3" ry="3" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                        <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                      <span className="text-sm text-gray-700">Credit/Debit Card</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-100">
                      <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span className="text-sm text-gray-700">PayNow</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-100">
                      <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span className="text-sm text-gray-700">Stripe Link</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* After Booking */}
          <div className="relative">
            <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  Booking Confirmed!
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  After successful payment, you will receive a confirmation email with your booking details and receipt. Here&apos;s what happens next:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="font-semibold text-gray-900 text-sm">Confirmation Email</p>
                    </div>
                    <p className="text-gray-600 text-sm">You&apos;ll receive a detailed email with your booking reference and receipt.</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <p className="font-semibold text-gray-900 text-sm">Driver Contact</p>
                    </div>
                    <p className="text-gray-600 text-sm">Our driver will contact you 15 minutes before your scheduled pickup time.</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <p className="font-semibold text-gray-900 text-sm">Secure Payment</p>
                    </div>
                    <p className="text-gray-600 text-sm">All payments are processed securely through Stripe with SSL encryption.</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="font-semibold text-gray-900 text-sm">24/7 Support</p>
                    </div>
                    <p className="text-gray-600 text-sm">Need help? Contact us anytime via WhatsApp or email for assistance.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Info */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Pricing Overview</h2>
            <p className="text-gray-600">Transparent pricing with no hidden fees. All prices in SGD.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-luxury-gold/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">One-Way Transfer</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Airport transfers and city-to-city trips. Fixed price per trip.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Airport pickup/drop-off
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  City-to-city transfer
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Midnight charge: +SGD 10 (23:00–06:00)
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-luxury-gold/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Hourly Rental</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Round-trip with chauffeur. Choose 6-hour or 12-hour packages.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  6-hour package available
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  12-hour package available
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Custom duration for extended trips
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "Do I need to create an account to book?",
                a: "No, you can book as a guest. No registration is required. Simply fill in your ride details, select a vehicle, and pay."
              },
              {
                q: "What payment methods are accepted?",
                a: "We accept credit/debit cards (Visa, Mastercard, AMEX), PayNow, and Stripe Link. All payments are processed securely through Stripe."
              },
              {
                q: "When will I receive my booking confirmation?",
                a: "You will receive a confirmation email immediately after successful payment with your booking details and receipt."
              },
              {
                q: "Can I cancel or modify my booking?",
                a: "Please contact us via WhatsApp or email as soon as possible if you need to cancel or modify your booking. Our team will assist you."
              },
              {
                q: "What is the midnight charge?",
                a: "A surcharge of SGD 10 applies for pickups between 23:00 and 06:00 Singapore time."
              },
              {
                q: "How will I know when my driver arrives?",
                a: "Our driver will contact you 15 minutes before your scheduled pickup time. You'll also receive the driver's contact details in your confirmation email."
              },
            ].map((faq, i) => (
              <details key={i} className="group bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-deep-navy">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Book Your Ride?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Experience premium limousine service in Singapore. Book now in just 3 simple steps.
          </p>
          <Link
            href="/"
            className="group relative inline-flex items-center justify-center px-10 py-4 overflow-hidden rounded-full transition-all duration-500 hover:scale-105 active:scale-[0.98]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-luxury-gold via-[#E8C547] to-luxury-gold rounded-full"></span>
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
            </span>
            <span className="relative flex items-center gap-3 text-deep-navy font-bold text-lg tracking-wide">
              Book Now
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
