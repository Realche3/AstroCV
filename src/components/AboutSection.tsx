'use client';

import { motion } from 'framer-motion';
import { RocketLaunchIcon, LightBulbIcon, WrenchScrewdriverIcon, StarIcon } from '@heroicons/react/24/solid';

const timeline = [
  {
    icon: LightBulbIcon,
    title: 'The Problem',
    content:
      'After losing my job, I realized how broken the resume process is. Tailoring a resume for every job took 15+ minutes and rarely got replies.',
  },
  {
    icon: WrenchScrewdriverIcon,
    title: 'Tried Everything',
    content:
      'I tested all the tools out there. Most were either overpriced, too complex, or simply didn’t deliver. Even AI tools like ChatGPT took too long to get right.',
  },
  {
    icon: RocketLaunchIcon,
    title: 'The Breakthrough',
    content:
      'As a software engineering student, I decided to build the tool I wish existed: fast, premium, AI-powered resume tailoring — in under 1 minute.',
  },
  {
    icon: StarIcon,
    title: 'AstroCV Today',
    content:
      'AstroCV uses optimized prompts, premium AI, and clean UX to deliver tailored, ATS-friendly resumes with a single click. It’s for people like you and me.',
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-950 to-gray-900 border-t border-gray-800"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto text-gray-300"
      >
        <h2 className="text-center text-4xl font-bold mb-12 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
          Why I Created AstroCV
        </h2>

        <div className="space-y-12">
          {timeline.map((step, idx) => (
            <div key={idx} className="relative pl-14">
              <div className="absolute left-0 top-1">
                <div className="bg-blue-600 p-2 rounded-full">
                  <step.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-1">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed">{step.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 bg-blue-600/10 border border-blue-800 rounded-xl p-6 text-center text-blue-300">
          <p className="text-lg font-medium mb-2">AstroCV exists because I needed it myself.</p>
          <p className="text-base">
            Now you can get a job-ready resume in <span className="font-semibold text-blue-400">under a minute</span> — with just one click.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
