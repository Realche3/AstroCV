import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Link } from '@react-pdf/renderer';
import { TailoredResume } from '@/types/TailoredResume';
import { normalizeTemplateId as normalizeTemplateIdShared } from '@/lib/templates/access';

Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf' },
    { src: '/fonts/Inter-Bold.ttf', fontWeight: 700 },
  ],
});

type SectionKey = 'summary' | 'skills' | 'experience' | 'education' | 'certifications' | 'projects' | 'languages';

type TemplateCategoryId = 'corporate' | 'tech' | 'creative' | 'health' | 'operations';

export type ResumeTemplateId =
  | 'corporate-classic'
  | 'corporate-executive'
  | 'corporate-modern'
  | 'tech-skills'
  | 'tech-project'
  | 'tech-lean'
  | 'creative-minimal'
  | 'creative-bold'
  | 'creative-hybrid'
  | 'health-academic'
  | 'health-chronological'
  | 'health-functional'
  | 'operations-simple'
  | 'operations-achievement'
  | 'operations-compact';

interface TemplateProps {
  resume: TailoredResume;
  locked: boolean;
}

interface TemplateDefinition {
  id: ResumeTemplateId;
  category: TemplateCategoryId;
  label: string;
  description: string;
  access: 'free' | 'pro';
  accent: string;
  accentLight: string;
  headerVariant: 'standard' | 'band' | 'block';
  headerAlign?: 'left' | 'center';
  headerBackground?: string;
  headerTextColor?: string;
  headerContactColor?: string;
  pageBackground?: string;
  pagePadding?: number;
  bodyFontSize?: number;
  sectionOrder: SectionKey[];
  sectionTitles?: Partial<Record<SectionKey, string>>;
  showSectionDividers?: boolean;
  sectionSpacing?: number;
  skillStyle: 'comma' | 'pill' | 'grid';
  projectStyle: 'paragraph' | 'card';
  experienceStyle?: 'standard' | 'compact' | 'metrics';
}

export const templateDefinitions: Record<ResumeTemplateId, TemplateDefinition> = {
  'corporate-classic': {
    id: 'corporate-classic',
    category: 'corporate',
    label: 'Classic Chronological',
    description: 'Traditional reverse-chronological structure for steady progression.',
    access: 'free',
    accent: '#1d4ed8',
    accentLight: '#dbeafe',
    headerVariant: 'band',
    sectionOrder: ['summary', 'experience', 'skills', 'education', 'certifications', 'projects', 'languages'],
    skillStyle: 'comma',
    projectStyle: 'paragraph',
  },
  'corporate-executive': {
    id: 'corporate-executive',
    category: 'corporate',
    label: 'Executive Clean',
    description: 'Bold headings and clear summary space for leadership roles.',
    access: 'pro',
    accent: '#0f172a',
    accentLight: '#e2e8f0',
    headerVariant: 'band',
    sectionOrder: ['summary', 'skills', 'experience', 'education', 'certifications', 'projects', 'languages'],
    sectionTitles: { summary: 'Executive Summary', skills: 'Core Competencies' },
    skillStyle: 'pill',
    projectStyle: 'paragraph',
    showSectionDividers: true,
  },
  'corporate-modern': {
    id: 'corporate-modern',
    category: 'corporate',
    label: 'Modern Professional',
    description: 'Minimal separators and balanced layout for corporate roles.',
    access: 'pro',
    accent: '#2563eb',
    accentLight: '#dbeafe',
    headerVariant: 'standard',
    sectionOrder: ['summary', 'experience', 'skills', 'projects', 'education', 'certifications', 'languages'],
    skillStyle: 'pill',
    projectStyle: 'card',
  },
  'tech-skills': {
    id: 'tech-skills',
    category: 'tech',
    label: 'Technical Skills-Focused',
    description: 'Skills and tool stack highlighted before detailed experience.',
    access: 'pro',
    accent: '#0ea5e9',
    accentLight: '#cffafe',
    headerVariant: 'standard',
    sectionOrder: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'languages'],
    sectionTitles: { skills: 'Technical Skills' },
    skillStyle: 'grid',
    projectStyle: 'card',
  },
  'tech-project': {
    id: 'tech-project',
    category: 'tech',
    label: 'Project-Based Layout',
    description: 'Projects showcased with concise impact statements.',
    access: 'pro',
    accent: '#0284c7',
    accentLight: '#bae6fd',
    headerVariant: 'standard',
    sectionOrder: ['summary', 'projects', 'experience', 'skills', 'education', 'certifications', 'languages'],
    sectionTitles: { projects: 'Key Projects' },
    skillStyle: 'pill',
    projectStyle: 'card',
    experienceStyle: 'compact',
  },
  'tech-lean': {
    id: 'tech-lean',
    category: 'tech',
    label: 'Lean Tech Resume',
    description: 'Single-column minimal layout optimized for ATS parsing.',
    access: 'free',
    accent: '#0369a1',
    accentLight: '#bfdbfe',
    headerVariant: 'band',
    sectionOrder: ['summary', 'experience', 'skills', 'education', 'projects', 'certifications', 'languages'],
    skillStyle: 'comma',
    projectStyle: 'paragraph',
    experienceStyle: 'compact',
    pagePadding: 38,
    bodyFontSize: 10.2,
  },
  'creative-minimal': {
    id: 'creative-minimal',
    category: 'creative',
    label: 'Minimalist Creative',
    description: 'Light accent tone and generous spacing while staying ATS-safe.',
    access: 'free',
    accent: '#6366f1',
    accentLight: '#e0e7ff',
    headerVariant: 'block',
    headerBackground: '#4338ca',
    headerTextColor: '#f8fafc',
    headerContactColor: '#eef2ff',
    pageBackground: '#ffffff',
    sectionOrder: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'languages'],
    skillStyle: 'pill',
    projectStyle: 'card',
    showSectionDividers: true,
  },
  'creative-bold': {
    id: 'creative-bold',
    category: 'creative',
    label: 'Bold Header Template',
    description: 'Strong header block with clear sections and ATS-friendly text.',
    access: 'pro',
    accent: '#3b82f6',
    accentLight: '#dbeafe',
    headerVariant: 'block',
    headerBackground: '#1e3a8a',
    headerTextColor: '#eef2ff',
    headerContactColor: '#cbd5f5',
    headerAlign: 'center',
    sectionOrder: ['summary', 'experience', 'skills', 'projects', 'education', 'certifications', 'languages'],
    skillStyle: 'pill',
    projectStyle: 'card',
  },
  'creative-hybrid': {
    id: 'creative-hybrid',
    category: 'creative',
    label: 'Hybrid Layout',
    description: 'Combines skills and achievements before the detailed timeline.',
    access: 'pro',
    accent: '#1d4ed8',
    accentLight: '#c7d2fe',
    headerVariant: 'standard',
    sectionOrder: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'languages'],
    sectionTitles: { skills: 'Core Strengths' },
    skillStyle: 'grid',
    projectStyle: 'paragraph',
    showSectionDividers: true,
  },
  'health-academic': {
    id: 'health-academic',
    category: 'health',
    label: 'Academic CV Style',
    description: 'Education-first layout with space for research and credentials.',
    access: 'pro',
    accent: '#0f766e',
    accentLight: '#ccfbf1',
    headerVariant: 'band',
    sectionOrder: ['summary', 'education', 'experience', 'projects', 'certifications', 'skills', 'languages'],
    sectionTitles: { projects: 'Research & Projects', certifications: 'Licenses & Certifications' },
    skillStyle: 'comma',
    projectStyle: 'paragraph',
    showSectionDividers: true,
  },
  'health-chronological': {
    id: 'health-chronological',
    category: 'health',
    label: 'Healthcare Chronological',
    description: 'Clean structure highlighting clinical experience and credentials.',
    access: 'free',
    accent: '#15803d',
    accentLight: '#bbf7d0',
    headerVariant: 'band',
    sectionOrder: ['summary', 'experience', 'certifications', 'skills', 'education', 'projects', 'languages'],
    sectionTitles: { certifications: 'Licenses & Certifications' },
    skillStyle: 'pill',
    projectStyle: 'paragraph',
  },
  'health-functional': {
    id: 'health-functional',
    category: 'health',
    label: 'Functional Skills Emphasis',
    description: 'Groups core strengths before summarizing role history.',
    access: 'pro',
    accent: '#0f766e',
    accentLight: '#ccfbf1',
    headerVariant: 'standard',
    sectionOrder: ['summary', 'skills', 'experience', 'education', 'certifications', 'projects', 'languages'],
    skillStyle: 'grid',
    projectStyle: 'paragraph',
    experienceStyle: 'compact',
  },
  'operations-simple': {
    id: 'operations-simple',
    category: 'operations',
    label: 'Simple Chronological',
    description: 'Straightforward timeline with skills and credentials.',
    access: 'pro',
    accent: '#334155',
    accentLight: '#e2e8f0',
    headerVariant: 'standard',
    sectionOrder: ['summary', 'experience', 'skills', 'certifications', 'education', 'projects', 'languages'],
    skillStyle: 'comma',
    projectStyle: 'paragraph',
  },
  'operations-achievement': {
    id: 'operations-achievement',
    category: 'operations',
    label: 'Achievement-Oriented',
    description: 'Highlights measurable outcomes for each position.',
    access: 'pro',
    accent: '#b45309',
    accentLight: '#fef3c7',
    headerVariant: 'band',
    sectionOrder: ['summary', 'experience', 'skills', 'certifications', 'education', 'projects', 'languages'],
    sectionTitles: { summary: 'Performance Summary' },
    skillStyle: 'pill',
    projectStyle: 'card',
    experienceStyle: 'metrics',
    showSectionDividers: true,
  },
  'operations-compact': {
    id: 'operations-compact',
    category: 'operations',
    label: 'Compact One-Page',
    description: 'Brevity-first layout for quick scanning in the field.',
    access: 'pro',
    accent: '#475569',
    accentLight: '#e2e8f0',
    headerVariant: 'standard',
    sectionOrder: ['summary', 'experience', 'skills', 'education', 'certifications', 'projects', 'languages'],
    skillStyle: 'comma',
    projectStyle: 'paragraph',
    experienceStyle: 'compact',
    pagePadding: 32,
    bodyFontSize: 10,
  },
};

export const normalizeTemplateId = normalizeTemplateIdShared;

function createStyles(def: TemplateDefinition) {
  const baseFont = def.bodyFontSize ?? 10.5;
  const sectionSpacing = def.sectionSpacing ?? 14;
  return StyleSheet.create({
    page: {
      padding: def.pagePadding ?? 40,
      fontFamily: 'Inter',
      fontSize: baseFont,
      lineHeight: 1.45,
      color: '#111827',
      position: 'relative',
      backgroundColor: def.pageBackground ?? '#ffffff',
    },
    watermarkWrap: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    watermarkText: {
      opacity: 0.08,
      fontSize: 60,
      fontWeight: 700,
      color: def.accent,
      transform: 'rotate(-28deg)',
      textAlign: 'center',
    },
    headerWrap:
      def.headerVariant === 'block'
        ? {
            backgroundColor: def.headerBackground ?? def.accent,
            borderRadius: 14,
            padding: 16,
            marginBottom: 18,
          }
        : def.headerVariant === 'band'
        ? {
            borderBottomWidth: 2,
            borderBottomColor: def.accent,
            paddingBottom: 12,
            marginBottom: 16,
          }
        : {
            marginBottom: 14,
          },
    headerName: {
      fontSize: baseFont + 10,
      fontWeight: 700,
      color: def.headerTextColor ?? '#0f172a',
      textAlign: def.headerAlign ?? 'left',
    },
    headerContact: {
      marginTop: 6,
      fontSize: baseFont - 1,
      color: def.headerContactColor ?? '#475569',
      textAlign: def.headerAlign ?? 'left',
    },
    section: {
      marginBottom: sectionSpacing,
    },
    sectionTitle: {
      fontSize: baseFont + 1,
      fontWeight: 700,
      color: def.accent,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 6,
    },
    sectionTitleNormal: {
      fontSize: baseFont + 1,
      fontWeight: 700,
      color: def.accent,
      marginBottom: 6,
    },
    bodyText: {
      fontSize: baseFont,
      color: '#1f2937',
      marginBottom: 3,
    },
    entry: {
      marginBottom: 8,
    },
    entryCompact: {
      marginBottom: 6,
    },
    entryTitle: {
      fontSize: baseFont + 0.3,
      fontWeight: 600,
      color: '#0f172a',
    },
    entryMeta: {
      fontSize: baseFont - 0.5,
      color: '#64748b',
      marginBottom: 3,
    },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 2,
    },
    bulletMarker: {
      width: 10,
      fontWeight: 700,
      color: def.accent,
    },
    bulletMarkerMetrics: {
      width: 10,
      fontWeight: 700,
      color: def.accent,
    },
    bulletText: {
      flex: 1,
      fontSize: baseFont,
      color: '#1f2937',
    },
    bulletTextCompact: {
      flex: 1,
      fontSize: baseFont - 0.2,
      color: '#1f2937',
    },
    skillWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginRight: -6,
    },
    skillPill: {
      borderWidth: 1,
      borderColor: def.accentLight,
      borderRadius: 14,
      paddingVertical: 3,
      paddingHorizontal: 8,
      fontSize: baseFont - 0.5,
      color: '#0f172a',
      marginRight: 6,
      marginBottom: 6,
    },
    skillGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    skillColumn: {
      width: '48%',
    },
    skillColumnItem: {
      fontSize: baseFont,
      color: '#1f2937',
      marginBottom: 3,
    },
    projectCard: {
      borderWidth: 1,
      borderColor: def.accentLight,
      borderRadius: 10,
      padding: 10,
      marginBottom: 8,
      backgroundColor: '#ffffff',
    },
    projectTitle: {
      fontSize: baseFont + 0.3,
      fontWeight: 600,
      color: '#0f172a',
      marginBottom: 3,
    },
    projectLink: {
      fontSize: baseFont - 0.3,
      color: def.accent,
      marginBottom: 3,
    },
    divider: {
      height: 1,
      backgroundColor: '#e2e8f0',
      marginBottom: sectionSpacing - 6,
    },
    link: {
      color: def.accent,
      textDecoration: 'underline',
    },
  });
}

function renderTemplate(def: TemplateDefinition, { resume, locked }: TemplateProps) {
  const styles = createStyles(def);
  const { header, summary, skills, education, experience, certifications, projects, languages } = resume;

  const toText = (value: string | null | undefined) => (typeof value === 'string' ? value.trim() : '');
  const stringNotEmpty = (value: string): value is string => value.length > 0;

  const contactParts = [header.phone, header.email, header.linkedin, header.portfolio]
    .map((item) => toText(item))
    .filter(stringNotEmpty);

  const summaryText = toText(summary);
  const skillList = Array.isArray(skills) ? skills.map((item) => toText(item)).filter(stringNotEmpty) : [];

  const educationEntries = Array.isArray(education)
    ? education
        .map((item) => {
          const degree = toText(item.degree);
          const field = toText(item.field);
          const institution = toText(item.institution);
          const location = toText(item.location);
          const date = toText(item.date);
          const details = toText(item.details);
          const hasDetails = [degree, field, institution, location, date, details].some(stringNotEmpty);
          if (!hasDetails) return null;
          return { degree, field, institution, location, date, details };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
    : [];

  const experienceEntries = Array.isArray(experience)
    ? experience
        .map((item) => {
          const title = toText(item.title);
          const company = toText(item.company);
          const location = toText(item.location);
          const date = toText(item.date);
          const responsibilities = Array.isArray(item.responsibilities)
            ? item.responsibilities.map((responsibility) => toText(responsibility)).filter(stringNotEmpty)
            : [];
          const hasDetails = [title, company, location, date].some(stringNotEmpty) || responsibilities.length > 0;
          if (!hasDetails) return null;
          return { title, company, location, date, responsibilities };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
    : [];

  const certificationList = Array.isArray(certifications)
    ? certifications.map((item) => toText(item)).filter(stringNotEmpty)
    : [];

  const projectEntries = Array.isArray(projects)
    ? projects
        .map((item) => {
          const title = toText(item.title);
          const link = toText(item.link);
          const description = toText(item.description);
          const hasDetails = [title, description].some(stringNotEmpty);
          if (!hasDetails) return null;
          return { title, link, description };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
    : [];

  const languageList = Array.isArray(languages)
    ? languages.map((item) => toText(item)).filter(stringNotEmpty)
    : [];

  const sectionTitleMap: Record<SectionKey, string> = {
    summary: 'Summary',
    skills: 'Skills',
    experience: 'Experience',
    education: 'Education',
    certifications: 'Certifications',
    projects: 'Projects',
    languages: 'Languages',
  };

  if (def.sectionTitles) {
    for (const key of Object.keys(def.sectionTitles) as SectionKey[]) {
      sectionTitleMap[key] = def.sectionTitles[key] as string;
    }
  }

  const sections = def.sectionOrder.map((key) => {
    switch (key) {
      case 'summary':
        if (!summaryText) return null;
        return (
          <View key="summary" style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{sectionTitleMap.summary}</Text>
            <Text style={styles.bodyText}>{summaryText}</Text>
          </View>
        );
      case 'skills':
        if (skillList.length === 0) return null;
        if (def.skillStyle === 'pill') {
          return (
            <View key="skills" style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>{sectionTitleMap.skills}</Text>
              <View style={styles.skillWrap}>
                {skillList.map((skill, idx) => (
                  <Text key={idx} style={styles.skillPill}>{skill}</Text>
                ))}
              </View>
            </View>
          );
        }
        if (def.skillStyle === 'grid') {
          const midpoint = Math.ceil(skillList.length / 2);
          const columns = [skillList.slice(0, midpoint), skillList.slice(midpoint)];
          return (
            <View key="skills" style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>{sectionTitleMap.skills}</Text>
              <View style={styles.skillGrid}>
                {columns.map((column, columnIndex) => (
                  <View key={columnIndex} style={styles.skillColumn}>
                    {column.map((skill, skillIndex) => (
                      <Text key={skillIndex} style={styles.skillColumnItem}>{skill}</Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          );
        }
        return (
          <View key="skills" style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{sectionTitleMap.skills}</Text>
            <Text style={styles.bodyText}>{skillList.join(', ')}</Text>
          </View>
        );
      case 'experience':
        if (experienceEntries.length === 0) return null;
        return (
          <View key="experience" style={styles.section} wrap>
            <Text style={styles.sectionTitle}>{sectionTitleMap.experience}</Text>
            {experienceEntries.map((exp, idx) => {
              const titleParts = [exp.title, exp.company].filter(stringNotEmpty);
              const metaParts = [exp.location, exp.date].filter(stringNotEmpty);
              return (
                <View key={idx} style={def.experienceStyle === 'compact' ? styles.entryCompact : styles.entry}>
                  {titleParts.length > 0 ? (
                    <Text style={styles.entryTitle}>{titleParts.join(' | ')}</Text>
                  ) : null}
                  {metaParts.length > 0 ? (
                    <Text style={styles.entryMeta}>{metaParts.join(' | ')}</Text>
                  ) : null}
                  {exp.responsibilities.map((item, itemIndex) => (
                    <View key={itemIndex} style={styles.bulletRow}>
                      <Text style={def.experienceStyle === 'metrics' ? styles.bulletMarkerMetrics : styles.bulletMarker}>
                        {def.experienceStyle === 'metrics' ? '+' : '-'}
                      </Text>
                      <Text style={def.experienceStyle === 'compact' ? styles.bulletTextCompact : styles.bulletText}>{item}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        );
      case 'education':
        if (educationEntries.length === 0) return null;
        return (
          <View key="education" style={styles.section} wrap>
            <Text style={styles.sectionTitle}>{sectionTitleMap.education}</Text>
            {educationEntries.map((edu, idx) => {
              const titleText = edu.degree && edu.field ? `${edu.degree} in ${edu.field}` : edu.degree || edu.field;
              const institutionParts = [edu.institution, edu.location].filter(stringNotEmpty);
              const metaParts = [institutionParts.join(', '), edu.date].filter(stringNotEmpty);
              return (
                <View key={idx} style={styles.entry}>
                  {titleText ? <Text style={styles.entryTitle}>{titleText}</Text> : null}
                  {metaParts.length > 0 ? <Text style={styles.entryMeta}>{metaParts.join(' | ')}</Text> : null}
                  {edu.details ? <Text style={styles.bodyText}>{edu.details}</Text> : null}
                </View>
              );
            })}
          </View>
        );
      case 'certifications':
        if (certificationList.length === 0) return null;
        return (
          <View key="certifications" style={styles.section} wrap>
            <Text style={styles.sectionTitle}>{sectionTitleMap.certifications}</Text>
            {certificationList.map((cert, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <Text style={styles.bulletMarker}>-</Text>
                <Text style={styles.bulletText}>{cert}</Text>
              </View>
            ))}
          </View>
        );
      case 'projects':
        if (projectEntries.length === 0) return null;
        if (def.projectStyle === 'card') {
          return (
            <View key="projects" style={styles.section} wrap>
              <Text style={styles.sectionTitle}>{sectionTitleMap.projects}</Text>
              {projectEntries.map((proj, idx) => (
                <View key={idx} style={styles.projectCard}>
                  {proj.title ? <Text style={styles.projectTitle}>{proj.title}</Text> : null}
                  {proj.link ? (
                    <Text style={styles.projectLink}>
                      <Link src={proj.link} style={styles.link}>{proj.link}</Link>
                    </Text>
                  ) : null}
                  {proj.description ? <Text style={styles.bodyText}>{proj.description}</Text> : null}
                </View>
              ))}
            </View>
          );
        }
        return (
          <View key="projects" style={styles.section} wrap>
            <Text style={styles.sectionTitle}>{sectionTitleMap.projects}</Text>
            {projectEntries.map((proj, idx) => (
              <View key={idx} style={styles.entry}>
                {proj.title ? <Text style={styles.entryTitle}>{proj.title}</Text> : null}
                {proj.link ? (
                  <Text style={styles.bodyText}>
                    <Link src={proj.link} style={styles.link}>{proj.link}</Link>
                  </Text>
                ) : null}
                {proj.description ? <Text style={styles.bodyText}>{proj.description}</Text> : null}
              </View>
            ))}
          </View>
        );
      case 'languages':
        if (languageList.length === 0) return null;
        return (
          <View key="languages" style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{sectionTitleMap.languages}</Text>
            <Text style={styles.bodyText}>{languageList.join(', ')}</Text>
          </View>
        );
      default:
        return null;
    }
  }).filter(Boolean) as React.ReactNode[];


  return (
    <Page size="A4" style={styles.page} wrap>
      {locked && (
        <View style={styles.watermarkWrap}>
          <Text style={styles.watermarkText}>astroCV demo</Text>
        </View>
      )}

      <View style={styles.headerWrap}>
        <Text style={styles.headerName}>{header.name}</Text>
        {contactParts.length > 0 ? (
          <Text style={styles.headerContact}>{contactParts.join(' | ')}</Text>
        ) : null}
      </View>

      {sections.map((section, index) => (
        <React.Fragment key={def.sectionOrder[index]}>
          {section}
          {def.showSectionDividers && index < sections.length - 1 ? <View style={styles.divider} /> : null}
        </React.Fragment>
      ))}
    </Page>
  );
}

const templateMap = Object.fromEntries(
  Object.values(templateDefinitions).map((definition) => [
    definition.id,
    (props: TemplateProps) => renderTemplate(definition, props),
  ])
) as Record<ResumeTemplateId, (props: TemplateProps) => React.ReactElement>;

interface ResumeTemplateOption {
  id: ResumeTemplateId;
  category: TemplateCategoryId;
  label: string;
  description: string;
  access: 'free' | 'pro';
}

export const resumeTemplateOptions: ResumeTemplateOption[] = Object.values(templateDefinitions).map((def) => ({
  id: def.id,
  category: def.category,
  label: def.label,
  description: def.description,
  access: def.access,
}));

const TEMPLATE_CATEGORY_META: Record<TemplateCategoryId, { title: string; description: string }> = {
  corporate: {
    title: 'Corporate & Business Roles',
    description: 'Polished layouts for business, consulting, and leadership positions.',
  },
  tech: {
    title: 'Tech & Engineering',
    description: 'Highlight technical expertise, projects, and tool stacks.',
  },
  creative: {
    title: 'Creative but ATS-Safe',
    description: 'Subtle accents and generous spacing that still pass ATS checks.',
  },
  health: {
    title: 'Healthcare & Education',
    description: 'Structured formats for clinical, academic, and teaching roles.',
  },
  operations: {
    title: 'Skilled Trades & Operations',
    description: 'Concise timelines and measurable impact for hands-on work.',
  },
};

export const resumeTemplateGroups = (Object.keys(TEMPLATE_CATEGORY_META) as TemplateCategoryId[]).map((category) => ({
  id: category,
  title: TEMPLATE_CATEGORY_META[category].title,
  description: TEMPLATE_CATEGORY_META[category].description,
  templates: resumeTemplateOptions.filter((option) => option.category === category),
}));

interface TailoredResumePDFProps {
  tailoredResume: TailoredResume;
  locked?: boolean;
  templateId?: string;
}

export default function TailoredResumePDF({ tailoredResume, locked = false, templateId }: TailoredResumePDFProps) {
  const resolvedTemplateId = normalizeTemplateId(templateId);
  const Template = templateMap[resolvedTemplateId] ?? templateMap['corporate-classic'];

  return (
    <Document>
      <Template resume={tailoredResume} locked={locked} />
    </Document>
  );
}
