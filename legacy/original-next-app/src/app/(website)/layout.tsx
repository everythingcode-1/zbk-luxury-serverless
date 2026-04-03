import Header from "@/components/organisms/Header";
import Footer from "@/components/organisms/Footer";

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LimousineService",
  "name": "ZBK Limousine Tours",
  "url": "https://www.zbktransportservices.com",
  "logo": "https://www.zbktransportservices.com/Logo.png",
  "image": "https://www.zbktransportservices.com/Hero.jpg",
  "description": "Premium limousine service in Singapore with Toyota Alphard, Noah & Hiace. Professional chauffeur service for airport transfers, corporate events, city tours, and special occasions.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Jurong West Street 65",
    "addressLocality": "Singapore",
    "postalCode": "640635",
    "addressCountry": "SG"
  },
  "telephone": "+65 9747 6453",
  "email": "zbklimo@gmail.com",
  "openingHours": "Mo-Su 00:00-24:00",
  "areaServed": {
    "@type": "City",
    "name": "Singapore"
  },
  "priceRange": "$$",
  "currenciesAccepted": "SGD",
  "paymentAccepted": "Credit Card, PayNow, Stripe"
};

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
