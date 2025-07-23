'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: 'Is AstroCV really free?',
    answer:
      'Yes — tailoring your resume is free for now while we’re in early access. Premium plans may come later with more features.',
  },
  {
    question: 'How long does it take?',
    answer:
      'Less than a minute. Upload your resume, paste the job description, and get a tailored version instantly — no prompt engineering needed.',
  },
  {
    question: 'Is my data safe?',
    answer:
      'Absolutely. Your resume and job description are processed securely and not stored or shared. We respect your privacy.',
  },
  {
    question: 'Why do you charge me? I can just use ChatGPT.',
    answer:
      'Great point — and yes, you can. But AstroCV isn’t just a prompt. I pay for secure cloud hosting and premium AI (GPT-4) so you don’t have to. You get a clean, formatted resume in one click — no AI tweaking, formatting, or guesswork. It’s a service designed to save you time, not just a tool.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-950 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-10">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-700 rounded-xl bg-gray-900/60 overflow-hidden"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-white font-medium hover:bg-gray-800 transition"
              >
                <span>{faq.question}</span>
                <ChevronDownIcon
                  className={`h-5 w-5 text-blue-400 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-5 pb-4 text-gray-300 text-sm leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
