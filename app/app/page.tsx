'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  BookOpen, 
  Users, 
  Search,
  BarChart3,
  Sparkles
} from 'lucide-react'

// Import components
import HadithInput from '@/components/hadith/HadithInput'
import NarratorList from '@/components/hadith/NarratorList'
import NarratorProfile from '@/components/hadith/NarratorProfile'
import RecentSearches from '@/components/hadith/RecentSearches'
import AdvancedSearch from '@/components/hadith/AdvancedSearch'
import StatsDashboard from '@/components/hadith/StatsDashboard'

// Import actions and types
import { processHadithText } from '@/app/actions/hadith'
import type { Narrator, ProcessHadithResponse } from '@/types/hadith'

/**
 * Main Hadith Narrator Checker Application Page
 * This page integrates all the core components for hadith analysis
 */
export default function HadithApp() {
  // Application state
  const [narrators, setNarrators] = useState<Narrator[]>([])
  const [selectedNarrator, setSelectedNarrator] = useState<Narrator | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hadithDetails, setHadithDetails] = useState<ProcessHadithResponse['hadithDetails'] | null>(null)
  const [activeTab, setActiveTab] = useState('input')

  // Handle hadith text processing
  const handleHadithProcess = async (hadithText: string) => {
    setIsProcessing(true)
    try {
      const response = await processHadithText(hadithText)
      if (response.success) {
        setNarrators(response.narrators)
        setHadithDetails(response.hadithDetails || null)
        if (response.narrators.length > 0) {
          setActiveTab('results')
        }
      } else {
        console.error('Error processing hadith:', response.error)
        // You could add toast notification here
      }
    } catch (error) {
      console.error('Error processing hadith:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle advanced search results
  const handleAdvancedSearchResults = (searchResults: Narrator[]) => {
    setNarrators(searchResults)
    setHadithDetails(null) // Clear hadith details for search results
    if (searchResults.length > 0) {
      setActiveTab('results')
    }
  }

  // Handle recent search selection
  const handleRecentSearchSelect = (query: string) => {
    setActiveTab('input')
    // This would trigger the HadithInput component to populate with the query
    // Implementation depends on how you want to handle this
  }

  // Handle narrator selection
  const handleNarratorSelect = (narrator: Narrator) => {
    setSelectedNarrator(narrator)
  }

  // Close narrator profile
  const handleCloseProfile = () => {
    setSelectedNarrator(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900" dir="rtl">
              مُتحقق الرواة
            </h1>
            <Sparkles className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-700" dir="ltr">
            Hadith Narrator Checker
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto" dir="ltr">
            Advanced Islamic scholarship tool for authenticating hadith narrators using classical 
            methodologies and modern search capabilities.
          </p>
          
          {/* Status Indicators */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant="secondary" className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              Classical Sources
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Verified Narrators
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Search className="h-3 w-3" />
              Advanced Search
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Main Application */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4" dir="ltr">
            <TabsTrigger value="input" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Hadith Analysis
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Advanced Search
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Results ({narrators.length})
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistics
            </TabsTrigger>
          </TabsList>

          {/* Hadith Input and Analysis Tab */}
          <TabsContent value="input" className="space-y-6" dir="ltr">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <HadithInput 
                  onProcess={handleHadithProcess}
                  isProcessing={isProcessing}
                />
                
                {hadithDetails && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Analysis Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <strong>Source:</strong> {hadithDetails.source}
                      </div>
                      {hadithDetails.chapter && (
                        <div>
                          <strong>Chapter:</strong> {hadithDetails.chapter}
                        </div>
                      )}
                      <div className="bg-blue-50 p-4 rounded-lg" dir="rtl">
                        <p className="text-sm text-blue-900">
                          {hadithDetails.text.substring(0, 200)}
                          {hadithDetails.text.length > 200 && '...'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <div>
                <RecentSearches onSearchSelect={handleRecentSearchSelect} />
              </div>
            </div>
          </TabsContent>

          {/* Advanced Search Tab */}
          <TabsContent value="search" className="space-y-6" dir="ltr">
            <AdvancedSearch 
              onSearchResults={handleAdvancedSearchResults}
              onLoading={setIsProcessing}
            />
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6" dir="ltr">
            {narrators.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <NarratorList 
                    narrators={narrators}
                    onSelectNarrator={handleNarratorSelect}
                  />
                </div>
                <div>
                  {selectedNarrator ? (
                    <NarratorProfile 
                      narrator={selectedNarrator}
                      onClose={handleCloseProfile}
                    />
                  ) : (
                    <Card>
                      <CardContent className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Select a narrator to view detailed profile and scholarly opinions
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Results</h3>
                  <p className="text-gray-500 mb-4">
                    No narrators found. Try submitting a hadith text or using the advanced search.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => setActiveTab('input')}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Submit Hadith Text
                    </button>
                    <span className="text-gray-400">or</span>
                    <button 
                      onClick={() => setActiveTab('search')}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Advanced Search
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6" dir="ltr">
            <StatsDashboard />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-6" dir="ltr">
          <p>
            Built with ❤️ for Islamic scholarship • Powered by classical hadith science methodologies
          </p>
          <p className="mt-2">
            <strong>تم بناؤه لخدمة العلوم الإسلامية والحديث الشريف</strong>
          </p>
        </div>
      </div>
    </div>
  )
}

