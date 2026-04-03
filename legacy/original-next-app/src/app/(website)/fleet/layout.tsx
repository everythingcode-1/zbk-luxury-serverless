import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium Fleet - ZBK Luxury Car Rental | Mercedes, BMW, Audi & More",
  description: "Explore our premium fleet of luxury vehicles including Mercedes-Benz, BMW, Audi, and more. Professional maintenance, 24/7 support, and competitive rates.",
  keywords: "luxury car fleet, premium vehicles, Mercedes-Benz rental, BMW rental, Audi rental, luxury car collection, premium car hire, luxury travel",
  openGraph: {
    title: "Premium Fleet - ZBK Luxury Car Rental",
    description: "Explore our premium fleet of luxury vehicles including Mercedes-Benz, BMW, Audi, and more.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Fleet - ZBK Luxury Car Rental",
    description: "Explore our premium fleet of luxury vehicles including Mercedes-Benz, BMW, Audi, and more.",
  },
  alternates: {
    canonical: "/fleet",
  },
};

export default function FleetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
