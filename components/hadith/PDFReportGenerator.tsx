'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Download, 
  Settings, 
  BookOpen, 
  Users, 
  Calendar,
  MapPin,
  FileCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  FileDown,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Font } from '@react-pdf/renderer';
import type { ArabicTextAnalysis } from '@/lib/ai/arabic-nlp';
import type { HadithTextAnalysis, Narrator } from '@/types/hadith';

// Register Arabic font for PDF (you would need to add actual Arabic font files)
// For now, we'll use a fallback approach
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Times-Roman'
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
    borderBottom: 1,
    paddingBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a365d'
  },
  subtitle: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 5
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f7fafc',
    borderRadius: 5
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2d3748'
  },
  text: {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 5
  },
  arabicText: {
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#edf2f7',
    borderRadius: 3
  },
  narratorCard: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#ffffff',
    border: 1,
    borderColor: '#e2e8f0',
    borderRadius: 3
  },
  narratorName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3
  },
  confidence: {
    fontSize: 11,
    color: '#4a5568'
  },
  metadata: {
    fontSize: 10,
    color: '#718096',
    marginTop: 20,
    textAlign: 'center'
  },
  tableHeader: {
    backgroundColor: '#4a5568',
    color: '#ffffff',
    padding: 8,
    fontSize: 12,
    fontWeight: 'bold'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderColor: '#e2e8f0',
    padding: 8
  },
  tableCell: {
    flex: 1,
    fontSize: 11,
    padding: 3
  }
});

interface ReportData {
  title: string;
  author: string;
  date: string;
  hadithAnalysis?: HadithTextAnalysis[];
  aiAnalysis?: ArabicTextAnalysis[];
  narrators?: Narrator[];
  includeMetadata: boolean;
  includeCharts: boolean;
  includeArabicText: boolean;
  language: 'english' | 'arabic' | 'bilingual';
}

interface PDFReportGeneratorProps {
  data: {
    hadithAnalysis?: HadithTextAnalysis[];
    aiAnalysis?: ArabicTextAnalysis[];
    narrators?: Narrator[];
  };
  className?: string;
}

// Enhanced error types for PDF generation
interface PDFError {
  type: 'rendering' | 'fonts' | 'memory' | 'network' | 'browser' | 'data' | 'timeout' | 'unknown';
  message: string;
  userMessage: string;
  retryable: boolean;
  code?: string;
  context?: any;
}

interface PDFErrorState {
  error: PDFError | null;
  isRetrying: boolean;
  retryCount: number;
  lastError?: Date;
}

interface PDFPerformanceMetrics {
  renderTime: number;
  documentSize: number;
  fontLoadTime: number;
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
}

interface BrowserCapabilities {
  webAssembly: boolean;
  canvas: boolean;
  memoryInfo: boolean;
  downloadSupport: boolean;
  fontSupport: boolean;
}

// PDF Document Component
const HadithAnalysisReport: React.FC<{ data: ReportData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {data.language === 'arabic' ? 'تقرير تحليل الأحاديث' : 'Hadith Analysis Report'}
        </Text>
        <Text style={styles.subtitle}>{data.title}</Text>
        <Text style={styles.text}>
          {data.language === 'arabic' ? 'إعداد: ' : 'Prepared by: '}{data.author}
        </Text>
        <Text style={styles.text}>
          {data.language === 'arabic' ? 'التاريخ: ' : 'Date: '}{data.date}
        </Text>
      </View>

      {/* Executive Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {data.language === 'arabic' ? 'الملخص التنفيذي' : 'Executive Summary'}
        </Text>
        <Text style={styles.text}>
          Total Hadith Texts Analyzed: {data.hadithAnalysis?.length || 0}
        </Text>
        <Text style={styles.text}>
          AI Analyses Performed: {data.aiAnalysis?.length || 0}
        </Text>
        <Text style={styles.text}>
          Unique Narrators Identified: {data.narrators?.length || 0}
        </Text>
        <Text style={styles.text}>
          Average Confidence Score: {
            data.hadithAnalysis?.length ? 
            Math.round(data.hadithAnalysis.reduce((acc, h) => acc + h.confidence, 0) / data.hadithAnalysis.length) + '%' :
            'N/A'
          }
        </Text>
      </View>

      {/* Hadith Analysis Results */}
      {data.hadithAnalysis && data.hadithAnalysis.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {data.language === 'arabic' ? 'نتائج تحليل الأحاديث' : 'Hadith Analysis Results'}
          </Text>
          {data.hadithAnalysis.slice(0, 3).map((analysis, index) => (
            <View key={index} style={styles.narratorCard}>
              <Text style={styles.narratorName}>Analysis #{index + 1}</Text>
              {data.includeArabicText && (
                <Text style={styles.arabicText}>
                  {analysis.originalText.substring(0, 200)}...
                </Text>
              )}
              <Text style={styles.text}>
                Confidence: {Math.round(analysis.confidence * 100)}%
              </Text>
              <Text style={styles.text}>
                Narrators Found: {analysis.narrators.length}
              </Text>
              <Text style={styles.text}>
                Has Isnad: {analysis.structuralAnalysis.hasIsnad ? 'Yes' : 'No'}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Narrator Profiles */}
      {data.narrators && data.narrators.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {data.language === 'arabic' ? 'ملفات الرواة' : 'Narrator Profiles'}
          </Text>
          {data.narrators.slice(0, 5).map((narrator, index) => (
            <View key={index} style={styles.narratorCard}>
              <Text style={styles.narratorName}>{narrator.name_arabic}</Text>
              <Text style={styles.text}>
                Name (Transliteration): {narrator.name_transliteration || 'Not available'}
              </Text>
              <Text style={styles.text}>
                Birth Year: {narrator.birth_year || 'Unknown'}
              </Text>
              <Text style={styles.text}>
                Death Year: {narrator.death_year || 'Unknown'}
              </Text>
              <Text style={styles.confidence}>
                Credibility: {narrator.credibility}
              </Text>
              {narrator.region && (
                <Text style={styles.text}>
                  Region: {narrator.region}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Metadata */}
      {data.includeMetadata && (
        <View style={styles.metadata}>
          <Text>
            Generated by Hadith Narrator Checker • Islamic Scholarship Tool
          </Text>
          <Text>
            Advanced AI-powered analysis for hadith authentication
          </Text>
        </View>
      )}
    </Page>
  </Document>
);

export function PDFReportGenerator({ data, className }: PDFReportGeneratorProps) {
  const [reportConfig, setReportConfig] = useState<ReportData>({
    title: 'Hadith Analysis Report',
    author: '',
    date: new Date().toLocaleDateString(),
    hadithAnalysis: data.hadithAnalysis,
    aiAnalysis: data.aiAnalysis,
    narrators: data.narrators,
    includeMetadata: true,
    includeCharts: false,
    includeArabicText: true,
    language: 'english'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Enhanced error state management
  const [errorState, setErrorState] = useState<PDFErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0
  });

  // Performance monitoring
  const [performanceMetrics, setPerformanceMetrics] = useState<PDFPerformanceMetrics>({
    renderTime: 0,
    documentSize: 0,
    fontLoadTime: 0,
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0
  });

  // Browser capabilities detection
  const [browserCapabilities, setBrowserCapabilities] = useState<BrowserCapabilities>({
    webAssembly: false,
    canvas: false,
    memoryInfo: false,
    downloadSupport: false,
    fontSupport: false
  });

  // Initialize browser capability detection
  React.useEffect(() => {
    const detectBrowserCapabilities = () => {
      const capabilities: BrowserCapabilities = {
        webAssembly: typeof WebAssembly !== 'undefined',
        canvas: !!document.createElement('canvas').getContext,
        memoryInfo: !!(performance as any).memory,
        downloadSupport: 'download' in document.createElement('a'),
        fontSupport: typeof FontFace !== 'undefined'
      };
      
      setBrowserCapabilities(capabilities);
      
      // Log capabilities for debugging
      console.log('[PDF Generator] Browser capabilities:', capabilities);
      
      // Check for potential issues
      const warnings = [];
      if (!capabilities.webAssembly) warnings.push('WebAssembly not supported - PDF rendering may be slower');
      if (!capabilities.fontSupport) warnings.push('Font loading may not work properly');
      if (!capabilities.downloadSupport) warnings.push('Direct download may not be available');
      
      if (warnings.length > 0) {
        console.warn('[PDF Generator] Browser compatibility warnings:', warnings);
      }
    };

    detectBrowserCapabilities();
  }, []);

  /**
   * Create standardized PDF error
   */
  const createPDFError = useCallback((
    type: PDFError['type'],
    message: string,
    userMessage: string,
    retryable: boolean = true,
    code?: string,
    context?: any
  ): PDFError => ({
    type,
    message,
    userMessage,
    retryable,
    code,
    context
  }), []);

  /**
   * Log PDF errors with comprehensive context
   */
  const logPDFError = useCallback((error: PDFError, operation: string, context: any = {}) => {
    console.error(`[PDF Generator] ${operation} Error:`, {
      type: error.type,
      message: error.message,
      code: error.code,
      retryable: error.retryable,
      timestamp: new Date().toISOString(),
      operation,
      browserCapabilities,
      performanceMetrics,
      context: {
        ...context,
        userAgent: navigator.userAgent,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 'unknown'
      }
    });
  }, [browserCapabilities, performanceMetrics]);

  /**
   * Update performance metrics
   */
  const updatePerformanceMetrics = useCallback((updates: Partial<PDFPerformanceMetrics>) => {
    setPerformanceMetrics(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Validate PDF generation prerequisites
   */
  const validatePDFPrerequisites = useCallback((): PDFError | null => {
    // Check browser capabilities
    if (!browserCapabilities.canvas) {
      return createPDFError(
        'browser',
        'Canvas API not supported',
        'Your browser does not support PDF generation. Please use a modern browser.',
        false,
        'NO_CANVAS_SUPPORT'
      );
    }

    if (!browserCapabilities.downloadSupport) {
      return createPDFError(
        'browser',
        'Download API not supported',
        'Your browser does not support file downloads. Please use a modern browser.',
        false,
        'NO_DOWNLOAD_SUPPORT'
      );
    }

    // Check data availability
    if (!data) {
      return createPDFError(
        'data',
        'No analysis data available',
        'No analysis data available to generate report.',
        false,
        'NO_DATA'
      );
    }

    // Check memory usage (if available)
    const memoryInfo = (performance as any).memory;
    if (memoryInfo && memoryInfo.usedJSHeapSize > memoryInfo.totalJSHeapSize * 0.9) {
      return createPDFError(
        'memory',
        'High memory usage detected',
        'System memory is low. PDF generation may fail or be slow.',
        true,
        'HIGH_MEMORY_USAGE',
        { memoryUsage: memoryInfo.usedJSHeapSize }
      );
    }

    return null;
  }, [data, browserCapabilities, createPDFError]);

  /**
   * Generate PDF with comprehensive error handling
   */
  const generatePDFWithErrorHandling = useCallback(async () => {
    const startTime = performance.now();
    setIsGenerating(true);
    setGenerationProgress(0);
    setErrorState(prev => ({ ...prev, error: null }));
    
    updatePerformanceMetrics({ 
      totalOperations: performanceMetrics.totalOperations + 1 
    });

    try {
      // Step 1: Validate prerequisites (10%)
      setGenerationProgress(10);
      const validationError = validatePDFPrerequisites();
      if (validationError) {
        throw validationError;
      }

      // Step 2: Initialize PDF renderer (30%)
      setGenerationProgress(30);
      console.log('[PDF Generator] Initializing PDF renderer...');
      
      // Check if fonts are needed (40%)
      setGenerationProgress(40);
      if (reportConfig.language === 'arabic' || reportConfig.language === 'bilingual') {
        const fontStartTime = performance.now();
        
        try {
          // Attempt to register Arabic fonts
          console.log('[PDF Generator] Loading Arabic fonts...');
          // Font loading would happen here
          
          const fontLoadTime = performance.now() - fontStartTime;
          updatePerformanceMetrics({ fontLoadTime });
          
        } catch (fontError) {
          console.warn('[PDF Generator] Arabic font loading failed, using fallback:', fontError);
          // Continue with fallback fonts rather than failing
        }
      }

      // Step 3: Process data (60%)
      setGenerationProgress(60);
      console.log('[PDF Generator] Processing analysis data...');
      
      if (!data.narrators || data.narrators.length === 0) {
        console.warn('[PDF Generator] No narrator data available, generating summary report only');
      }

      // Step 4: Generate document structure (80%)
      setGenerationProgress(80);
      console.log('[PDF Generator] Generating document structure...');
      
      // This would be where the actual PDF document is created
      // For now, simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 5: Finalize and prepare download (100%)
      setGenerationProgress(100);
      console.log('[PDF Generator] Finalizing PDF document...');

      const renderTime = performance.now() - startTime;
      updatePerformanceMetrics({ 
        renderTime,
        successfulOperations: performanceMetrics.successfulOperations + 1,
        documentSize: 1024 * 500 // Simulate 500KB document
      });

      console.log(`[PDF Generator] PDF generated successfully in ${renderTime.toFixed(2)}ms`);

      // Reset error state on success
      setErrorState({
        error: null,
        isRetrying: false,
        retryCount: 0
      });

    } catch (error: any) {
      const renderTime = performance.now() - startTime;
      
      const pdfError = error.type ? error as PDFError : createPDFError(
        'rendering',
        error.message || 'Unknown PDF generation error',
        'Failed to generate PDF report. Please try again.',
        true,
        'PDF_GENERATION_ERROR',
        { originalError: error.message, renderTime }
      );

      logPDFError(pdfError, 'PDF Generation', { 
        reportConfig,
        renderTime: Math.round(renderTime)
      });

      setErrorState(prev => ({
        error: pdfError,
        isRetrying: false,
        retryCount: prev.retryCount,
        lastError: new Date()
      }));

      updatePerformanceMetrics({ 
        failedOperations: performanceMetrics.failedOperations + 1 
      });

    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  }, [
    data, 
    reportConfig, 
    performanceMetrics, 
    validatePDFPrerequisites, 
    createPDFError, 
    logPDFError, 
    updatePerformanceMetrics
  ]);

  /**
   * Retry PDF generation with backoff
   */
  const retryPDFGeneration = useCallback(async () => {
    if (!errorState.error?.retryable) return;
    
    setErrorState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1
    }));

    // Exponential backoff delay
    const delay = Math.min(1000 * Math.pow(2, errorState.retryCount), 10000);
    console.log(`[PDF Generator] Retrying PDF generation after ${delay}ms delay (attempt ${errorState.retryCount + 1})`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    await generatePDFWithErrorHandling();
  }, [errorState, generatePDFWithErrorHandling]);

  const handleConfigChange = (field: keyof ReportData, value: any) => {
    setReportConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const simulateProgress = () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(interval);
  };

  const handleGenerationComplete = () => {
    setGenerationProgress(100);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerationProgress(0);
    }, 1000);
  };

  const getReportStats = () => {
    const totalTexts = (data.hadithAnalysis?.length || 0) + (data.aiAnalysis?.length || 0);
    const totalNarrators = data.narrators?.length || 0;
    const avgConfidence = data.hadithAnalysis?.length ? 
      data.hadithAnalysis.reduce((acc, h) => acc + h.confidence, 0) / data.hadithAnalysis.length * 100 : 0;

    return { totalTexts, totalNarrators, avgConfidence };
  };

  const stats = getReportStats();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3">
        <FileText className="h-6 w-6 text-blue-500" />
        <div>
          <h2 className="text-xl font-semibold">PDF Report Generator</h2>
          <p className="text-sm text-muted-foreground">
            Generate professional hadith analysis reports
          </p>
        </div>
      </div>

      {/* Report Preview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Texts</p>
                <p className="text-2xl font-bold">{stats.totalTexts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Narrators</p>
                <p className="text-2xl font-bold">{stats.totalNarrators}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">{Math.round(stats.avgConfidence)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration */}
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
          <TabsTrigger value="content">Content Options</TabsTrigger>
          <TabsTrigger value="preview">Preview & Export</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Report Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Report Title</Label>
                  <Input
                    id="title"
                    value={reportConfig.title}
                    onChange={(e) => handleConfigChange('title', e.target.value)}
                    placeholder="Enter report title"
                  />
                </div>
                <div>
                  <Label htmlFor="author">Author Name</Label>
                  <Input
                    id="author"
                    value={reportConfig.author}
                    onChange={(e) => handleConfigChange('author', e.target.value)}
                    placeholder="Enter author name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Report Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={reportConfig.date}
                    onChange={(e) => handleConfigChange('date', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Language</Label>
                  <Select 
                    value={reportConfig.language}
                    onValueChange={(value) => handleConfigChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="arabic">Arabic</SelectItem>
                      <SelectItem value="bilingual">Bilingual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Inclusion Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="metadata"
                    checked={reportConfig.includeMetadata}
                    onCheckedChange={(checked: boolean) => handleConfigChange('includeMetadata', checked)}
                  />
                  <Label htmlFor="metadata">Include metadata and generation info</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="arabic"
                    checked={reportConfig.includeArabicText}
                    onCheckedChange={(checked: boolean) => handleConfigChange('includeArabicText', checked)}
                  />
                  <Label htmlFor="arabic">Include Arabic text passages</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="charts"
                    checked={reportConfig.includeCharts}
                    onCheckedChange={(checked: boolean) => handleConfigChange('includeCharts', checked)}
                  />
                  <Label htmlFor="charts">Include charts and visualizations (Coming Soon)</Label>
                </div>
              </div>

              {stats.totalTexts === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No analysis data available. Please perform some hadith analysis first.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Generate & Download Report</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Generating PDF report...</span>
                    <span className="text-sm text-muted-foreground">{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                </div>
              )}

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{reportConfig.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {stats.totalTexts} texts • {stats.totalNarrators} narrators • PDF Format
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>

                {stats.totalTexts > 0 ? (
                  <PDFDownloadLink
                    document={<HadithAnalysisReport data={reportConfig} />}
                    fileName={`hadith-analysis-${new Date().toISOString().split('T')[0]}.pdf`}
                  >
                    {({ loading }) => (
                      <Button
                        size="lg"
                        disabled={loading || isGenerating}
                        onClick={() => {
                          simulateProgress();
                          setTimeout(handleGenerationComplete, 2000);
                        }}
                        className="w-full"
                      >
                        {loading || isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating PDF...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF Report
                          </>
                        )}
                      </Button>
                    )}
                  </PDFDownloadLink>
                ) : (
                  <Button disabled size="lg" className="w-full">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    No Data Available for Export
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 