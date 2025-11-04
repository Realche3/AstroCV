'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpTrayIcon, PaperAirplaneIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useResumeStore } from '@/app/store/resumeStore';
import { TailoredResponse } from '@/types/TailoredResume';
import TailorOverlay from '@/components/TailorOverlay';
import PlanPickerModal from '@/components/PlanPickerModal';
import { useProAccess, formatTimeLeft } from '@/hooks/useProAccess';

const uploadDeliverables = [
  {
    title: 'Tailored Resume',
    description: 'ATS-ready resume aligned with the job description in your chosen template.',
  },
  {
    title: 'Cover Letter',
    description: 'Job-specific cover letter that highlights your story and impact.',
  },
  {
    title: 'Follow-up Email',
    description: 'Copy-and-send follow-up note to stay memorable with recruiters.',
  },
] as const;

export default function UploadSection() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [overlayStep, setOverlayStep] = useState(0);
  const overlayTimerRef = useRef<number | null>(null);
  const [planOpen, setPlanOpen] = useState(false);

  const router = useRouter();
  const setAll = useResumeStore((state) => state.setAll);
  const freeTrialUsed = useResumeStore((state) => state.freeTrialUsed);
  const setFreeTrialUsed = useResumeStore((state) => state.setFreeTrialUsed);
  const singleCredits = useResumeStore((state) => state.singleCredits);
  const consumeSingleCredit = useResumeStore((state) => state.consumeSingleCredit);
  const { isProActive, timeLeftMs } = useProAccess();
  const hasProUnlimited = isProActive;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Client-side size guard (e.g., 5 MB)
      const maxBytes = 5 * 1024 * 1024;
      if (file.size > maxBytes) {
        setError('File is too large (max 5 MB). Please use a smaller file or paste the text.');
        return;
      }
      setResumeFile(file);
      setResumeText('');
    }
  };

  const handleSubmit = async () => {
    if (freeTrialUsed && singleCredits <= 0 && !hasProUnlimited) {
      setNotice("You've used your free trial and any credits. Unlock a plan to tailor new resumes.");
      setError('');
      setPlanOpen(true);
      return;
    }

    if (!resumeFile && !resumeText) {
      setError('Please upload a resume or paste your resume text.');
      setNotice('');
      return;
    }
    if (!jobDescription) {
      setError('Please paste the job description.');
      setNotice('');
      return;
    }
    setError('');
    setNotice('');
    setOverlayStep(0);
    setLoading(true);

    // Controlled overlay step progression: advance to second-to-last step and hold
    const steps = [
      'Reading current resume',
      'Extracting key data',
      'Analyzing job description',
      'Generating tailored resume',
      'Finalizing documents',
    ];
    const maxIdxBeforeDone = steps.length - 2; // stop at step 4 of 5 (index 3)
    overlayTimerRef.current = window.setInterval(() => {
      setOverlayStep((i) => (i < maxIdxBeforeDone ? i + 1 : i));
    }, 1200) as unknown as number;

    try {
      const formData = new FormData();
      if (resumeFile) {
        formData.append('resumeFile', resumeFile);
      } else {
        formData.append('resumeText', resumeText);
      }
      formData.append('jobDescription', jobDescription);

      const accessToken = typeof window !== 'undefined' ? localStorage.getItem('astrocv_access') : null;
      if (accessToken) {
        formData.append('accessToken', accessToken);
      }

      const res = await fetch('/api/tailor', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        setNotice('');
        let detail = '';
        try {
          const errJson = await res.json();
          detail = errJson?.error || '';
        } catch {}
        if (res.status === 413) {
          throw new Error('Uploaded file is too large. Please use a smaller file or paste your resume text.');
        }
        if (res.status === 400 && !detail) {
          throw new Error('Invalid input. Please provide a resume and job description.');
        }
        if (res.status === 429) {
          const limitMsg =
            detail || "You have reached today's free tailoring limit. Unlock your latest tailored resume to continue tailoring new ones.";
          setNotice(limitMsg);
          setError('');
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('astrocv_limit_notice', limitMsg);
          }
          setOverlayStep(0);
          router.push('/dashboard');
          return;
        }
        throw new Error(detail || `Failed to tailor resume. (HTTP ${res.status})`);
      }

      const warningMessage = res.headers.get('x-tailor-warning');
      if (warningMessage) {
        setNotice(warningMessage);
      }

      const data = await res.json();

      // NOTE: Extract directly from API response
      const { tailoredResume, coverLetter, followUpEmail }: TailoredResponse = data;
      // NOTE: Store everything correctly
      setAll(tailoredResume, coverLetter, followUpEmail);

      if (!freeTrialUsed) {
        setFreeTrialUsed(true);
      }

      if (singleCredits > 0 && !hasProUnlimited) {
        consumeSingleCredit();
      }

      // NOTE: Navigate to dashboard
      // Step 5: Finalizing
      setOverlayStep(steps.length - 1);
      await new Promise((r) => setTimeout(r, 500));
      router.push('/dashboard');
    } catch (err: any) {
      console.error('[TAILOR_SUBMIT_ERROR]', err);
      const msg = typeof err?.message === 'string' && err.message
        ? err.message
        : 'Something went wrong. Please try again.';
      setNotice('');
      setError(msg);
    } finally {
      if (overlayTimerRef.current) {
        clearInterval(overlayTimerRef.current);
        overlayTimerRef.current = null;
      }
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

        {hasProUnlimited ? (
          <div className="mb-8 rounded-2xl border border-indigo-700/70 bg-indigo-900/35 px-5 py-4 text-sm text-indigo-100 shadow-lg shadow-indigo-900/15">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-500/40 bg-indigo-500/15">
                  <SparklesIcon className="h-4 w-4 text-indigo-200" />
                </span>
                <p>
                  Pro Hour is live. Unlimited tailoring for the next {formatTimeLeft(timeLeftMs)}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="inline-flex items-center justify-center rounded-full border border-indigo-400/60 bg-indigo-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-100 transition hover:border-indigo-300 hover:text-white"
              >
                Tailor now
              </button>
            </div>
          </div>
        ) : singleCredits > 0 ? (
          <div className="mb-8 rounded-2xl border border-blue-800/70 bg-blue-900/35 px-5 py-4 text-sm text-blue-100 shadow-lg shadow-blue-900/10">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-500/40 bg-blue-500/15">
                  <SparklesIcon className="h-4 w-4 text-blue-200" />
                </span>
                <p>
                  You have {singleCredits} paid resume credit{singleCredits > 1 ? 's' : ''} ready. Each credit delivers a resume, cover letter, and follow-up email.
                </p>
              </div>
              <button
                type="button"
                onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="inline-flex items-center justify-center rounded-full border border-blue-400/60 bg-blue-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-100 transition hover:border-blue-300 hover:text-white"
              >
                Use credit now
              </button>
            </div>
          </div>
        ) : null}

        <div className="mb-10 rounded-2xl border border-gray-800/70 bg-gray-900/40 p-6 shadow-lg">
          <h3 className="text-center text-lg font-semibold text-gray-100 sm:text-xl">What you'll get in 60 seconds</h3>
          <p className="mt-2 text-center text-sm text-gray-400">Everything below is generated together so you're ready to apply immediately.</p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {uploadDeliverables.map((item) => (
              <li
                key={item.title}
                className="flex items-start gap-3 rounded-xl border border-gray-800/70 bg-gray-900/60 px-4 py-4"
              >
                <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                  <CheckCircleIcon className="h-4 w-4 text-blue-400" />
                </span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-100">{item.title}</p>
                  <p className="text-xs text-gray-400 sm:text-sm">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

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

        {notice && <p className="text-blue-400 text-center mb-4">{notice}</p>}
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

      {/* Full-screen loading overlay */}
      {loading && <TailorOverlay stepIndex={overlayStep} />}
      <PlanPickerModal open={planOpen} onClose={() => setPlanOpen(false)} />
    </section>
  );
}



