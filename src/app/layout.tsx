import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import EntitlementGate from '@/components/EntitlementGate';
import AnalyticsGate from '@/components/AnalyticsGate';
import CookieBanner from '@/components/CookieBanner';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AstroCV | AI CV & Resume Builder to Get More Interviews',
  description: 'Create a professional CV online with AstroCV’s AI resume builder. Generate tailored resumes, cover letters, and follow-up emails fast to win more interviews.',
  openGraph: {
    title: 'AstroCV | AI CV & Resume Builder',
    description: 'AI CV generator for tailored resumes, cover letters, and follow-up emails.',
    url: 'https://astrocv.com',
    siteName: 'AstroCV',
    images: [
      { url: 'https://astrocv.com/og-image.png', width: 1200, height: 630, alt: 'AstroCV AI resume builder' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AstroCV | AI CV & Resume Builder',
    description: 'AI resume generator to create professional CVs online.',
    images: ['https://astrocv.com/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/logo_48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/logo_72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/logo_96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/logo_144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/logo_192x192.png', sizes: '192x192', type: 'image/png' }
    ],
    apple: [
      { url: '/logo_192x192.png', sizes: '192x192', type: 'image/png' }
    ],
    shortcut: '/logo_48x48.png'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['WebSite', 'SoftwareApplication'],
    name: 'AstroCV',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: 'https://astrocv.com',
    description: 'AI CV builder and AI resume generator to create professional CVs online.',
    brand: 'AstroCV',
    offers: [
      {
        '@type': 'Offer',
        price: '2.99',
        priceCurrency: 'USD',
        description: 'Starter - 1 AI resume kit',
      },
    ],
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://astrocv.com/?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-gray-900 text-gray-100 min-h-screen`}>
        <NavBar />
        {/* Spacer to account for fixed navbar */}
        <div className="h-20 md:h-16" />
        <EntitlementGate/>
        <main className="pt-8 pb-16">{children}</main>
        <Footer/>
        <AnalyticsGate />
        <CookieBanner />
      </body>
    </html>
  );
}
