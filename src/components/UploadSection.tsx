'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpTrayIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useResumeStore } from '@/app/store/resumeStore';
import { TailoredResume } from '@/types/TailoredResume';

export default function UploadSection() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const setTailoredResume = useResumeStore((state) => state.setTailoredResume);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setResumeText('');
    }
  };

  const handleSubmit = async () => {
    if (!resumeFile && !resumeText) {
      setError('Please upload a resume or paste your resume text.');
      return;
    }
    if (!jobDescription) {
      setError('Please paste the job description.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      if (resumeFile) {
        formData.append('resumeFile', resumeFile);
      } else {
        formData.append('resumeText', resumeText);
      }
      formData.append('jobDescription', jobDescription);

      const res = await fetch('/api/tailor', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to tailor resume.');

      const data = await res.json();

      // Store structured JSON in Zustand
      const tailoredResume: TailoredResume = data.tailoredResume;
      setTailoredResume(tailoredResume);

      // Navigate to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="upload-section"
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-950 to-gray-900 border-t border-gray-800"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto"
      >
        <h2 className="text-center text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
          Tailor Your Resume Effortlessly
        </h2>
        <p className="text-center text-gray-400 mb-10 max-w-xl mx-auto">
          Upload or paste your resume, paste the job description, and let AI instantly tailor your resume for you.
        </p>

        {/* Upload File */}
        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 mb-6 shadow-lg hover:shadow-blue-500/10 transition">
          <label className="block text-gray-300 mb-2">Upload Resume (PDF/DOCX)</label>
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-blue-500 transition relative">
            <ArrowUpTrayIcon className="h-10 w-10 text-gray-500 group-hover:text-blue-400 transition" />
            <p className="text-gray-400 mt-2">Click or drag & drop your resume</p>
            {resumeFile && <p className="mt-2 text-blue-400 text-sm">{resumeFile.name}</p>}
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Paste Resume */}
        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 mb-6 shadow-lg hover:shadow-blue-500/10 transition">
          <label className="block text-gray-300 mb-2">Or Paste Your Resume Text</label>
          <textarea
            rows={5}
            placeholder="Paste your resume here..."
            className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:ring-0"
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value);
              if (resumeText) setResumeFile(null);
            }}
          />
        </div>

        {/* Job Description */}
        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 mb-8 shadow-lg hover:shadow-blue-500/10 transition">
          <label className="block text-gray-300 mb-2">Paste Job Description</label>
          <textarea
            rows={5}
            placeholder="Paste the job description here..."
            className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:ring-0"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Tailoring...
              </>
            ) : (
              <>
                Tailor My Resume
                <PaperAirplaneIcon className="h-5 w-5 ml-2 -rotate-45 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </section>
  );
}
