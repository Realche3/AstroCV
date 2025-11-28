'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProTimerBadge from '@/components/ProTimerBadge';
import { useResumeStore } from '@/app/store/resumeStore';
import { CircleStackIcon } from '@heroicons/react/24/solid';

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const singleCredits = useResumeStore((s) => s.singleCredits);
  const freeTrialUsed = useResumeStore((s) => s.freeTrialUsed);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'My Documents', href: '/dashboard' },
    { name: 'FAQs', href: '/#faq' },
    { name: 'Contact', href: '/#contact' },
    { name: 'Terms', href: '/terms' },
    { name: 'Privacy', href: '/privacy' },
  ];

  const { availableCredits, badgeStyle, badgeIconColor, badgeLabelMobile } = useMemo(() => {
    const trialCredits = freeTrialUsed ? 0 : 1;
    const total = singleCredits + trialCredits;
    const hasCredits = total > 0;
    return {
      availableCredits: total,
      badgeStyle: hasCredits
        ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100'
        : 'border-red-400/60 bg-red-500/15 text-red-100',
      badgeIconColor: hasCredits ? 'text-emerald-300' : 'text-red-300',
      badgeLabelMobile:
        total === 1 ? '1 credit left' : `${total} credits left`,
    };
  }, [singleCredits, freeTrialUsed]);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-gray-900/95 backdrop-blur-md py-2 shadow-xl' : 'bg-gray-900/80 backdrop-blur-sm py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center group"
            onClick={() => setIsOpen(false)}
          >
            <motion.span
              initial={{ opacity: 0.8 }}
              whileHover={{
                opacity: 1,
                textShadow: '0 0 8px rgba(96, 165, 250, 0.6)'
              }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
            >
              astroCV
            </motion.span>
            <span className="ml-2 text-xs text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              AI Resume Tailoring
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative group text-gray-300 hover:text-white transition-colors duration-200"
              >
                {item.name}
                <motion.span
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                />
              </Link>
            ))}
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${badgeStyle}`}>
              <CircleStackIcon className={`h-4 w-4 ${badgeIconColor}`} />
              <span className="min-w-[1.5ch] text-center">{availableCredits}</span>
              <span className="uppercase tracking-wide text-[10px]">credit{availableCredits === 1 ? '' : 's'}</span>
            </span>
            <ProTimerBadge />
            <a
              href="#upload-section"
              className="px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/30"
            >
              Get Started
            </a>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              <motion.div
                animate={isOpen ? "open" : "closed"}
                variants={{
                  closed: { rotate: 0 },
                  open: { rotate: 180 }
                }}
                transition={{ duration: 0.3 }}
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </motion.div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Links */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-gray-900/95"
          >
            <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
              <div className="px-3 py-2">
                <span className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${badgeStyle}`}>
                  <CircleStackIcon className={`h-4 w-4 ${badgeIconColor}`} />
                  <span className="whitespace-nowrap">{badgeLabelMobile}</span>
                </span>
              </div>
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
              <a
                href="#upload-section"
                onClick={() => setIsOpen(false)}
                className="block w-full px-3 py-3 rounded-md text-base font-medium text-center text-white bg-gradient-to-r from-blue-500 to-blue-600"
              >
                Get Started
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
