'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Users, 
  BookOpen, 
  Zap, 
  TrendingUp, 
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  Loader2,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { getArabicNLPEngine, type ArabicTextAnalysis, type NarratorEntity } from '@/lib/ai/arabic-nlp';

interface AIInsight {
  type: 'narrator' | 'language' | 'processing' | 'confidence' | 'quality';
  title: string;
  value: string;
  description: string;
  severity: 'info' | 'warning' | 'success' | 'error';
}

interface AIAnalysisDashboardProps {
  className?: string;
}

// Enhanced error types for better error handling
interface AIError {
  type: 'network' | 'timeout' | 'processing' | 'initialization' | 'validation' | 'unknown';
  message: string;
  userMessage: string;
  retryable: boolean;
  code?: string;
}

interface ErrorState {
  error: AIError | null;
  isRetrying: boolean;
  retryCount: number;
  lastError?: Date;
}

interface PerformanceMetrics {
  initializationTime: number;
  analysisTime: number;
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
}

export function AIAnalysisDashboard({ className }: AIAnalysisDashboardProps) {
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState<ArabicTextAnalysis | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiEngineReady, setAiEngineReady] = useState(false);
  const [initializationProgress, setInitializationProgress] = useState(0);
  
  // Enhanced error state management
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0
  });

  // Performance monitoring
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    initializationTime: 0,
    analysisTime: 0,
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0
  });

  // Network status monitoring
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Initialize AI engine on component mount with enhanced error handling
  useEffect(() => {
    initializeAIEngine();
    
    // Monitor network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const createAIError = (
    type: AIError['type'], 
    message: string, 
    userMessage: string, 
    retryable: boolean = true,
    code?: string
  ): AIError => ({
    type,
    message,
    userMessage,
    retryable,
    code
  });

  const logError = (error: AIError, context: string) => {
    console.error(`[AI Dashboard] ${context}:`, {
      type: error.type,
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      context
    });
  };

  const updatePerformanceMetrics = (updates: Partial<PerformanceMetrics>) => {
    setPerformanceMetrics(prev => ({ ...prev, ...updates }));
  };

  const initializeAIEngine = async (isRetry: boolean = false) => {
    const startTime = performance.now();
    
    try {
      if (isRetry) {
        setErrorState(prev => ({ ...prev, isRetrying: true }));
      }

      setInitializationProgress(10);
      console.log('[AI Dashboard] Initializing AI engine...');
      
      // Check prerequisites
      if (!isOnline) {
        throw createAIError('network', 'No internet connection', 
          'Internet connection required to load AI models. Please check your connection.', true);
      }

      // Clear previous errors
      setErrorState(prev => ({ ...prev, error: null }));
      
      setInitializationProgress(30);
      
      const engine = await getArabicNLPEngine();
      
      setInitializationProgress(80);
      
      // Verify engine is working
      await engine.extractNarrators('test'); // Simple verification
      
      setInitializationProgress(100);
      setAiEngineReady(true);
      
      const initTime = performance.now() - startTime;
      updatePerformanceMetrics({ initializationTime: initTime });
      
      console.log(`[AI Dashboard] AI engine ready in ${initTime.toFixed(2)}ms`);
      
      // Reset error state on success
      setErrorState({
        error: null,
        isRetrying: false,
        retryCount: 0
      });
      
    } catch (error: any) {
      const aiError = error.type ? error as AIError : createAIError(
        'initialization', 
        error.message || 'Unknown initialization error',
        'Failed to initialize AI models. Please try again or refresh the page.',
        true
      );
      
      logError(aiError, 'Initialization');
      
      setErrorState(prev => ({
        error: aiError,
        isRetrying: false,
        retryCount: isRetry ? prev.retryCount + 1 : 0,
        lastError: new Date()
      }));
      
      setInitializationProgress(0);
      updatePerformanceMetrics({ failedOperations: performanceMetrics.failedOperations + 1 });
    }
  };

  const analyzeText = useCallback(async () => {
    if (!inputText.trim()) {
      setErrorState(prev => ({
        ...prev,
        error: createAIError('validation', 'Empty input', 'Please enter some text to analyze.', false)
      }));
      return;
    }

    if (!aiEngineReady) {
      setErrorState(prev => ({
        ...prev,
        error: createAIError('initialization', 'AI engine not ready', 
          'AI engine is not ready. Please wait for initialization to complete.', false)
      }));
      return;
    }

    if (!isOnline) {
      setErrorState(prev => ({
        ...prev,
        error: createAIError('network', 'No internet connection', 
          'Internet connection required for AI analysis.', true)
      }));
      return;
    }

    const startTime = performance.now();
    setIsAnalyzing(true);
    setErrorState(prev => ({ ...prev, error: null }));
    
    updatePerformanceMetrics({ 
      totalOperations: performanceMetrics.totalOperations + 1 
    });

    try {
      console.log('[AI Dashboard] Starting text analysis...');
      
      const engine = await getArabicNLPEngine();
      
      // Set timeout for analysis
      const analysisPromise = engine.analyzeText(inputText);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(createAIError('timeout', 'Analysis timeout', 
          'Analysis is taking too long. Please try with shorter text.', true)), 30000)
      );
      
      const result = await Promise.race([analysisPromise, timeoutPromise]);
      
      setAnalysis(result);
      generateInsights(result);
      
      const analysisTime = performance.now() - startTime;
      updatePerformanceMetrics({ 
        analysisTime,
        successfulOperations: performanceMetrics.successfulOperations + 1 
      });
      
      console.log(`[AI Dashboard] Analysis completed in ${analysisTime.toFixed(2)}ms:`, result);
      
    } catch (error: any) {
      const aiError = error.type ? error as AIError : createAIError(
        'processing', 
        error.message || 'Unknown analysis error',
        'Analysis failed. Please try again with different text.',
        true
      );
      
      logError(aiError, 'Text Analysis');
      
      setErrorState(prev => ({
        ...prev,
        error: aiError,
        lastError: new Date()
      }));
      
      updatePerformanceMetrics({ 
        failedOperations: performanceMetrics.failedOperations + 1 
      });
      
    } finally {
      setIsAnalyzing(false);
    }
  }, [inputText, aiEngineReady, isOnline, performanceMetrics.totalOperations, performanceMetrics.successfulOperations, performanceMetrics.failedOperations]);

  const handleRetry = useCallback(async () => {
    if (!errorState.error?.retryable) return;
    
    if (errorState.error.type === 'initialization') {
      await initializeAIEngine(true);
    } else {
      await analyzeText();
    }
  }, [errorState.error, analyzeText]);

  const generateInsights = (result: ArabicTextAnalysis) => {
    const newInsights: AIInsight[] = [];

    // Narrator quality insight
    if (result.narratorEntities.length > 0) {
      const avgConfidence = result.narratorEntities.reduce((sum: number, n: NarratorEntity) => sum + n.confidence, 0) / result.narratorEntities.length;
      newInsights.push({
        type: 'narrator',
        title: 'Narrator Recognition Quality',
        value: `${(avgConfidence * 100).toFixed(1)}%`,
        description: `Identified ${result.narratorEntities.length} narrator(s) with average confidence of ${(avgConfidence * 100).toFixed(1)}%`,
        severity: avgConfidence > 0.8 ? 'success' : avgConfidence > 0.6 ? 'warning' : 'error'
      });
    }

    // Language analysis insight
    newInsights.push({
      type: 'language',
      title: 'Text Language',
      value: result.language === 'arabic' ? 'Arabic' : result.language === 'english' ? 'English' : 'Mixed',
      description: `Text appears to be primarily in ${result.language}`,
      severity: result.language === 'arabic' ? 'success' : 'info'
    });

    // Processing time insight
    newInsights.push({
      type: 'processing',
      title: 'Processing Speed',
      value: `${result.processingTime}ms`,
      description: `Analysis completed in ${result.processingTime} milliseconds`,
      severity: result.processingTime < 1000 ? 'success' : result.processingTime < 3000 ? 'warning' : 'error'
    });

    // Overall confidence insight
    newInsights.push({
      type: 'confidence',
      title: 'Analysis Confidence',
      value: `${(result.confidence * 100).toFixed(1)}%`,
      description: `Overall confidence in the analysis results`,
      severity: result.confidence > 0.8 ? 'success' : result.confidence > 0.6 ? 'warning' : 'error'
    });

    setInsights(newInsights);
  };

  const renderNarratorCard = (narrator: NarratorEntity, index: number) => (
    <Card key={index} className="mb-2">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="font-medium" dir="rtl">{narrator.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={
              narrator.type === 'companion' ? 'default' :
              narrator.type === 'scholar' ? 'secondary' :
              'outline'
            }>
              {narrator.type}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {Math.round(narrator.confidence * 100)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderInsightCard = (insight: AIInsight) => (
    <Alert key={insight.title} className={`mb-2 ${
      insight.severity === 'success' ? 'border-green-200 bg-green-50' :
      insight.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
      insight.severity === 'error' ? 'border-red-200 bg-red-50' :
      'border-blue-200 bg-blue-50'
    }`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {insight.type === 'narrator' && <Users className="h-4 w-4" />}
          {insight.type === 'language' && <BookOpen className="h-4 w-4" />}
          {insight.type === 'processing' && <TrendingUp className="h-4 w-4" />}
          {insight.type === 'confidence' && <Target className="h-4 w-4" />}
          {insight.type === 'quality' && <Brain className="h-4 w-4" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">{insight.title}</h4>
            <span className="text-xs text-muted-foreground">
              {insight.value}
            </span>
          </div>
          <AlertDescription className="text-sm mt-1">
            {insight.description}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );

  const getErrorIcon = () => {
    if (!errorState.error) return null;
    return errorState.error.type === 'network' ? <WifiOff className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />;
  };

  const getErrorSeverity = () => {
    if (!errorState.error) return 'default';
    return errorState.error.retryable ? 'default' : 'destructive';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Brain className="h-6 w-6 text-blue-500" />
        <div>
          <h2 className="text-xl font-semibold">AI Analysis Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Advanced machine learning analysis for hadith texts
          </p>
        </div>
      </div>

      {/* AI Engine Status */}
      {!aiEngineReady && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Zap className="h-5 w-5 text-yellow-500 animate-pulse" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Initializing AI Models...</span>
                  <span className="text-sm text-muted-foreground">{initializationProgress}%</span>
                </div>
                <Progress value={initializationProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Loading multilingual BERT models and Arabic NLP engines
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {errorState.error && (
        <Alert className={`border-${getErrorSeverity()} bg-${getErrorSeverity()}-50`}>
          {getErrorIcon()}
          <AlertDescription>{errorState.error.userMessage}</AlertDescription>
        </Alert>
      )}

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Text Input for AI Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="أدخل النص العربي للحديث هنا... (Enter Arabic hadith text here...)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-32 text-right"
            dir="rtl"
            disabled={!aiEngineReady}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>AI-powered analysis ready</span>
            </div>
            <Button 
              onClick={analyzeText}
              disabled={!inputText.trim() || isAnalyzing || !aiEngineReady}
              className="min-w-32"
            >
              {isAnalyzing ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze with AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="narrators">Narrators</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Narrators Found</p>
                      <p className="text-2xl font-bold">{analysis.narratorEntities.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Confidence</p>
                      <p className="text-2xl font-bold">{Math.round(analysis.confidence * 100)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Language</p>
                      <p className="text-2xl font-bold capitalize">{analysis.language}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="narrators" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Detected Narrators ({analysis.narratorEntities.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysis.narratorEntities.length > 0 ? (
                  <div className="space-y-2">
                    {analysis.narratorEntities.map((narrator, index) => 
                      renderNarratorCard(narrator, index)
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No narrators detected in this text</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>AI Insights ({insights.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insights.length > 0 ? (
                  <div className="space-y-2">
                    {insights.map(renderInsightCard)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No AI insights available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Text Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Sentiment</p>
                    <Badge variant={
                      analysis.sentiment === 'positive' ? 'default' :
                      analysis.sentiment === 'negative' ? 'destructive' :
                      'secondary'
                    }>
                      {analysis.sentiment}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Readability Score</p>
                    <p className="font-medium">{analysis.readabilityScore}/100</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Word Count</p>
                    <p className="font-medium">{analysis.originalText.split(/\s+/).length} words</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Terms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keyTerms.map((term, index) => (
                      <Badge key={index} variant="outline" dir="rtl">
                        {term}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 