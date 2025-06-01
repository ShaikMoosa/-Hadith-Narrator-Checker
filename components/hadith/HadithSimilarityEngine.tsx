'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Search, 
  Zap, 
  TrendingUp, 
  Eye, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  Filter,
  BarChart3
} from 'lucide-react'

// Import actions and types
import { findSimilarHadiths } from '@/app/actions/advanced-hadith-processing'
import type { 
  SimilarityEngineProps, 
  TextSimilarityResult 
} from '@/types/hadith'

/**
 * Hadith Similarity Engine Component
 * Finds and analyzes text similarity between hadiths with advanced metrics
 */
export default function HadithSimilarityEngine({ 
  sourceText, 
  onSimilarityResults,
  threshold = 0.6 
}: SimilarityEngineProps) {
  // Component state
  const [localSourceText, setLocalSourceText] = useState(sourceText || '')
  const [similarityThreshold, setSimilarityThreshold] = useState(threshold)
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<TextSimilarityResult[]>([])
  const [selectedResult, setSelectedResult] = useState<TextSimilarityResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchStats, setSearchStats] = useState({
    totalSearched: 0,
    matchesFound: 0,
    averageSimilarity: 0,
    searchTime: 0
  })

  // Update local state when props change
  useEffect(() => {
    if (sourceText) {
      setLocalSourceText(sourceText)
    }
  }, [sourceText])

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (text: string, threshold: number) => {
      if (text.trim().length > 0) {
        await performSimilaritySearch(text, threshold)
      }
    }, 500),
    []
  )

  // Auto-search when text or threshold changes
  useEffect(() => {
    if (localSourceText.trim().length > 20) { // Only search for substantial text
      debouncedSearch(localSourceText, similarityThreshold)
    }
  }, [localSourceText, similarityThreshold, debouncedSearch])

  // Perform similarity search
  const performSimilaritySearch = async (text: string, threshold: number) => {
    if (!text || text.trim().length === 0) {
      setError('Please provide text to search for similarities.')
      return
    }

    setIsSearching(true)
    setError(null)
    const startTime = Date.now()

    try {
      console.log(`[INFO] Starting similarity search with threshold: ${threshold}`)
      
      const similarTexts = await findSimilarHadiths(text, threshold)
      const searchTime = Date.now() - startTime

      // Calculate search statistics
      const stats = {
        totalSearched: 1000, // This would come from the actual search
        matchesFound: similarTexts.length,
        averageSimilarity: similarTexts.length > 0 
          ? Math.round((similarTexts.reduce((acc, r) => acc + r.similarity, 0) / similarTexts.length) * 100) / 100
          : 0,
        searchTime: searchTime
      }

      setResults(similarTexts)
      setSearchStats(stats)
      onSimilarityResults(similarTexts)
      
      console.log(`[INFO] Found ${similarTexts.length} similar texts in ${searchTime}ms`)

    } catch (error) {
      console.error('[ERROR] Similarity search failed:', error)
      setError(error instanceof Error ? error.message : 'Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  // Manual search trigger
  const handleSearch = () => {
    performSimilaritySearch(localSourceText, similarityThreshold)
  }

  // View result details
  const handleViewResult = (result: TextSimilarityResult) => {
    setSelectedResult(result)
  }

  // Calculate similarity color
  const getSimilarityColor = (similarity: number): string => {
    if (similarity >= 0.9) return 'bg-green-500'
    if (similarity >= 0.8) return 'bg-green-400'
    if (similarity >= 0.7) return 'bg-yellow-500'
    if (similarity >= 0.6) return 'bg-orange-500'
    return 'bg-red-500'
  }

  // Get similarity label
  const getSimilarityLabel = (similarity: number): string => {
    if (similarity >= 0.9) return 'Very High'
    if (similarity >= 0.8) return 'High'
    if (similarity >= 0.7) return 'Moderate'
    if (similarity >= 0.6) return 'Low'
    return 'Very Low'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Hadith Similarity Analysis Engine
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Find similar hadith texts using advanced text analysis algorithms. 
            Adjust the similarity threshold to control match sensitivity.
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

      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-4 w-4" />
            Source Text Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Text Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Hadith Text for Similarity Search</label>
            <Textarea
              value={localSourceText}
              onChange={(e) => setLocalSourceText(e.target.value)}
              placeholder="Enter hadith text to find similar texts..."
              className="min-h-[120px] resize-y"
              dir="rtl"
            />
          </div>

          {/* Similarity Threshold Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Similarity Threshold
              </label>
              <Badge variant="outline" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {Math.round(similarityThreshold * 100)}%
              </Badge>
            </div>
            <Slider
              value={[similarityThreshold]}
              onValueChange={(value) => setSimilarityThreshold(value[0])}
              min={0.3}
              max={0.95}
              step={0.05}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Loose Match (30%)</span>
              <span>Exact Match (95%)</span>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSearch}
              disabled={isSearching || localSourceText.trim().length === 0}
              size="lg"
              className="min-w-[200px]"
            >
              {isSearching ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Find Similar Texts
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Statistics */}
      {(results.length > 0 || searchStats.totalSearched > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Search Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {searchStats.matchesFound}
                </div>
                <div className="text-sm text-muted-foreground">Matches Found</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {searchStats.averageSimilarity}
                </div>
                <div className="text-sm text-muted-foreground">Avg Similarity</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {searchStats.searchTime}ms
                </div>
                <div className="text-sm text-muted-foreground">Search Time</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(similarityThreshold * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Threshold</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Similar Texts ({results.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {results.length > 0 ? (
            <div className="space-y-3">
              {results.map((result, index) => (
                <Card key={result.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    {/* Result Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <Badge 
                          className={`${getSimilarityColor(result.similarity)} text-white`}
                        >
                          {Math.round(result.similarity * 100)}% - {getSimilarityLabel(result.similarity)}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewResult(result)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>

                    {/* Similarity Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Similarity Score</span>
                        <span>{Math.round(result.similarity * 100)}%</span>
                      </div>
                      <Progress 
                        value={result.similarity * 100} 
                        className="h-2"
                      />
                    </div>

                    {/* Text Preview */}
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-sm" dir="rtl">
                        {result.text.substring(0, 200)}
                        {result.text.length > 200 && '...'}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {result.source}
                        </Badge>
                      </div>
                      <div>
                        {new Date(result.timestamp).toLocaleDateString()}
                      </div>
                      {result.metadata?.narratorCount && (
                        <div>
                          {result.metadata.narratorCount} narrators
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4" />
              <p>No similar texts found.</p>
              <p className="text-sm">Try lowering the similarity threshold or entering different text.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result Detail Modal */}
      {selectedResult && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Detailed Analysis
              </CardTitle>
              <Button
                variant="ghost"
                onClick={() => setSelectedResult(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Similarity Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(selectedResult.similarity * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {getSimilarityLabel(selectedResult.similarity)} Similarity
                </div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {selectedResult.source}
                </div>
                <div className="text-sm text-muted-foreground">Source Type</div>
              </div>
            </div>

            {/* Full Text */}
            <div className="space-y-2">
              <h4 className="font-medium">Full Text</h4>
              <div className="bg-muted p-4 rounded-lg" dir="rtl">
                <p className="text-sm leading-relaxed">
                  {selectedResult.text}
                </p>
              </div>
            </div>

            {/* Metadata */}
            {selectedResult.metadata && (
              <div className="space-y-2">
                <h4 className="font-medium">Additional Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {selectedResult.metadata.narratorCount && (
                    <div>
                      <strong>Narrators:</strong> {selectedResult.metadata.narratorCount}
                    </div>
                  )}
                  {selectedResult.metadata.confidence && (
                    <div>
                      <strong>Confidence:</strong> {selectedResult.metadata.confidence}%
                    </div>
                  )}
                  {selectedResult.metadata.sourceReference && (
                    <div className="col-span-2">
                      <strong>Reference:</strong> {selectedResult.metadata.sourceReference}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Analyzed on: {new Date(selectedResult.timestamp).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitFor: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>): void => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), waitFor)
  }
} 