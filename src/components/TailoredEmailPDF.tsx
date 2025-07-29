import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
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
    fontSize: 12,
    lineHeight: 1.5,
    color: '#111827',
  },
  header: {
    marginBottom: 20,
  },
  content: {
    marginTop: 10,
    whiteSpace: 'pre-wrap',
  },
});

interface Props {
  tailoredResume: TailoredResume;
}

export default function TailoredEmailPDF({ tailoredResume }: Props) {
  const { header, followUpEmail } = tailoredResume;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{header.name}</Text>
          <Text>{header.email}</Text>
          {header.phone && <Text>{header.phone}</Text>}
        </View>

        <View style={styles.content}>
          <Text>{followUpEmail}</Text>
        </View>
      </Page>
    </Document>
  );
}
