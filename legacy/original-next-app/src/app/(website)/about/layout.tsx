import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - ZBK Luxury Car Rental | Our Story, Mission & Values",
  description: "Learn about ZBK Luxury Car Rental's story, mission, and values. Meet our passionate team dedicated to providing exceptional luxury car rental experiences.",
  keywords: "about ZBK luxury, car rental company, luxury travel, premium service, luxury car rental, company story, mission vision values",
  openGraph: {
    title: "About Us - ZBK Luxury Car Rental",
    description: "Learn about ZBK Luxury Car Rental's story, mission, and values. Meet our passionate team dedicated to providing exceptional luxury experiences.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us - ZBK Luxury Car Rental",
    description: "Learn about ZBK Luxury Car Rental's story, mission, and values. Meet our passionate team dedicated to providing exceptional luxury experiences.",
  },
  alternates: {
    canonical: "/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
