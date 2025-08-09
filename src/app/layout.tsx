import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import EntitlementGate from '@/components/EntitlementGate';
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
        <NavBar />
        <EntitlementGate/>
        <main className="pt-8 pb-16">{children}</main>
        <Footer/>
      </body>
    </html>
  );
}