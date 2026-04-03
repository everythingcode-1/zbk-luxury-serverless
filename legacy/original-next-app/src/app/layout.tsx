import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CustomerAuthProvider } from "@/contexts/CustomerAuthContext";
import GoogleAnalytics from "@/components/GoogleAnalytics";

// Konfigurasi font dengan optimasi performa
const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  style: 'normal',
  preload: true,
  adjustFontFallback: true,
  fallback: ['system-ui', 'sans-serif'],
});

// Konfigurasi viewport untuk responsif dan mobile-friendly
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#D4AF37',
  colorScheme: 'light',
} as const;

export const metadata: Metadata = {
  title: {
    default: "ZBK Limousine Tours - Layanan Limousine Premium di Singapore",
    template: "%s | ZBK Limousine Tours"
  },
  description: "Layanan limousine profesional di Singapore dengan armada Toyota Alphard & Hiace mewah. Layanan antar-jemput bandara, sewa limo tur kota, layanan limo korporat, dan acara spesial. Pesan perjalanan limo elegan Anda sekarang!",
  keywords: [
    "layanan limousine singapore", 
    "sewa limo singapore", 
    "limousine singapore",
    "layanan limo",
    "sewa limousine",
    "antar jemput bandara limo",
    "limo korporat",
    "tur kota dengan limo",
    "limo pernikahan",
    "limo premium",
    "zbk limousine tours",
    "toyota alphard limo",
    "toyota hiace limo",
    "sopir profesional singapore"
  ],
  authors: [{ 
    name: "ZBK Limousine Tours",
    url: "https://zbktransportservices.com" 
  }],
  creator: "ZBK Limousine Tours",
  publisher: "ZBK Limousine Tours",
  metadataBase: new URL('https://www.zbktransportservices.com'),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo-google.png', sizes: 'any', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        rel: 'icon',
        url: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://www.zbktransportservices.com',
  },
  openGraph: {
    title: "ZBK Limousine Tours - Premium Limousine Service in Singapore",
    description: "Professional limousine service in Singapore with premium Toyota Alphard & Hiace limos. Airport limo transfers, city tours, corporate events, and special occasions.",
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
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZBK Limousine Tours - Premium Limousine Service in Singapore",
    description: "Professional limousine service in Singapore with premium Toyota Alphard & Hiace limos. Airport limo transfers, city tours, corporate events, and special occasions.",
    images: ["/api/logo"],
    creator: "@zbklimotours",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en-SG" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Inline Critical CSS */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* Critical CSS untuk above-the-fold content */
          *{box-sizing:border-box}html{line-height:1.5;-webkit-text-size-adjust:100%}body{margin:0;padding:0;font-family:'Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-weight:400;line-height:1.6;color:#1a202c;background-color:#fff}.hero-section{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a202c 0%,#2d3748 100%);color:#fff;position:relative;overflow:hidden}.hero-content{text-align:center;z-index:10;position:relative;max-width:1200px;padding:0 20px}.hero-title{font-size:clamp(2.5rem,5vw,4rem);font-weight:700;line-height:1.2;margin-bottom:1.5rem;text-shadow:2px 2px 4px rgba(0,0,0,.3)}.hero-subtitle{font-size:clamp(1.2rem,3vw,1.5rem);font-weight:400;line-height:1.6;margin-bottom:2rem;opacity:.9}.skeleton{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:loading 1.5s infinite}@keyframes loading{0%{background-position:200% 0}100%{background-position:-200% 0}}.layout-stable{contain:layout;min-height:100vh}.responsive-image{width:100%;height:auto;object-fit:cover;background-color:#f3f4f6}.btn-primary{display:inline-flex;align-items:center;justify-content:center;padding:12px 24px;font-size:16px;font-weight:600;line-height:1.5;border:none;border-radius:8px;background:#f59e0b;color:#fff;text-decoration:none;cursor:pointer;transition:all .2s ease;min-height:48px}.btn-primary:hover{background:#d97706;transform:translateY(-1px)}.btn-primary:active{transform:translateY(0)}.nav-header{position:fixed;top:0;left:0;right:0;z-index:50;background:rgba(255,255,255,.95);backdrop-filter:blur(10px);border-bottom:1px solid #e5e7eb;height:72px}.nav-container{max-width:1200px;margin:0 auto;padding:0 20px;height:100%;display:flex;align-items:center;justify-content:space-between}img{max-width:100%;height:auto}.lazy-placeholder{aspect-ratio:16/9;background:#f3f4f6;border-radius:8px}
        `}} />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/4.-alphard-colors-black.png" as="image" />
        <link rel="preload" href="/Hero.jpg" as="image" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <CustomerAuthProvider>
            <GoogleAnalytics />
            {children}
          </CustomerAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
