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
  Target
} from 'lucide-react';
import { getArabicNLPEngine, type ArabicTextAnalysis, type NarratorEntity } from '@/lib/ai/arabic-nlp';

interface AIInsight {
  id: string;
  type: 'narrator' | 'language' | 'sentiment' | 'quality' | 'semantic';
  title: string;
  description: string;
  confidence: number;
  severity: 'info' | 'warning' | 'success' | 'error';
}

interface AIAnalysisDashboardProps {
  className?: string;
}

export function AIAnalysisDashboard({ className }: AIAnalysisDashboardProps) {
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState<ArabicTextAnalysis | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiEngineReady, setAiEngineReady] = useState(false);
  const [initializationProgress, setInitializationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Initialize AI engine on component mount
  useEffect(() => {
    initializeAIEngine();
  }, []);

  const initializeAIEngine = async () => {
    try {
      setInitializationProgress(10);
      console.log('[AI Dashboard] Initializing AI engine...');
      
      const engine = await getArabicNLPEngine();
      setInitializationProgress(100);
      setAiEngineReady(true);
      
      console.log('[AI Dashboard] AI engine ready');
    } catch (error) {
      console.error('[AI Dashboard] Failed to initialize AI engine:', error);
      setError('Failed to initialize AI models. Please refresh the page.');
      setInitializationProgress(0);
    }
  };

  const analyzeText = useCallback(async () => {
    if (!inputText.trim() || !aiEngineReady) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const engine = await getArabicNLPEngine();
      const result = await engine.analyzeText(inputText);
      
      setAnalysis(result);
      generateInsights(result);
      
      console.log('[AI Dashboard] Analysis completed:', result);
    } catch (error) {
      console.error('[AI Dashboard] Analysis failed:', error);
      setError('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [inputText, aiEngineReady]);

  const generateInsights = (analysis: ArabicTextAnalysis) => {
    const insights: AIInsight[] = [];

    // Narrator insights
    if (analysis.detectedNarrators.length > 0) {
      const avgConfidence = analysis.detectedNarrators.reduce((sum, n) => sum + n.confidence, 0) / analysis.detectedNarrators.length;
      insights.push({
        id: 'narrator-quality',
        type: 'narrator',
        title: 'Narrator Recognition Quality',
        description: `Detected ${analysis.detectedNarrators.length} narrator(s) with ${Math.round(avgConfidence * 100)}% average confidence`,
        confidence: avgConfidence,
        severity: avgConfidence > 0.8 ? 'success' : avgConfidence > 0.6 ? 'warning' : 'error'
      });

      // Check for high-authority narrators
      const companions = analysis.detectedNarrators.filter(n => n.type === 'companion');
      if (companions.length > 0) {
        insights.push({
          id: 'companion-detected',
          type: 'narrator',
          title: 'Companion Narrator Detected',
          description: `Found ${companions.length} Companion narrator(s): ${companions.map(c => c.name).join(', ')}`,
          confidence: 0.9,
          severity: 'success'
        });
      }
    } else {
      insights.push({
        id: 'no-narrators',
        type: 'narrator',
        title: 'No Narrators Detected',
        description: 'No clear narrator patterns found in the text',
        confidence: 0.3,
        severity: 'warning'
      });
    }

    // Language insights
    insights.push({
      id: 'language-detection',
      type: 'language',
      title: 'Language Analysis',
      description: `Primary language: ${analysis.language.toUpperCase()}`,
      confidence: 0.8,
      severity: analysis.language === 'arabic' ? 'success' : 'info'
    });

    // Quality insights
    if (analysis.readabilityScore < 30) {
      insights.push({
        id: 'readability-complex',
        type: 'quality',
        title: 'Complex Text Structure',
        description: 'Text has complex sentence structure, typical of classical Arabic',
        confidence: 0.7,
        severity: 'info'
      });
    }

    // Sentiment insights
    if (analysis.sentiment !== 'neutral') {
      insights.push({
        id: 'sentiment-analysis',
        type: 'sentiment',
        title: 'Text Sentiment',
        description: `Detected ${analysis.sentiment} sentiment in the text`,
        confidence: 0.6,
        severity: analysis.sentiment === 'positive' ? 'success' : 'warning'
      });
    }

    setInsights(insights);
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
    <Alert key={insight.id} className={`mb-2 ${
      insight.severity === 'success' ? 'border-green-200 bg-green-50' :
      insight.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
      insight.severity === 'error' ? 'border-red-200 bg-red-50' :
      'border-blue-200 bg-blue-50'
    }`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {insight.type === 'narrator' && <Users className="h-4 w-4" />}
          {insight.type === 'language' && <BookOpen className="h-4 w-4" />}
          {insight.type === 'sentiment' && <TrendingUp className="h-4 w-4" />}
          {insight.type === 'quality' && <Target className="h-4 w-4" />}
          {insight.type === 'semantic' && <Brain className="h-4 w-4" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">{insight.title}</h4>
            <span className="text-xs text-muted-foreground">
              {Math.round(insight.confidence * 100)}%
            </span>
          </div>
          <AlertDescription className="text-sm mt-1">
            {insight.description}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );

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
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
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
                      <p className="text-2xl font-bold">{analysis.detectedNarrators.length}</p>
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
                  <span>Detected Narrators ({analysis.detectedNarrators.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysis.detectedNarrators.length > 0 ? (
                  <div className="space-y-2">
                    {analysis.detectedNarrators.map((narrator, index) => 
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