import { Document, Page, Text, View, StyleSheet, Font, renderToBuffer } from '@react-pdf/renderer'
import type { HadithTextAnalysis } from '@/types/hadith'

Font.register({ family: 'NotoSans', fonts: [
  { src: 'https://fonts.gstatic.com/ea/notosansarabic/v21/NotoSansArabic-Regular.ttf' },
  { src: 'https://fonts.gstatic.com/ea/notosansarabic/v21/NotoSansArabic-Bold.ttf', fontWeight: 700 }
] })

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: 'NotoSans',
    fontSize: 11,
    lineHeight: 1.5,
    color: '#1f2937'
  },
  header: {
    marginBottom: 16,
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 8
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
    color: '#111827'
  },
  meta: {
    fontSize: 10,
    color: '#6b7280'
  },
  section: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 6,
    border: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 6,
    color: '#1f2937'
  },
  row: {
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  label: {
    fontWeight: 700,
    color: '#374151'
  },
  arabicText: {
    direction: 'rtl',
    textAlign: 'right',
    marginTop: 6
  }
})

const ReportDocument = ({ analyses }: { analyses: HadithTextAnalysis[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Hadith Analysis Report</Text>
        <Text style={styles.meta}>Generated: {new Date().toLocaleString()}</Text>
        <Text style={styles.meta}>Total analyses: {analyses.length}</Text>
      </View>

      {analyses.map((analysis, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>Hadith #{index + 1}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Confidence:</Text>
            <Text>{analysis.confidence}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Narrators:</Text>
            <Text>{analysis.narrators.length}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Words:</Text>
            <Text>{analysis.linguisticFeatures.wordCount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Isnad Detected:</Text>
            <Text>{analysis.structuralAnalysis.hasIsnad ? 'Yes' : 'No'}</Text>
          </View>
          <Text style={styles.arabicText}>{analysis.originalText}</Text>
        </View>
      ))}
    </Page>
  </Document>
)

export async function generateHadithAnalysisPdf(analyses: HadithTextAnalysis[]): Promise<Buffer> {
  return renderToBuffer(<ReportDocument analyses={analyses} />)
}
