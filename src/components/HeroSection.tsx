'use client';

import { motion, useAnimation } from 'framer-motion';
import { ArrowRightIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';

const sampleResumes = [
  {
    job: `Seeking a Senior Software Engineer with 3+ years of experience in full-stack development using React and Node.js. Must demonstrate leadership, CI/CD knowledge, and the ability to scale products.`,
    before: `JOHN DOE\n------------\nSoftware Engineer\nABC Company • 2020-Present\n\n• Developed web applications\n• Worked with JavaScript and React\n• Collaborated with team members\n• Fixed bugs in existing code`,
    after: `JOHN DOE\n------------\nSenior Full Stack Engineer (Tailored for Full-Stack Role)\nABC Company • 2020-Present\n\n• Architected 12+ React/Node.js applications scaling to 10K+ MAU\n• Led cross-functional Agile team of 5 developers\n• Reduced production bugs by 65% through CI/CD pipeline implementation\n• Mentored 3 junior developers in modern JavaScript best practices`
  }
];

export default function HeroSection() {
  const [currentExample, setCurrentExample] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const controls = useAnimation();

  const cycleExamples = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    await controls.start({ opacity: 0, y: 10, transition: { duration: 0.3 } });
    setCurrentExample((prev) => (prev + 1) % sampleResumes.length);
    await controls.start({ opacity: 1, y: 0, transition: { duration: 0.5 } });
    setIsAnimating(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isHovering) interval = setInterval(cycleExamples, 7000);
    return () => clearInterval(interval);
  }, [isHovering, currentExample]);

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

        {/* Resume Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="relative mt-20 max-w-4xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-800/60 bg-gray-900/70 backdrop-blur-sm">
            {/* Job Description */}
            <div className="bg-blue-950/50 p-6 border-b border-blue-800">
              <h3 className="text-sm font-semibold text-blue-300 mb-2">🎯 Job Description</h3>
              <p className="text-sm text-gray-200 leading-relaxed">{sampleResumes[currentExample].job}</p>
            </div>

            {/* Resume Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-800">
              {/* Before */}
              <div className="p-6 bg-gray-900/80">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">❌ Original Resume</h4>
                <pre className="whitespace-pre-wrap text-gray-400 text-sm bg-gray-800/50 p-4 rounded border border-gray-700 max-h-72 overflow-auto font-mono">
                  {sampleResumes[currentExample].before}
                </pre>
              </div>

              {/* After */}
              <div className="p-6 bg-gray-900/80">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">✅ Tailored Version</h4>
                <pre className="whitespace-pre-wrap text-blue-100 text-sm bg-blue-900/30 p-4 rounded border border-blue-700 max-h-72 overflow-auto font-mono">
                  {sampleResumes[currentExample].after}
                </pre>
                <div className="mt-3 flex items-center text-xs text-blue-400">
                  <span className="h-2 w-2 rounded-full bg-blue-400 mr-2 animate-pulse" />
                  Matched job keywords and improved impact
                </div>
              </div>
            </div>
          </div>

          {/* Cycle button */}
          <button
            onClick={cycleExamples}
            disabled={isAnimating}
            aria-label="Refresh example"
            className="absolute top-2 right-2 text-sm text-gray-400 hover:text-white bg-gray-800 rounded-full p-2 transition"
          >
            <ArrowPathIcon className={`h-4 w-4 ${isAnimating ? 'animate-spin' : ''}`} />
          </button>
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
