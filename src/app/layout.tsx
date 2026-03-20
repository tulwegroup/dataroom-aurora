import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://aurora-osi.com'),
  title: {
    default: "Aurora OSI | Orbital Subsurface Intelligence Infrastructure",
    template: "%s | Aurora OSI"
  },
  description: "Aurora OSI is a physics-causal, multi-orbit intelligence architecture enabling sovereign-grade subsurface resource assessment without ground-based intervention.",
  keywords: [
    "Aurora OSI", 
    "subsurface intelligence", 
    "orbital intelligence", 
    "mineral exploration", 
    "hydrocarbon intelligence", 
    "digital twin", 
    "sovereign intelligence",
    "critical minerals",
    "carbon storage",
    "geophysical survey",
    "satellite intelligence"
  ],
  authors: [{ name: "Aurora OSI", url: "https://aurora-osi.com" }],
  creator: "Aurora OSI",
  publisher: "Aurora OSI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aurora-osi.com',
    siteName: 'Aurora OSI',
    title: 'Aurora OSI | Orbital Subsurface Intelligence',
    description: 'Planetary-Scale Orbital Subsurface Intelligence for sovereign-grade resource assessment.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Aurora OSI - Orbital Subsurface Intelligence',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aurora OSI | Orbital Subsurface Intelligence',
    description: 'Planetary-Scale Orbital Subsurface Intelligence for sovereign-grade resource assessment.',
    images: ['/og-image.png'],
  },
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
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://aurora-osi.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
