'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Search } from 'lucide-react'

interface HadithInputProps {
  onProcess: (hadithText: string) => Promise<void>;
  isProcessing: boolean;
}

export default function HadithInput({ onProcess, isProcessing }: HadithInputProps) {
  const [hadithText, setHadithText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hadithText.trim()) {
      setError('Please enter a hadith text to analyze.')
      return
    }

    setError(null)

    try {
      await onProcess(hadithText)
    } catch (err) {
      console.error('Error processing hadith:', err)
      setError('An unexpected error occurred. Please try again.')
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
          Hadith Text Analysis
        </CardTitle>
        <CardDescription>
          Enter a hadith text with its narrator chain (isnad) to identify and verify the narrators
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
              placeholder="حدثنا محمد بن عبد الله، عن أبي هريرة رضي الله عنه قال: قال رسول الله صلى الله عليه وسلم..."
              value={hadithText}
              onChange={(e) => setHadithText(e.target.value)}
              className="min-h-[120px] text-right"
              dir="auto"
              disabled={isProcessing}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              type="submit" 
              disabled={isProcessing || !hadithText.trim()}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze Hadith
                </>
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClear}
              disabled={isProcessing}
            >
              Clear
            </Button>
          </div>
        </form>

        {/* Example Hadith */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Example Hadith:</h4>
          <p className="text-sm text-blue-800 leading-relaxed" dir="rtl">
            حدثنا أبو بكر بن أبي شيبة، حدثنا عبد الله بن نمير، عن عبيد الله، عن نافع، عن ابن عمر، 
            أن رسول الله صلى الله عليه وسلم قال: "بني الإسلام على خمس..."
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 text-blue-700 hover:text-blue-900"
            onClick={() => setHadithText('حدثنا أبو بكر بن أبي شيبة، حدثنا عبد الله بن نمير، عن عبيد الله، عن نافع، عن ابن عمر، أن رسول الله صلى الله عليه وسلم قال: "بني الإسلام على خمس: شهادة أن لا إله إلا الله وأن محمداً رسول الله، وإقام الصلاة، وإيتاء الزكاة، وحج البيت، وصوم رمضان"')}
            disabled={isProcessing}
          >
            Use this example
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 