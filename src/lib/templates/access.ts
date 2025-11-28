// Centralized template access helpers shared across UI and API
import type { ResumeTemplateId } from '@/components/TailoredResumePDF';

export const TEMPLATE_ALIASES: Record<string, ResumeTemplateId> = {
  modern: 'corporate-modern',
  minimal: 'creative-minimal',
  elegant: 'creative-bold',
  classic: 'corporate-classic',
  structured: 'tech-lean',
  accented: 'creative-minimal',
};

export const FREE_TEMPLATE_IDS: ResumeTemplateId[] = [
  'corporate-classic',
  'tech-lean',
  'creative-minimal',
  'health-chronological',
];

export function normalizeTemplateId(templateId?: string | null): ResumeTemplateId {
  if (!templateId) return 'corporate-classic';
  const clean = templateId.trim();
  if (TEMPLATE_ALIASES[clean]) return TEMPLATE_ALIASES[clean];
  return (clean as ResumeTemplateId) || 'corporate-classic';
}

export function isTemplatePro(templateId?: string | null) {
  const id = normalizeTemplateId(templateId);
  return !FREE_TEMPLATE_IDS.includes(id);
}
