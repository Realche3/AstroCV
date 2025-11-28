'use client';

import { motion, useAnimation } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { useState, useEffect, useMemo } from 'react';

const samplePairs = [
  {
    jobTitle: 'Senior Full Stack Engineer',
    company: 'Growth SaaS, Series B',
    keywords: ['React', 'Node.js', 'CI/CD', 'Leadership'],
    before: [
      'Built web applications',
      'Worked with JavaScript and React',
      'Collaborated with team members',
    ],
    after: [
      'Architected 12+ React/Node apps to 10K+ MAU',
      'Led Agile pod of 5; mentored 3 juniors',
      'Cut prod bugs by 65% with CI/CD rollout',
    ],
    metric: '+3.2x more callbacks',
  },
  {
    jobTitle: 'Product Manager, Platform',
    company: 'Fintech scale-up',
    keywords: ['Roadmaps', 'API', 'Stakeholders', 'Data'],
    before: [
      'Managed product features',
      'Worked with engineers',
      'Gathered requirements',
    ],
    after: [
      'Shipped API roadmap that grew partner GMV 28%',
      'Ran data-driven prioritization across 4 squads',
      'Aligned execs with crisp KPI storytelling',
    ],
    metric: '+41% recruiter replies',
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const controls = useAnimation();

  const pair = useMemo(() => samplePairs[current], [current]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isHovering) {
      interval = setInterval(() => {
        controls.start({ opacity: 0, y: 8, transition: { duration: 0.25 } }).then(() => {
          setCurrent((prev) => (prev + 1) % samplePairs.length);
          controls.start({ opacity: 1, y: 0, transition: { duration: 0.25 } });
        });
      }, 6000);
    }
    return () => clearInterval(interval);
  }, [isHovering, controls]);

  return (
    <section className="relative pt-32 pb-40 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-gray-950 to-gray-900">
      {/* Decorative: grid + gradient */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-5 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[600px] bg-gradient-to-b from-blue-800/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Content container */}
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent"
        >
          AI-Powered Resume Tailoring
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
        >
          Get a job-winning resume in 60 seconds. Just upload your resume and paste the job description. We handle the rest.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
        >
          <a
            href="#upload-section"
            className="relative group px-6 py-3.5 font-medium rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
          >
            <span className="relative z-10 flex items-center justify-center">
              Get Started Now
              <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
          <a
            href="#how-it-works"
            className="px-6 py-3.5 font-medium rounded-full bg-gray-800 text-white border border-gray-700 hover:border-blue-400 hover:text-blue-400 transition"
          >
            How It Works
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-4"
        >
          {[
            { value: '95%', label: 'Interview Rate Boost' },
            { value: '60s', label: 'To Tailor Your Resume' },
            { value: '4.9/5', label: 'User Satisfaction' }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-bold text-blue-400">{stat.value}</p>
              <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Live comparison strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="relative mt-16 max-w-5xl mx-auto"
        >
          <div className="rounded-3xl border border-gray-800/70 bg-gray-900/70 backdrop-blur-sm shadow-2xl shadow-blue-900/20 p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm text-blue-200">
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-900/40 px-3 py-1 border border-blue-700/60">
                  🎯 {pair.jobTitle}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-gray-800/80 px-3 py-1 border border-gray-700 text-gray-200">
                  {pair.company}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-start sm:justify-end">
                {pair.keywords.map((kw) => (
                  <span key={kw} className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <motion.div
              animate={controls}
              className="mt-6 grid gap-4 sm:grid-cols-[1.05fr,1fr]"
            >
              <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 text-left">
                <div className="flex items-center gap-2 text-sm font-semibold text-red-200 mb-3">
                  <span className="text-lg">✕</span> Before (generic)
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  {pair.before.map((line, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-600" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-blue-700/60 bg-blue-900/20 p-5 text-left shadow-inner shadow-blue-900/20">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200 mb-3">
                  <span className="text-lg">✓</span> After (tailored in 60s)
                  <span className="ml-auto rounded-full bg-emerald-500/15 border border-emerald-400/50 px-2 py-0.5 text-[11px] font-semibold text-emerald-100">
                    {pair.metric}
                  </span>
                </div>
                <ul className="space-y-2 text-sm text-blue-50">
                  {pair.after.map((line, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-xs text-blue-100">
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1">
                  🔍 Matches keywords automatically
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1">
                  ⚡ Rewrites bullets with impact
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1">
                  📝 Ready to download in PDF/DOCX
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-28 rotate-[-2deg] overflow-hidden rounded-xl border border-gray-800 bg-gradient-to-br from-white/5 via-blue-500/10 to-black/20 shadow-lg shadow-blue-900/20">
                  <div className="absolute inset-1 rounded-lg border border-white/10" />
                  <div className="absolute bottom-1 right-1 text-[10px] font-semibold text-blue-100">Preview</div>
                </div>
                <button
                  onClick={() => setCurrent((prev) => (prev + 1) % samplePairs.length)}
                  className="text-xs text-gray-300 hover:text-white transition"
                  aria-label="Next example"
                >
                  Next example →
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Curved separator */}
      <div className="absolute bottom-0 left-0 right-0 z-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto">
          <path
            fill="#0f172a"
            fillOpacity="1"
            d="M0,64L60,58.7C120,53,240,43,360,48C480,53,600,75,720,74.7C840,75,960,53,1080,58.7C1200,64,1320,96,1380,112L1440,128V0H1380C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0H0Z"
          ></path>
        </svg>
      </div>
    </section>
  );
}
