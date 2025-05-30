'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { processHadithText } from '@/app/actions/hadith'
import { Loader2, Search } from 'lucide-react'
import type { ProcessHadithResponse } from '@/types/hadith'

interface HadithInputProps {
  onResults: (response: ProcessHadithResponse) => void;
}

export default function HadithInput({ onResults }: HadithInputProps) {
  const [hadithText, setHadithText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hadithText.trim()) {
      setError('Please enter a hadith text to analyze.')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const response = await processHadithText(hadithText)
      onResults(response)
      
      if (!response.success) {
        setError(response.error || 'Failed to process hadith text.')
      }
    } catch (err) {
      console.error('Error processing hadith:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClear = () => {
    setHadithText('')
    setError(null)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Hadith Narrator Analysis
        </CardTitle>
        <CardDescription>
          Paste a hadith text below to analyze its narrator chain (isnad) and check the credibility of each narrator.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="hadith-text" className="text-sm font-medium">
              Hadith Text (Arabic or English)
            </label>
            <Textarea
              id="hadith-text"
              placeholder="حدثنا أبو هريرة رضي الله عنه قال: قال رسول الله صلى الله عليه وسلم..."
              value={hadithText}
              onChange={(e) => setHadithText(e.target.value)}
              className="min-h-[120px] text-right"
              dir="rtl"
              disabled={isProcessing}
            />
          </div>
          
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={isProcessing || !hadithText.trim()}
            >
              Clear
            </Button>
            <Button
              type="submit"
              disabled={isProcessing || !hadithText.trim()}
              className="min-w-[120px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze Narrators
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-2">How it works:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Paste the complete hadith text including the narrator chain (isnad)</li>
            <li>• Our system will extract and identify each narrator in the chain</li>
            <li>• View detailed information about each narrator's credibility and biography</li>
            <li>• See scholarly opinions and assessments from classical hadith scholars</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 