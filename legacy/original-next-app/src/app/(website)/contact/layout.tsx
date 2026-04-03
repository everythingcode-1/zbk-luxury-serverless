import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact ZBK Limousine Tours - Book Premium Transport in Singapore | 24/7 Support",
  description: "Contact ZBK Limousine Tours for premium car rental inquiries. Call +65 9747 6453 or email zbklimo@gmail.com. 24/7 customer support for airport transfers, hourly rentals, and corporate transport in Singapore. Get instant quotes.",
  keywords: [
    "contact ZBK Limousine",
    "book limousine Singapore",
    "car rental inquiry",
    "Singapore transport contact",
    "limousine booking hotline",
    "24/7 car rental support",
    "ZBK customer service",
    "luxury transport booking",
    "Changi airport transfer booking"
  ],
  openGraph: {
    title: "Contact ZBK Limousine Tours - Book Premium Transport",
    description: "Get in touch with ZBK Limousine Tours. 24/7 customer support for luxury car rentals in Singapore. Call +65 9747 6453 or email us.",
    url: "https://www.zbktransportservices.com/contact",
    siteName: "ZBK Limousine Tours",
    images: [
      {
        url: "/4.-alphard-colors-black.png",
        width: 1200,
        height: 630,
        alt: "Contact ZBK Limousine Tours",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact ZBK Limousine Tours | 24/7 Support",
    description: "Book premium limousine service in Singapore. Call +65 9747 6453 for instant quotes and reservations.",
    images: ["/4.-alphard-colors-black.png"],
  },
  alternates: {
    canonical: "https://www.zbktransportservices.com/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
