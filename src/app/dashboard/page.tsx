// src/app/dashboard/page.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { pdf as renderPdf } from '@react-pdf/renderer';

import { useResumeStore } from '@/app/store/resumeStore';

import ResumePreviewViewer from '@/components/ResumePreviewViewer';
import CoverLetterPreviewViewer from '@/components/CoverLetterPreviewViewer';
import EmailPreviewViewer from '@/components/EmailPreviewViewer';

import TailoredResumePDF, { resumeTemplateGroups, normalizeTemplateId, ResumeTemplateId, templateDefinitions } from '@/components/TailoredResumePDF';
import TailoredCoverLetterPDF from '@/components/TailoredCoverLetterPDF';
import TailoredEmailPDF from '@/components/TailoredEmailPDF';
import PlanPickerModal from '@/components/PlanPickerModal';
import { useProAccess, formatTimeLeft } from '@/hooks/useProAccess';
import { SparklesIcon, ExclamationTriangleIcon, CircleStackIcon } from '@heroicons/react/24/solid';

type ResumeSectionKey =
  | 'summary'
  | 'skills'
  | 'experience'
  | 'education'
  | 'certifications'
  | 'projects'
  | 'languages';

const DEFAULT_SECTION_ORDER: ResumeSectionKey[] = [
  'summary',
  'experience',
  'skills',
  'education',
  'certifications',
  'projects',
  'languages',
];

const DEFAULT_SECTION_TITLES: Record<ResumeSectionKey, string> = {
  summary: 'Professional Summary',
  skills: 'Skills',
  experience: 'Experience',
  education: 'Education',
  certifications: 'Certifications',
  projects: 'Projects',
  languages: 'Languages',
};

export default function DashboardPage() {
  // Hydration status (do NOT early return; keep hooks order stable)
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const goToUploadSection = useCallback(() => {
    if (typeof window === 'undefined') return;
    const section = document.getElementById('upload-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.href = '/#upload-section';
    }
  }, []);

  // Zustand state
  const tailoredResume = useResumeStore((s) => s.tailoredResume);
  const coverLetter = useResumeStore((s) => s.coverLetter);
  const followUpEmail = useResumeStore((s) => s.followUpEmail);
  const resumeTemplateId = useResumeStore((s) => s.resumeTemplateId);
  const freeTrialUsed = useResumeStore((s) => s.freeTrialUsed);
  const singleCredits = useResumeStore((s) => s.singleCredits);

  const isPaid = useResumeStore((s) => s.isPaid);
  const { isProActive, isExpired, timeLeftMs } = useProAccess();

  const setToken = useResumeStore((s) => s.setToken);
  const setPaid = useResumeStore((s) => s.setPaid);
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
  const [planOpen, setPlanOpen] = useState(false);
  const [activeDocTab, setActiveDocTab] = useState<'resume' | 'coverLetter' | 'followUp'>('resume');
  const creditBanner = useMemo(() => {
    if (!hydrated) return null;
    const hasTrialAvailable = !freeTrialUsed;
    const availableCredits = singleCredits + (hasTrialAvailable ? 1 : 0);

    if (isProActive) {
      const timeLabel = timeLeftMs > 0 ? formatTimeLeft(timeLeftMs) : null;
      return (
        <div className="rounded-2xl border border-indigo-500/50 bg-indigo-500/10 px-5 py-4 text-indigo-100 shadow-lg shadow-indigo-900/10">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-400/30 bg-indigo-400/10">
                <SparklesIcon className="h-4 w-4 text-indigo-200" />
              </span>
              <p>
                Pro Hour is active. Enjoy unlimited tailoring{timeLabel ? ` for the next ${timeLabel}.` : ' right now.'}
              </p>
            </div>
            <button
              type="button"
              onClick={goToUploadSection}
              className="inline-flex items-center justify-center rounded-full border border-indigo-400/60 bg-indigo-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-100 transition hover:border-indigo-300 hover:text-white"
            >
              Tailor now
            </button>
          </div>
        </div>
      );
    }

    if (singleCredits > 0) {
      return (
        <div className="rounded-2xl border border-blue-500/40 bg-blue-500/10 px-5 py-4 text-blue-100 shadow-lg shadow-blue-900/10">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-400/30 bg-blue-400/10">
                <CircleStackIcon className="h-4 w-4 text-blue-200" />
              </span>
              <p className="text-sm">
                You have {singleCredits} paid resume credit{singleCredits > 1 ? 's' : ''} ready. Add more credits or unlock Pro Hour whenever you need.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={goToUploadSection}
                className="inline-flex items-center justify-center rounded-full border border-blue-400/60 bg-blue-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-100 transition hover:border-blue-300 hover:text-white"
              >
                Use a credit
              </button>
              <button
                type="button"
                onClick={() => setPlanOpen(true)}
                className="inline-flex items-center justify-center rounded-full border border-blue-300/60 bg-blue-500/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-100 transition hover:border-blue-200 hover:text-white"
              >
                View plans
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (hasTrialAvailable) {
      return (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-4 text-emerald-100 shadow-lg shadow-emerald-900/10">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
                <SparklesIcon className="h-4 w-4 text-emerald-200" />
              </span>
              <p className="text-sm">Your free trial is ready. Generate one tailored resume package on us or explore plans for more access.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={goToUploadSection}
                className="inline-flex items-center justify-center rounded-full border border-emerald-400/60 bg-emerald-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-100 transition hover:border-emerald-300 hover:text-white"
              >
                Use free trial
              </button>
              <button
                type="button"
                onClick={() => setPlanOpen(true)}
                className="inline-flex items-center justify-center rounded-full border border-emerald-300/60 bg-emerald-500/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-100 transition hover:border-emerald-200 hover:text-white"
              >
                View plans
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-red-100 shadow-lg shadow-red-900/10">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-red-400/30 bg-red-400/10">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-200" />
            </span>
            <p className="text-sm">
              {isExpired
                ? 'Your Pro Hour has ended and you have 0 credits remaining. Pick a plan to keep tailoring new applications.'
                : 'You have 0 credits remaining. Purchase a plan to generate the next tailored package.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPlanOpen(true)}
            className="inline-flex items-center justify-center rounded-full border border-red-400/60 bg-red-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-red-100 transition hover:border-red-300 hover:text-white"
          >
            View plans
          </button>
        </div>
      </div>
    );
  }, [hydrated, isProActive, singleCredits, freeTrialUsed, goToUploadSection, timeLeftMs, isExpired, setPlanOpen]);


  // Pro if we have a future timestamp
  // Timer & expired state
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

  const handleDownloadResumeDocx = useCallback(async () => {
    if (!tailoredResume) return;

    const docx = await import('docx');
    const { Document, Packer, Paragraph, HeadingLevel, AlignmentType, TextRun } = docx;

    const templateDefinition =
      templateDefinitions[effectiveTemplateId] ?? templateDefinitions['corporate-classic'];

    const accent = templateDefinition.accent || '#2563eb';
    const sectionSpacingBefore = templateDefinition.sectionSpacing ?? 200;
    const headerAlignment =
      templateDefinition.headerAlign === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT;

    const sectionOrder = (templateDefinition.sectionOrder?.length
      ? templateDefinition.sectionOrder
      : DEFAULT_SECTION_ORDER) as ResumeSectionKey[];

    const sectionTitles = {
      ...DEFAULT_SECTION_TITLES,
      ...(templateDefinition.sectionTitles || {}),
    } as Record<ResumeSectionKey, string>;

    const paragraphs: any[] = [];
    const addParagraph = (paragraph: InstanceType<typeof Paragraph>) => {
      paragraphs.push(paragraph);
    };
    const addSpacer = (after = 120) => {
      addParagraph(new Paragraph({ spacing: { after } }));
    };
    const pushSectionHeading = (label: string) =>
      addParagraph(
        new Paragraph({
          spacing: { before: sectionSpacingBefore, after: 80 },
          children: [
            new TextRun({
              text: label.toUpperCase(),
              bold: true,
              color: accent,
              size: 24,
            }),
          ],
        })
      );

    const { header, summary, skills, education, experience, certifications, projects, languages } =
      tailoredResume;

    if (header?.name) {
      addParagraph(
        new Paragraph({
          alignment: headerAlignment,
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: header.name,
              bold: true,
              color: accent,
              size: 32,
            }),
          ],
        })
      );
    }

    const contactSegments = [header?.email, header?.phone, header?.linkedin, header?.portfolio]
      .map((value) => value?.trim())
      .filter(Boolean);

    if (contactSegments.length) {
      addParagraph(
        new Paragraph({
          alignment: headerAlignment,
          spacing: { after: 160 },
          children: [
            new TextRun({
              text: contactSegments.join(' | '),
              color: '#475569',
            }),
          ],
        })
      );
    }

    const sectionHandlers: Record<ResumeSectionKey, () => void> = {
      summary: () => {
        if (!summary?.trim()) return;
        pushSectionHeading(sectionTitles.summary);
        summary
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean)
          .forEach((line) =>
            addParagraph(
              new Paragraph({
                spacing: { after: 80 },
                children: [new TextRun({ text: line })],
              })
            )
          );
      },
      skills: () => {
        if (!skills?.length) return;
        pushSectionHeading(sectionTitles.skills);
        const style = templateDefinition.skillStyle;
        if (style === 'comma') {
          addParagraph(
            new Paragraph({
              spacing: { after: 120 },
              children: [new TextRun({ text: skills.join(', ') })],
            })
          );
        } else if (style === 'grid') {
          const chunkSize = 3;
          for (let i = 0; i < skills.length; i += chunkSize) {
            const chunk = skills.slice(i, i + chunkSize).join('    ');
            addParagraph(
              new Paragraph({
                spacing: { after: 60 },
                children: [new TextRun({ text: chunk })],
              })
            );
          }
        } else {
          skills.forEach((skill) =>
            addParagraph(
              new Paragraph({
                text: skill,
                bullet: { level: 0 },
              })
            )
          );
          addSpacer(60);
        }
      },
      experience: () => {
        if (!experience?.length) return;
        pushSectionHeading(sectionTitles.experience);
        experience.forEach((role) => {
          const titleParts = [role.title, role.company].filter(Boolean);
          if (titleParts.length) {
            addParagraph(
              new Paragraph({
                spacing: { after: 20 },
                children: [
                  new TextRun({
                    text: titleParts.join(' - '),
                    bold: true,
                    color: accent,
                  }),
                ],
              })
            );
          }
          const metaLine = [role.location, role.date].filter(Boolean).join(' | ');
          if (metaLine) {
            addParagraph(
              new Paragraph({
                spacing: { after: 60 },
                children: [new TextRun({ text: metaLine, color: '#475569' })],
              })
            );
          }
          role.responsibilities
            ?.map((item) => item.trim())
            .filter(Boolean)
            .forEach((item) =>
              addParagraph(
                new Paragraph({
                  text: item,
                  bullet: { level: 0 },
                })
              )
            );
          addSpacer(60);
        });
      },
      education: () => {
        if (!education?.length) return;
        pushSectionHeading(sectionTitles.education);
        education.forEach((entry) => {
          const degreeLine = [entry.degree, entry.field].filter(Boolean).join(' in ');
          if (degreeLine) {
            addParagraph(
              new Paragraph({
                spacing: { after: 20 },
                children: [
                  new TextRun({
                    text: degreeLine,
                    bold: true,
                    color: accent,
                  }),
                ],
              })
            );
          }
          const institutionLine = [entry.institution, entry.location].filter(Boolean).join(' | ');
          const secondLine = [institutionLine, entry.date].filter(Boolean).join(' | ');
          if (secondLine) {
            addParagraph(
              new Paragraph({
                spacing: { after: 60 },
                children: [new TextRun({ text: secondLine, color: '#475569' })],
              })
            );
          }
          if (entry.details) {
            addParagraph(
              new Paragraph({
                spacing: { after: 80 },
                children: [new TextRun({ text: entry.details })],
              })
            );
          }
        });
      },
      certifications: () => {
        if (!certifications?.length) return;
        pushSectionHeading(sectionTitles.certifications);
        certifications
          .map((cert) => cert.trim())
          .filter(Boolean)
          .forEach((cert) =>
            addParagraph(
              new Paragraph({
                text: cert,
                bullet: { level: 0 },
              })
            )
          );
        addSpacer(40);
      },
      projects: () => {
        if (!projects?.length) return;
        pushSectionHeading(sectionTitles.projects);
        projects.forEach((project) => {
          const titleLine = [project.title, project.link].filter(Boolean).join(' - ');
          if (titleLine) {
            addParagraph(
              new Paragraph({
                spacing: { after: 20 },
                children: [
                  new TextRun({
                    text: titleLine,
                    bold: true,
                    color: accent,
                  }),
                ],
              })
            );
          }
          if (project.description) {
            addParagraph(
              new Paragraph({
                spacing: { after: 80 },
                children: [new TextRun({ text: project.description })],
              })
            );
          }
        });
      },
      languages: () => {
        if (!languages?.length) return;
        pushSectionHeading(sectionTitles.languages);
        addParagraph(
          new Paragraph({
            spacing: { after: 120 },
            children: [new TextRun({ text: languages.join(', ') })],
          })
        );
      },
    };

    sectionOrder.forEach((sectionKey) => {
      sectionHandlers[sectionKey]?.();
    });

    if (!paragraphs.length) return;

    const docInstance = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    const blob = await Packer.toBlob(docInstance);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'astrocv_resume.docx';
    a.click();
    URL.revokeObjectURL(url);
  }, [tailoredResume, effectiveTemplateId]);

  const handleDownloadCoverLetterDocx = useCallback(async () => {
    if (!tailoredResume || !coverLetter) return;
    const docx = await import('docx');
    const { Document, Packer, Paragraph, HeadingLevel } = docx;

    const children: any[] = [];
    const contactLine = [tailoredResume.header.email, tailoredResume.header.phone]
      .filter((part) => part && part.trim().length > 0)
      .join(' | ');

    if (tailoredResume.header.name) {
      children.push(
        new Paragraph({
          text: tailoredResume.header.name,
          heading: HeadingLevel.HEADING_2,
        })
      );
    }
    if (contactLine) {
      children.push(new Paragraph({ text: contactLine }));
    }
    children.push(new Paragraph({ text: '' }));

    coverLetter
      .split(/\r?\n/)
      .reduce<string[]>((acc, line) => {
        if (line.trim() === '') {
          acc.push('');
        } else {
          acc.push(line.trim());
        }
        return acc;
      }, [])
      .forEach((line) => {
        children.push(
          new Paragraph({
            text: line,
            spacing: { after: 160 },
          })
        );
      });

    const docInstance = new Document({
      sections: [
        {
          properties: {},
          children,
        },
      ],
    });

    const blob = await Packer.toBlob(docInstance);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'astrocv_cover_letter.docx';
    a.click();
    URL.revokeObjectURL(url);
  }, [tailoredResume, coverLetter]);

  const handleDownloadEmailDocx = useCallback(async () => {
    if (!tailoredResume || !followUpEmail) return;
    const docx = await import('docx');
    const { Document, Packer, Paragraph, HeadingLevel } = docx;

    const children: any[] = [];

    if (tailoredResume.header.name) {
      children.push(
        new Paragraph({
          text: `Follow-up email for ${tailoredResume.header.name}`,
          heading: HeadingLevel.HEADING_2,
        })
      );
      children.push(new Paragraph({ text: '' }));
    }

    followUpEmail
      .split(/\r?\n/)
      .forEach((line) => {
        const trimmed = line.trim();
        children.push(
          new Paragraph({
            text: trimmed,
            spacing: { after: 140 },
          })
        );
      });

    const docInstance = new Document({
      sections: [
        {
          properties: {},
          children,
        },
      ],
    });

    const blob = await Packer.toBlob(docInstance);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'astrocv_follow_up_email.docx';
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

  const docTabs = useMemo(
    () => [
      { id: 'resume' as const, label: 'Resume', helper: 'Full preview with your selected template.' },
      {
        id: 'coverLetter' as const,
        label: 'Cover Letter',
        helper: 'Polished, job-specific messaging ready to send.',
      },
      {
        id: 'followUp' as const,
        label: 'Follow-up Email',
        helper: 'Send after your application to stay top-of-mind.',
      },
    ],
    []
  );

  const activeTabMeta = docTabs.find((tab) => tab.id === activeDocTab) ?? docTabs[0];

  const activeTemplateDefinition = useMemo(
    () => templateDefinitions[effectiveTemplateId],
    [effectiveTemplateId]
  );

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
      setRecoverMsg('Purchase recovered. You can download now.');
    } catch (e) {
      const msg = (e as any)?.message || 'Could not recover purchase.';
      setRecoverMsg(msg);
    } finally {
      setRecovering(false);
    }
  }, [setToken, setPaid, setPurchaseType]);

  // Auto-download handling (single purchase)
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

            <section className="rounded-3xl border border-gray-800/70 bg-gray-900/50 p-5 sm:p-6 shadow-lg shadow-blue-900/10">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-100 sm:text-xl">Choose your template</h2>
                    <p className="text-sm text-gray-400">
                      Switch layouts anytime — your downloads update instantly.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-400">
                    {templateDefinitions[effectiveTemplateId]?.label || 'Template'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {resumeTemplateGroups.map((group) => {
                    const isActiveGroup = group.id === activeTemplateCategory;
                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => setActiveTemplateCategory(group.id)}
                        aria-pressed={isActiveGroup}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          isActiveGroup
                            ? 'border-blue-500/80 bg-blue-500/15 text-blue-100 shadow shadow-blue-900/30'
                            : 'border-gray-800/70 text-gray-300 hover:border-blue-500/40 hover:text-blue-100'
                        }`}
                      >
                        {group.title}
                      </button>
                    );
                  })}
                </div>

                {activeCategoryMeta?.description ? (
                  <p className="text-xs text-gray-500">{activeCategoryMeta.description}</p>
                ) : null}

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-gray-900/50 to-transparent" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-gray-900/50 to-transparent" />
                  <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pr-4 sm:gap-4 sm:pr-6">
                    {visibleTemplates.map((option) => {
                      const isActive = option.id === effectiveTemplateId;
                      const definition = templateDefinitions[option.id];
                      const accent = definition?.accent ?? '#3b82f6';
                      const previewGradient = `linear-gradient(135deg, ${accent}33, ${accent}05)`;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => selectTemplateById(option.id)}
                          aria-pressed={isActive}
                          className={`snap-start rounded-2xl border px-5 py-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${
                            isActive
                              ? 'border-blue-500/90 bg-blue-500/10 text-blue-100 shadow-lg shadow-blue-900/30'
                              : 'border-gray-800/70 bg-gray-900/60 text-gray-200 hover:border-blue-500/40 hover:text-blue-100'
                          } min-w-[220px]`}
                        >
                          <div
                            className="mb-3 h-20 overflow-hidden rounded-xl border border-gray-800/60"
                            style={{ background: previewGradient }}
                          >
                            <div className="h-full w-full bg-gradient-to-br from-white/5 via-transparent to-black/10" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold">{option.label}</span>
                              {isActive ? (
                                <span className="rounded-full border border-blue-400/80 bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-200">
                                  Selected
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs text-gray-400">{option.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-800/70 bg-gray-900/40 shadow-lg">
              <div className="p-5 sm:p-6 space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-100">
                      Latest package
                    </span>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-100 sm:text-3xl">
                        {tailoredResume.header.name || 'Tailored package'}
                      </h2>
                      <p className="text-sm text-gray-400">
                        Your resume, cover letter, and follow-up email stay saved here. Switch tabs to browse each document.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-2 text-sm text-gray-400 sm:items-end">
                    {activeTemplateDefinition ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-800/60 px-3 py-1 text-xs text-gray-300 whitespace-nowrap">
                        Template:{' '}
                        <span className="font-medium text-gray-100">{activeTemplateDefinition.label}</span>
                      </span>
                    ) : null}
                    {!isPaid && (
                      <button
                        onClick={handleRecover}
                        disabled={recovering}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-700 px-4 py-2 text-xs font-semibold text-gray-200 transition hover:border-blue-400 hover:text-blue-200 disabled:opacity-50"
                        title="Recover your purchase if the download didn't start"
                      >
                        {recovering ? 'Recovering purchase...' : 'Recover purchase'}
                      </button>
                    )}
                    {!isPaid && recoverMsg ? (
                      <p className="max-w-[240px] text-xs text-gray-500 sm:text-right">{recoverMsg}</p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {docTabs.map((tab) => {
                    const isActive = tab.id === activeDocTab;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveDocTab(tab.id)}
                        className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                          isActive
                            ? 'border-blue-500/80 bg-blue-500/15 text-blue-100 shadow shadow-blue-900/30'
                            : 'border-gray-800/70 text-gray-300 hover:border-blue-500/50 hover:text-blue-100'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs text-gray-500 sm:text-sm">{activeTabMeta.helper}</p>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-800/60 bg-gray-900/50 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
                    {activeTabMeta.label} actions
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {activeDocTab === 'resume' ? (
                      <>
                        <button
                          onClick={handleDownloadResume}
                          className="inline-flex items-center rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-600"
                        >
                          Download PDF
                        </button>
                        <button
                          onClick={handleDownloadResumeDocx}
                          className="inline-flex items-center rounded-full border border-blue-400/70 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-100 transition hover:border-blue-300 hover:text-white"
                        >
                          Download DOCX
                        </button>
                      </>
                    ) : null}
                    {activeDocTab === 'coverLetter' ? (
                      <>
                        <button
                          type="button"
                          onClick={handleCopyCoverLetter}
                          disabled={!coverLetter || !coverLetter.trim()}
                          className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold transition ${
                            coverLetterCopied
                              ? 'border-blue-500 bg-blue-500/10 text-blue-100'
                              : 'border-gray-700 text-gray-200 hover:border-blue-400 hover:text-blue-200'
                          } disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {coverLetterCopied ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={handleDownloadCoverLetter}
                          className="inline-flex items-center rounded-full border border-gray-700 px-4 py-2 text-xs font-semibold text-gray-200 transition hover:border-blue-400 hover:text-blue-200"
                        >
                          Download PDF
                        </button>
                        <button
                          onClick={handleDownloadCoverLetterDocx}
                          disabled={!coverLetter || !coverLetter.trim()}
                          className="inline-flex items-center rounded-full border border-blue-400/60 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-100 transition hover:border-blue-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Download DOCX
                        </button>
                      </>
                    ) : null}
                    {activeDocTab === 'followUp' ? (
                      <>
                        <button
                          type="button"
                          onClick={handleCopyFollowUpEmail}
                          disabled={!followUpEmail || !followUpEmail.trim()}
                          className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold transition ${
                            followUpCopied
                              ? 'border-blue-500 bg-blue-500/10 text-blue-100'
                              : 'border-gray-700 text-gray-200 hover:border-blue-400 hover:text-blue-200'
                          } disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {followUpCopied ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={handleDownloadEmail}
                          className="inline-flex items-center rounded-full border border-gray-700 px-4 py-2 text-xs font-semibold text-gray-200 transition hover:border-blue-400 hover:text-blue-200"
                        >
                          Download PDF
                        </button>
                        <button
                          onClick={handleDownloadEmailDocx}
                          disabled={!followUpEmail || !followUpEmail.trim()}
                          className="inline-flex items-center rounded-full border border-blue-400/60 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-100 transition hover:border-blue-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Download DOCX
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-800/60 bg-gray-900/50">
                  {activeDocTab === 'resume' ? (
                    <div className="h-[680px] sm:h-[760px]">
                      <ResumePreviewViewer
                        tailoredResume={tailoredResume}
                        templateId={effectiveTemplateId}
                        locked={false}
                      />
                    </div>
                  ) : null}
                  {activeDocTab === 'coverLetter' ? (
                    <div className="h-[520px] sm:h-[680px]">
                      <CoverLetterPreviewViewer
                        name={tailoredResume.header.name}
                        email={tailoredResume.header.email}
                        content={coverLetter || ''}
                      />
                    </div>
                  ) : null}
                  {activeDocTab === 'followUp' ? (
                    <div className="h-[520px] sm:h-[680px]">
                      <EmailPreviewViewer
                        name={tailoredResume.header.name}
                        email={tailoredResume.header.email}
                        content={followUpEmail || ''}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            {creditBanner ? <div>{creditBanner}</div> : null}

            <section className="rounded-2xl border border-gray-800/70 bg-gray-900/40 p-5 sm:p-6 shadow-lg">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-100 sm:text-xl">
                    Ready for the next role?
                  </h3>
                  <p className="text-sm text-gray-400">
                    Upload a fresh resume or job description and we'll tailor a new package in seconds. Your current documents stay saved here.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <button
                    onClick={goToUploadSection}
                    className="inline-flex items-center justify-center rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 whitespace-nowrap"
                  >
                    Tailor another resume
                  </button>
                  <Link
                    href="/#upload-section"
                    className="inline-flex items-center justify-center rounded-full border border-gray-700 px-5 py-2 text-sm font-semibold text-gray-200 transition hover:border-blue-400 hover:text-blue-200 whitespace-nowrap"
                  >
                    View upload options
                  </Link>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Plan picker modal used to unlock resume */}
      <PlanPickerModal open={planOpen} onClose={() => setPlanOpen(false)} />
    </main>
  );
}




























