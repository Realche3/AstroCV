// src/app/dashboard/page.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { pdf as renderPdf } from '@react-pdf/renderer';

import { useResumeStore } from '@/app/store/resumeStore';

import ResumePreviewViewer from '@/components/ResumePreviewViewer';
import CoverLetterPreviewViewer from '@/components/CoverLetterPreviewViewer';
import EmailPreviewViewer from '@/components/EmailPreviewViewer';

import TailoredResumePDF, { resumeTemplateGroups, normalizeTemplateId, ResumeTemplateId } from '@/components/TailoredResumePDF';
import TailoredCoverLetterPDF from '@/components/TailoredCoverLetterPDF';
import TailoredEmailPDF from '@/components/TailoredEmailPDF';

import PlanPickerModal from '@/components/PlanPickerModal';

function useProCountdown(proAccessUntil: number | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeLeftMs = useMemo(() => {
    if (!proAccessUntil) return 0;
    return Math.max(proAccessUntil - now, 0);
  }, [proAccessUntil, now]);

  const hadPro = Boolean(proAccessUntil);
  const isProActive = Boolean(proAccessUntil && timeLeftMs > 0);
  const isExpired = hadPro && !isProActive;

  return { timeLeftMs, isProActive, isExpired };
}

function formatTimeLeft(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

export default function DashboardPage() {
  // Hydration status (do NOT early return; keep hooks order stable)
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // Zustand state
  const tailoredResume = useResumeStore((s) => s.tailoredResume);
  const coverLetter = useResumeStore((s) => s.coverLetter);
  const followUpEmail = useResumeStore((s) => s.followUpEmail);
  const resumeTemplateId = useResumeStore((s) => s.resumeTemplateId);

  const isPaid = useResumeStore((s) => s.isPaid);
  const proAccessUntil = useResumeStore((s) => s.proAccessUntil);

  const setToken = useResumeStore((s) => s.setToken);
  const setPaid = useResumeStore((s) => s.setPaid);
  const setProAccessUntil = useResumeStore((s) => s.setProAccessUntil);
  const setPurchaseType = useResumeStore((s) => s.setPurchaseType);
  const setResumeTemplate = useResumeStore((s) => s.setResumeTemplate);

  const selectTemplateById = useCallback((id: ResumeTemplateId) => {
    if (id !== resumeTemplateId) {
      setResumeTemplate(id);
    }
  }, [resumeTemplateId, setResumeTemplate]);

  const effectiveTemplateId = useMemo(() => normalizeTemplateId(resumeTemplateId), [resumeTemplateId]);

  useEffect(() => {
    if (effectiveTemplateId !== resumeTemplateId) {
      setResumeTemplate(effectiveTemplateId);
    }
  }, [effectiveTemplateId, resumeTemplateId, setResumeTemplate]);

  const [activeTemplateCategory, setActiveTemplateCategory] = useState(() => {
    const match = resumeTemplateGroups.find((group) =>
      group.templates.some((tpl) => tpl.id === effectiveTemplateId)
    );
    if (match) return match.id;
    return resumeTemplateGroups.length > 0 ? resumeTemplateGroups[0].id : 'corporate';
  });

  useEffect(() => {
    const match = resumeTemplateGroups.find((group) =>
      group.templates.some((tpl) => tpl.id === effectiveTemplateId)
    );
    if (match) {
      setActiveTemplateCategory((current) => (current === match.id ? current : match.id));
    }
  }, [effectiveTemplateId]);

  const visibleTemplates = useMemo(() => {
    const group = resumeTemplateGroups.find((item) => item.id === activeTemplateCategory);
    return group ? group.templates : [];
  }, [activeTemplateCategory]);

  const activeCategoryMeta = useMemo(() => {
    return resumeTemplateGroups.find((item) => item.id === activeTemplateCategory);
  }, [activeTemplateCategory]);

  const [recovering, setRecovering] = useState(false);
  const [recoverMsg, setRecoverMsg] = useState<string | null>(null);
  const [coverLetterCopied, setCoverLetterCopied] = useState(false);
  const [followUpCopied, setFollowUpCopied] = useState(false);
  const coverLetterCopyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const followUpCopyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);

  // Pro if we have a future timestamp
  const isPro = useMemo(
    () => !!proAccessUntil && Date.now() < proAccessUntil,
    [proAccessUntil]
  );

  // Timer & expired state
  const { timeLeftMs, isProActive, isExpired } = useProCountdown(proAccessUntil);

  // Auto-relock when Pro expires (keep proAccessUntil for "expired" banner)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = sessionStorage.getItem('astrocv_limit_notice');
    if (stored) {
      setLimitNotice(stored);
      sessionStorage.removeItem('astrocv_limit_notice');
    }
  }, []);

  useEffect(() => {
    return () => {
      if (coverLetterCopyTimeout.current) clearTimeout(coverLetterCopyTimeout.current);
      if (followUpCopyTimeout.current) clearTimeout(followUpCopyTimeout.current);
    };
  }, []);

  // Plan modal
  const [planOpen, setPlanOpen] = useState(false);
  const openPlan = useCallback(() => setPlanOpen(true), []);
  const closePlan = useCallback(() => setPlanOpen(false), []);

  // Downloads
  const handleDownloadResume = useCallback(async () => {
    if (!tailoredResume) return;
    const blob = await renderPdf(
      <TailoredResumePDF
        tailoredResume={tailoredResume}
        templateId={effectiveTemplateId}
        locked={false}
      />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'astrocv_resume.pdf';
    a.click();
    URL.revokeObjectURL(url);
  }, [tailoredResume, effectiveTemplateId]);

  const handleDownloadCoverLetter = useCallback(async () => {
    if (!tailoredResume || !coverLetter) return;
    const blob = await renderPdf(
      <TailoredCoverLetterPDF
        name={tailoredResume.header.name}
        email={tailoredResume.header.email}
        content={coverLetter}
      />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'astrocv_cover_letter.pdf';
    a.click();
    URL.revokeObjectURL(url);
  }, [tailoredResume, coverLetter]);

  const handleDownloadEmail = useCallback(async () => {
    if (!tailoredResume || !followUpEmail) return;
    const blob = await renderPdf(
      <TailoredEmailPDF
        name={tailoredResume.header.name}
        email={tailoredResume.header.email}
        content={followUpEmail}
      />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'astrocv_follow_up_email.pdf';
    a.click();
    URL.revokeObjectURL(url);
  }, [tailoredResume, followUpEmail]);

  const handleCopyCoverLetter = useCallback(async () => {
    const text = coverLetter?.trim();
    if (!text) return;
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      console.error('Clipboard API not available for copy cover letter.');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCoverLetterCopied(true);
      if (coverLetterCopyTimeout.current) clearTimeout(coverLetterCopyTimeout.current);
      coverLetterCopyTimeout.current = setTimeout(() => setCoverLetterCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy cover letter.', error);
      setCoverLetterCopied(false);
    }
  }, [coverLetter]);

  const handleCopyFollowUpEmail = useCallback(async () => {
    const text = followUpEmail?.trim();
    if (!text) return;
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      console.error('Clipboard API not available for copy follow-up email.');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setFollowUpCopied(true);
      if (followUpCopyTimeout.current) clearTimeout(followUpCopyTimeout.current);
      followUpCopyTimeout.current = setTimeout(() => setFollowUpCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy follow-up email.', error);
      setFollowUpCopied(false);
    }
  }, [followUpEmail]);

  // Recover purchase (re-confirm by last sessionId)
  const handleRecover = useCallback(async () => {
    setRecoverMsg(null);
    setRecovering(true);
    try {
      const sid = typeof window !== 'undefined' ? localStorage.getItem('astrocv_last_sid') : null;
      if (!sid) throw new Error('No purchase to recover on this device.');
      const res = await fetch(`/api/checkout/confirm?session_id=${encodeURIComponent(sid)}`);
      const data = await res.json();
      if (!res.ok || !data?.token || !data?.type) {
        throw new Error(data?.error || 'Could not recover purchase.');
      }
      setToken(data.token);
      setPaid(true);
      setPurchaseType(data.type);
      if (data.type === 'pro') {
        if (data.exp) setProAccessUntil(data.exp * 1000);
        else setProAccessUntil(null);
      } else {
        setProAccessUntil(null);
      }
      setRecoverMsg('Purchase recovered. You can download now.');
    } catch (e) {
      const msg = (e as any)?.message || 'Could not recover purchase.';
      setRecoverMsg(msg);
    } finally {
      setRecovering(false);
    }
  }, [setToken, setPaid, setProAccessUntil, setPurchaseType]);

  // Auto-download handling (single purchase)
  const autoRanRef = useRef(false);
  useEffect(() => {
    if (autoRanRef.current) return;

    const hasFlag =
      typeof window !== 'undefined' &&
      sessionStorage.getItem('astrocv_autodl') === '1';

    if (!hasFlag) return;
    if (!tailoredResume) return;
    if (!isPaid) return;

    autoRanRef.current = true;

    // Remove flag BEFORE starting to avoid re-triggers
    sessionStorage.removeItem('astrocv_autodl');

    (async () => {
      try {
        await handleDownloadResume();

        // Immediately relock for single (non-Pro)
        if (!isPro) {
          // small cushion so the file save dialog isn't disrupted
          setTimeout(() => {
            setToken(null);
            setPaid(false);
            // keep proAccessUntil as-is (should be null in single purchase)
            setProAccessUntil(null);
          }, 300);
        }
      } catch (e) {
        console.error('[AUTO_DOWNLOAD_ERROR]', e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tailoredResume, isPaid, isPro]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-blue-400">
          Your Tailored Documents
        </h1>

        {/* Hydration placeholder */}
        {!hydrated ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : !tailoredResume ? (
          <div className="text-center mt-10 space-y-4">
            <p className="text-gray-400 text-lg">No tailored resume found.</p>
            <Link
              href="/#upload-section"
              className="inline-block px-5 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
            >
              Go Back & Upload Resume
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {limitNotice && (
              <div className="rounded-xl border border-blue-800/60 bg-blue-900/40 px-4 py-3 text-blue-100">
                {limitNotice}
              </div>
            )}
            {/* Pro timer when active */}
            {isProActive && (
              <div className="rounded-xl border border-blue-800/50 bg-blue-900/30 px-4 py-3 text-blue-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="font-semibold text-blue-200">
                    Pro access active
                  </p>
                  <p className="text-sm">
                    Time left:&nbsp;
                    <span className="font-mono font-semibold">
                      {formatTimeLeft(timeLeftMs)}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Pro expired banner */}
            {!isProActive && isExpired && (
              <div className="rounded-xl border border-amber-700/50 bg-amber-900/30 px-4 py-3 text-amber-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-semibold text-amber-200">Your Pro hour has ended</p>
                    <p className="text-sm text-amber-100/80">
                      You can still preview your documents. Unlock again to download your resume and
                      generate unlimited documents for another hour.
                    </p>
                  </div>
                  <a
                    href="/#pricing"
                    className="rounded-full bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600 transition"
                  >
                    Unlock again
                  </a>
                </div>
              </div>
            )}
            {/* Top actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-gray-400">
                Tailoring again will not cancel your Pro access.
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/#upload-section"
                  className="inline-flex items-center px-4 py-2 rounded-full border border-gray-700 text-gray-200 hover:border-blue-400 hover:text-blue-300 transition"
                  title="Tailor another resume for a different job"
                >
                  Tailor another resume
                </Link>
                {!isPaid && (
                  <button
                    onClick={handleRecover}
                    disabled={recovering}
                    className="inline-flex items-center px-4 py-2 rounded-full border border-gray-700 text-gray-200 hover:border-blue-400 hover:text-blue-300 transition disabled:opacity-50"
                    title="Recover your purchase if the download didnEURTMt start"
                  >
                    {recovering ? 'Recovering...' : 'Recover purchase'}
                  </button>
                )}
                {/* keep your existing Resume download button if you want it duplicated up here,
        otherwise leave only the section-level buttons */}
              </div>
            </div>

            {!isPaid && recoverMsg && (
              <div className="text-sm text-gray-400 sm:text-right">{recoverMsg}</div>
            )}


            {/* Resume (paywalled) */}
            <section className="rounded-2xl border border-gray-800/70 bg-gray-900/40 shadow-lg">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">
                <h2 className="text-sm font-semibold text-gray-200">Resume</h2>
                {!isPaid && (
                  <span className="text-xs rounded-full bg-blue-900/40 text-blue-200 px-2 py-1 border border-blue-800">
                    Locked
                  </span>
                )}
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {resumeTemplateGroups.map((group) => {
                      const isActiveGroup = group.id === activeTemplateCategory;
                      return (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() => setActiveTemplateCategory(group.id)}
                          aria-pressed={isActiveGroup}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            isActiveGroup
                              ? 'border-blue-500/70 bg-blue-500/10 text-blue-100'
                              : 'border-gray-800/70 text-gray-300 hover:border-blue-500/50 hover:text-blue-100'
                          }`}
                        >
                          {group.title}
                        </button>
                      );
                    })}
                  </div>
                  {activeCategoryMeta?.description ? (
                    <p className="text-[11px] text-gray-500">{activeCategoryMeta.description}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-3">
                  {visibleTemplates.map((option) => {
                    const isActive = option.id === effectiveTemplateId;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => selectTemplateById(option.id)}
                        aria-pressed={isActive}
                        className={`flex min-w-[180px] flex-col gap-1 rounded-xl border px-4 py-3 text-left transition ${
                          isActive
                            ? 'border-blue-500/80 bg-blue-500/10 text-blue-100'
                            : 'border-gray-800/70 text-gray-200 hover:border-blue-500/50 hover:text-blue-100'
                        }`}
                      >
                        <span className="text-sm font-semibold">{option.label}</span>
                        <span className="text-xs text-gray-400">{option.description}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="h-[680px] sm:h-[760px] overflow-hidden rounded-xl border border-gray-800/60 bg-gray-900/50">
                  <ResumePreviewViewer
                    tailoredResume={tailoredResume}
                    templateId={effectiveTemplateId}
                    locked={!isPaid}
                    onUnlock={() => openPlan()}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={async () => {
                      if (!isPaid) {
                        openPlan();
                        return;
                      }
                      await handleDownloadResume();
                    }}
                    className="inline-flex items-center px-5 py-2.5 rounded-full bg-blue-500 text-white font-medium transition hover:bg-blue-600"
                  >
                    Download Resume {isPaid ? '' : '(Paid)'}
                  </button>
                </div>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Cover Letter (free) */}
              <section className="rounded-2xl border border-gray-800/70 bg-gray-900/40 shadow-lg">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">
                  <h2 className="text-sm font-semibold text-gray-200">Cover Letter</h2>
                  <span className="text-xs rounded-full bg-gray-800 text-gray-300 px-2 py-1 border border-gray-700">
                    Free
                  </span>
                </div>

                <div className="p-5 sm:p-6 space-y-5">
                  <div className="h-[500px] sm:h-[620px] overflow-hidden rounded-xl border border-gray-800/60 bg-gray-900/50">
                    <CoverLetterPreviewViewer
                      name={tailoredResume.header.name}
                      email={tailoredResume.header.email}
                      content={coverLetter || ''}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleCopyCoverLetter}
                      disabled={!coverLetter || !coverLetter.trim()}
                      className={`inline-flex w-full items-center justify-center rounded-full border px-4 py-2 text-xs font-medium transition ${coverLetterCopied ? 'border-blue-500 bg-blue-500/10 text-blue-100' : 'border-gray-700 text-gray-200 hover:border-blue-400 hover:text-blue-200'} disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-5 sm:py-2.5 sm:text-sm`}
                    >
                      {coverLetterCopied ? 'Copied!' : 'Copy Cover Letter'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadCoverLetter}
                      className="inline-flex w-full items-center justify-center rounded-full border border-gray-700 px-4 py-2 text-xs font-medium text-gray-200 transition hover:border-blue-400 hover:text-blue-200 sm:w-auto sm:px-5 sm:py-2.5 sm:text-sm"
                    >
                      Download Cover Letter (Free)
                    </button>
                  </div>
                </div>
              </section>

              {/* Follow-up Email (free) */}
              <section className="rounded-2xl border border-gray-800/70 bg-gray-900/40 shadow-lg">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">
                  <h2 className="text-sm font-semibold text-gray-200">Follow-up Email</h2>
                  <span className="text-xs rounded-full bg-gray-800 text-gray-300 px-2 py-1 border border-gray-700">
                    Free
                  </span>
                </div>

                <div className="p-5 sm:p-6 space-y-5">
                  <div className="h-[500px] sm:h-[620px] overflow-hidden rounded-xl border border-gray-800/60 bg-gray-900/50">
                    <EmailPreviewViewer
                      name={tailoredResume.header.name}
                      email={tailoredResume.header.email}
                      content={followUpEmail || ''}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleCopyFollowUpEmail}
                      disabled={!followUpEmail || !followUpEmail.trim()}
                      className={`inline-flex w-full items-center justify-center rounded-full border px-4 py-2 text-xs font-medium transition ${followUpCopied ? 'border-blue-500 bg-blue-500/10 text-blue-100' : 'border-gray-700 text-gray-200 hover:border-blue-400 hover:text-blue-200'} disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-5 sm:py-2.5 sm:text-sm`}
                    >
                      {followUpCopied ? 'Copied!' : 'Copy Follow-up Email'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadEmail}
                      className="inline-flex w-full items-center justify-center rounded-full border border-gray-700 px-4 py-2 text-xs font-medium text-gray-200 transition hover:border-blue-400 hover:text-blue-200 sm:w-auto sm:px-5 sm:py-2.5 sm:text-sm"
                    >
                      Download Follow-up Email (Free)
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>

      {/* Plan picker modal used to unlock resume */}
      <PlanPickerModal open={planOpen} onClose={closePlan} />
    </main>
  );
}

