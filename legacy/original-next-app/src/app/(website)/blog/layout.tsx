import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - Car Rental Tips & Singapore Travel Guide | ZBK Limousine Tours",
  description: "Expert advice on luxury car rentals, Singapore travel tips, business transport guides, and premium vehicle reviews. Stay informed with ZBK Limousine Tours' comprehensive blog covering airport transfers, corporate transport, and travel insights.",
  keywords: [
    "car rental tips Singapore",
    "Singapore travel guide",
    "luxury transport blog",
    "business travel Singapore",
    "vehicle rental advice",
    "airport transfer tips",
    "limousine service guide",
    "Toyota Alphard review",
    "corporate transport tips",
    "Singapore tourism blog"
  ],
  openGraph: {
    title: "Blog - Car Rental Tips & Singapore Travel Guide | ZBK Limousine",
    description: "Expert advice on luxury car rentals, Singapore travel tips, and premium vehicle reviews from ZBK Limousine Tours.",
    url: "https://www.zbktransportservices.com/blog",
    siteName: "ZBK Limousine Tours",
    images: [
      {
        url: "/4.-alphard-colors-black.png",
        width: 1200,
        height: 630,
        alt: "ZBK Limousine Tours Blog",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - Car Rental Tips & Singapore Travel Guide | ZBK",
    description: "Expert advice on luxury car rentals, Singapore travel tips, and premium vehicle reviews.",
    images: ["/4.-alphard-colors-black.png"],
  },
  alternates: {
    canonical: "https://www.zbktransportservices.com/blog",
    types: {
      'application/rss+xml': 'https://www.zbktransportservices.com/blog/rss.xml',
    },
  },
  other: {
    'rss': 'https://www.zbktransportservices.com/blog/rss.xml',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
