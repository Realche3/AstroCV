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
  title: 'astroCV - AI Resume Tailoring',
  description: 'Upload your resume and job description to get a perfectly tailored CV',
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
  return (
    <html lang="en" className="dark">
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

