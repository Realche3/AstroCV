'use client';

import {
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcApplePay,
  FaCcPaypal,
  FaLock
} from 'react-icons/fa';
import { SiStripe } from 'react-icons/si';

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 text-gray-400 pt-12 pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-2 lg:grid-cols-3 items-start">
        {/* Brand + Secure */}
        <div className="space-y-4">
          <h2 className="text-white text-xl font-semibold">AstroCV</h2>
          <p className="text-sm text-gray-500 max-w-sm">
            Tailor your resume using AI in seconds. Trusted by job seekers globally.
          </p>
          <div className="flex items-center gap-2 text-green-400 mt-2">
            <FaLock className="text-sm" />
            <span className="text-xs">Secure Checkout</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white">Accepted Payment Methods</h3>
          <div className="flex gap-4 text-3xl text-white/80">
            <FaCcVisa />
            <FaCcMastercard />
            <FaCcAmex />
            <FaCcApplePay />
            <FaCcPaypal />
          </div>
        </div>

        {/* Powered by */}
        <div className="space-y-4 mt-6 lg:mt-0">
          <h3 className="text-sm font-medium text-white">Powered by</h3>
          <div className="flex items-center gap-3 text-blue-400">
            <SiStripe className="text-2xl" />
            <span className="text-sm">Stripe</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 mt-10 pt-6 text-xs text-gray-600 text-center">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <a href="/privacy" className="hover:text-blue-400 transition">Privacy Policy</a>
          <span className="hidden sm:inline">|</span>
          <a href="/terms" className="hover:text-blue-400 transition">Terms of Service</a>
        </div>
        <p className="mt-4 text-gray-500">
          © {new Date().getFullYear()} AstroCV. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
