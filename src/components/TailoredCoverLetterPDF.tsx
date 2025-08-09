// src/components/TailoredCoverLetterPDF.tsx
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

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
    lineHeight: 1.5,
    color: '#111827',
  },
  headerName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 12,
  },
  content: {
    fontSize: 11,
    color: '#374151',
  },
});

interface Props {
  name: string;
  email: string;
  content: string;
}

export default function TailoredCoverLetterPDF({ name, email, content }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.headerName}>{name}</Text>
          <Text style={styles.contactInfo}>{email}</Text>
        </View>
        <View>
          <Text style={styles.content}>{content}</Text>
        </View>
      </Page>
    </Document>
  );
}
