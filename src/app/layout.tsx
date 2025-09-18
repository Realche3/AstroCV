import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import EntitlementGate from '@/components/EntitlementGate';
import AnalyticsGate from '@/components/AnalyticsGate';
import CookieBanner from '@/components/CookieBanner';
import BetaBanner from '@/components/BetaBanner';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'astroCV - AI Resume Tailoring',
  description: 'Upload your resume and job description to get a perfectly tailored CV',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 text-gray-100 min-h-screen`}>
        <BetaBanner />
        <NavBar />
        {/* Spacer to account for fixed banner + navbar */}
        <div className="h-32 md:h-28" />
        <EntitlementGate/>
        <main className="pt-8 pb-16">{children}</main>
        <Footer/>
        <AnalyticsGate />
        <CookieBanner />
      </body>
    </html>
  );
}
