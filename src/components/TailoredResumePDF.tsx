import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Link } from '@react-pdf/renderer';
import { TailoredResume } from '@/types/TailoredResume';

Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf' },
    { src: '/fonts/Inter-Bold.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 11,
    lineHeight: 1.4,
    color: '#111827',
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 10,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 4,
    textTransform: 'uppercase',
    color: '#1f2937',
  },
  bullet: {
    marginLeft: 12,
    marginBottom: 2,
  },
  text: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 2,
  },
  link: {
    color: '#2563eb',
    textDecoration: 'underline',
  },
});

interface TailoredResumePDFProps {
  tailoredResume: TailoredResume;
}

export default function TailoredResumePDF({ tailoredResume }: TailoredResumePDFProps) {
  const { header, summary, skills, education, experience, certifications, projects, languages } = tailoredResume;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.section}>
          <Text style={styles.headerName}>{header.name}</Text>
          <Text style={styles.contactInfo}>
            {header.phone} | {header.email}
            {header.linkedin && ` | ${header.linkedin}`}
            {header.portfolio && ` | ${header.portfolio}`}
          </Text>
        </View>

        {/* Summary */}
        {summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.text}>{summary}</Text>
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.text}>{skills.join(', ')}</Text>
          </View>
        )}

        {/* Education */}
        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, idx) => (
              <View key={idx} style={{ marginBottom: 4 }}>
                <Text style={{ fontWeight: 'bold' }}>
                  {edu.degree} in {edu.field}
                </Text>
                <Text style={styles.text}>
                  {edu.institution}, {edu.location} ({edu.date})
                </Text>
                {edu.details && <Text style={styles.text}>{edu.details}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((exp, idx) => (
              <View key={idx} style={{ marginBottom: 4 }}>
                <Text style={{ fontWeight: 'bold' }}>
                  {exp.title} – {exp.company}
                </Text>
                <Text style={styles.text}>
                  {exp.location} | {exp.date}
                </Text>
                {exp.responsibilities.map((item, i) => (
                  <Text key={i} style={styles.bullet}>
                    • {item}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {certifications.map((cert, idx) => (
              <Text key={idx} style={styles.text}>
                • {cert}
              </Text>
            ))}
          </View>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((proj, idx) => (
              <View key={idx} style={{ marginBottom: 4 }}>
                <Text style={{ fontWeight: 'bold' }}>{proj.title}</Text>
                {proj.link && (
                  <Text style={styles.text}>
                    <Link src={proj.link} style={styles.link}>
                      {proj.link}
                    </Link>
                  </Text>
                )}
                <Text style={styles.text}>{proj.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <Text style={styles.text}>{languages.join(', ')}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
