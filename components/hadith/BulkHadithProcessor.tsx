'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  FileText, 
  Play, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Trash2,
  Plus
} from 'lucide-react'

// Import actions and types
import { 
  processBulkHadithTexts, 
  getBulkProcessingProgress,
  exportAnalysisResults 
} from '@/app/actions/advanced-hadith-processing'
import type { 
  BulkProcessorProps, 
  ProcessingProgress, 
  HadithTextAnalysis 
} from '@/types/hadith'

/**
 * Bulk Hadith Processor Component
 * Allows users to process multiple hadith texts simultaneously with progress tracking
 */
export default function BulkHadithProcessor({ 
  onProcessingComplete, 
  onProcessingStart,
  maxTexts = 50 
}: BulkProcessorProps) {
  // Component state
  const [hadithTexts, setHadithTexts] = useState<string[]>([''])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [progress, setProgress] = useState<ProcessingProgress | null>(null)
  const [results, setResults] = useState<HadithTextAnalysis[]>([])
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'input' | 'progress' | 'results'>('input')

  // Add new text input field
  const addTextInput = () => {
    if (hadithTexts.length < maxTexts) {
      setHadithTexts([...hadithTexts, ''])
    }
  }

  // Remove text input field
  const removeTextInput = (index: number) => {
    if (hadithTexts.length > 1) {
      const updatedTexts = hadithTexts.filter((_, i) => i !== index)
      setHadithTexts(updatedTexts)
    }
  }

  // Update text input value
  const updateTextInput = (index: number, value: string) => {
    const updatedTexts = [...hadithTexts]
    updatedTexts[index] = value
    setHadithTexts(updatedTexts)
  }

  // Handle file upload for bulk processing
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (content) {
        // Split content into separate hadith texts (assume separated by double newlines)
        const texts = content
          .split('\n\n')
          .map(text => text.trim())
          .filter(text => text.length > 0)
          .slice(0, maxTexts)
        
        setHadithTexts(texts.length > 0 ? texts : [''])
        console.log(`[INFO] Loaded ${texts.length} hadith texts from file`)
      }
    }
    reader.readAsText(file)
  }, [maxTexts])

  // Start bulk processing
  const startBulkProcessing = async () => {
    const validTexts = hadithTexts.filter(text => text.trim().length > 0)
    
    if (validTexts.length === 0) {
      setError('Please provide at least one hadith text to process.')
      return
    }

    setIsProcessing(true)
    setError(null)
    setResults([])
    setActiveTab('progress')

    try {
      console.log(`[INFO] Starting bulk processing for ${validTexts.length} texts`)
      
      const response = await processBulkHadithTexts(validTexts)
      
      if (response.success) {
        setCurrentJobId(response.jobId)
        onProcessingStart(response.jobId)
        
        // Start polling for progress
        pollProgress(response.jobId)
      } else {
        throw new Error(response.error || 'Failed to start bulk processing')
      }
    } catch (error) {
      console.error('[ERROR] Bulk processing failed:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
      setIsProcessing(false)
    }
  }

  // Poll for processing progress
  const pollProgress = async (jobId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const progressData = await getBulkProcessingProgress(jobId)
        
        if (progressData) {
          setProgress(progressData)
          
          // Check if processing is complete
          if (progressData.status === 'completed') {
            clearInterval(pollInterval)
            setIsProcessing(false)
            
            if (progressData.results) {
              setResults(progressData.results)
              onProcessingComplete(progressData.results)
              setActiveTab('results')
            }
            
            console.log(`[INFO] Bulk processing completed for job ${jobId}`)
          } else if (progressData.status === 'error') {
            clearInterval(pollInterval)
            setIsProcessing(false)
            setError(progressData.error || 'Processing failed')
          }
        }
      } catch (error) {
        console.error('[ERROR] Failed to fetch progress:', error)
      }
    }, 2000) // Poll every 2 seconds

    // Cleanup after 5 minutes to prevent infinite polling
    setTimeout(() => {
      clearInterval(pollInterval)
      if (isProcessing) {
        setIsProcessing(false)
        setError('Processing timeout - please try again')
      }
    }, 300000)
  }

  // Export results
  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const response = await exportAnalysisResults(results, format)
      
      if (response.success && response.data) {
        // Create and download file
        const blob = new Blob([response.data], { 
          type: format === 'json' ? 'application/json' : 'text/csv' 
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `hadith-analysis-${Date.now()}.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        console.log(`[INFO] Exported ${results.length} results to ${format}`)
      } else {
        throw new Error(response.error || 'Export failed')
      }
    } catch (error) {
      console.error('[ERROR] Export failed:', error)
      setError(error instanceof Error ? error.message : 'Export failed')
    }
  }

  // Clear all inputs
  const clearAllInputs = () => {
    setHadithTexts([''])
    setResults([])
    setProgress(null)
    setCurrentJobId(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Hadith Processing Engine
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Process multiple hadith texts simultaneously with advanced analysis and similarity detection. 
            Maximum {maxTexts} texts per batch.
          </p>
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="input" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Input ({hadithTexts.filter(t => t.trim().length > 0).length})
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Results ({results.length})
          </TabsTrigger>
        </TabsList>

        {/* Input Tab */}
        <TabsContent value="input" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Hadith Text Input</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addTextInput}
                    disabled={hadithTexts.length >= maxTexts}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Text
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllInputs}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload */}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Upload text file</p>
                    <p className="text-sm text-muted-foreground">
                      Select a .txt or .md file with hadith texts (separated by double newlines)
                    </p>
                  </div>
                </label>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                or enter texts manually below
              </div>

              {/* Manual Text Inputs */}
              <div className="space-y-3">
                {hadithTexts.map((text, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          Text {index + 1}
                        </Badge>
                        {hadithTexts.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTextInput(index)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <Textarea
                        value={text}
                        onChange={(e) => updateTextInput(index, e.target.value)}
                        placeholder={`Enter hadith text ${index + 1}...`}
                        className="min-h-[100px] resize-y"
                        dir="rtl"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Process Button */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={startBulkProcessing}
                  disabled={isProcessing || hadithTexts.filter(t => t.trim().length > 0).length === 0}
                  size="lg"
                  className="min-w-[200px]"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Process {hadithTexts.filter(t => t.trim().length > 0).length} Texts
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Processing Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {progress && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress.processed} / {progress.total}</span>
                    </div>
                    <Progress 
                      value={(progress.processed / progress.total) * 100} 
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Status:</strong> {progress.status}
                    </div>
                    <div>
                      <strong>Job ID:</strong> {progress.jobId.substring(0, 16)}...
                    </div>
                  </div>

                  {progress.currentText && (
                    <div className="space-y-2">
                      <strong className="text-sm">Currently Processing:</strong>
                      <div className="bg-muted p-3 rounded-lg text-sm" dir="rtl">
                        {progress.currentText}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Last updated: {new Date(progress.timestamp).toLocaleTimeString()}
                  </div>
                </>
              )}

              {!progress && isProcessing && (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Initializing processing...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Analysis Results
                </CardTitle>
                {results.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('json')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export JSON
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('csv')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export CSV
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {results.length > 0 ? (
                <div className="space-y-4">
                  {/* Summary Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {results.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Texts Analyzed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(results.reduce((acc, r) => acc + r.confidence, 0) / results.length)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {results.reduce((acc, r) => acc + r.narrators.length, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Narrators Found</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {results.filter(r => r.structuralAnalysis.hasIsnad).length}
                      </div>
                      <div className="text-sm text-muted-foreground">With Isnad</div>
                    </div>
                  </div>

                  {/* Individual Results */}
                  <div className="space-y-3">
                    {results.map((result, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">
                              Text {index + 1}
                            </Badge>
                            <Badge 
                              variant={result.confidence > 70 ? "default" : "secondary"}
                            >
                              {result.confidence}% Confidence
                            </Badge>
                          </div>
                          
                          <div className="text-sm" dir="rtl">
                            {result.originalText.substring(0, 150)}
                            {result.originalText.length > 150 && '...'}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <div>
                              <strong>Words:</strong> {result.linguisticFeatures.wordCount}
                            </div>
                            <div>
                              <strong>Narrators:</strong> {result.narrators.length}
                            </div>
                            <div>
                              <strong>Has Isnad:</strong> {result.structuralAnalysis.hasIsnad ? 'Yes' : 'No'}
                            </div>
                            <div>
                              <strong>Similar:</strong> {result.similarTexts.length}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>No results yet. Process some hadith texts to see analysis results.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 