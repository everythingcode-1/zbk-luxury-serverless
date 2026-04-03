import type { Metadata } from 'next';
import HomePageClient from './HomePageClient';

export const metadata: Metadata = {
  title: "ZBK Limousine Tours - Premium Limousine Service in Singapore",
  description: "Professional limousine service in Singapore with premium Toyota Alphard & Hiace. Airport limo transfers, city tours, corporate limousine service, and special occasions. Book your elegant ride now.",
  keywords: [
    "limousine service Singapore",
    "limo rental Singapore",
    "airport transfer Singapore",
    "corporate limousine Singapore",
    "ZBK Limousine Tours",
    "Toyota Alphard rental",
    "chauffeur service Singapore",
    "luxury transport Singapore",
    "city tour limo Singapore",
    "wedding limousine Singapore",
  ],
  alternates: {
    canonical: "https://www.zbktransportservices.com",
  },
  openGraph: {
    title: "ZBK Limousine Tours - Premium Limousine Service in Singapore",
    description: "Professional limousine service in Singapore with premium Toyota Alphard & Hiace. Airport transfers, city tours, corporate events, and special occasions.",
    url: "https://www.zbktransportservices.com",
    siteName: "ZBK Limousine Tours",
    images: [
      {
        url: "/logo-google.png",
        width: 800,
        height: 600,
        alt: "ZBK Limousine Tours - Premium Limousine Service Singapore",
      },
    ],
    locale: "en_SG",
    type: "website",
  },
};

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.zbktransportservices.com';

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "url": baseUrl,
  "logo": `${baseUrl}/api/logo`,
  "name": "ZBK Limousine Tours",
  "alternateName": "ZBK Transport Services",
  "description": "Premium limousine service in Singapore. Professional limo rental with Toyota Alphard & Hiace for airport transfers, corporate events, city tours, weddings, and special occasions. Book your elegant limousine ride today.",
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
    "contactType": "customer service",
    "email": "zbklimo@gmail.com",
    "availableLanguage": ["English", "Indonesian"]
  },
  "sameAs": [
    "https://web.facebook.com/p/ZBK-Limo-Tour-Services-SG-100090587093370/",
    "https://www.instagram.com/zbksingapore/",
    "https://www.tiktok.com/@zbklimotourservic"
  ]
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <HomePageClient />
    </>
  );
}
