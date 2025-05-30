'use client'

import { useState } from 'react'
import HadithInput from '@/components/hadith/HadithInput'
import NarratorList from '@/components/hadith/NarratorList'
import NarratorProfile from '@/components/hadith/NarratorProfile'
import RecentSearches from '@/components/hadith/RecentSearches'
import type { ProcessHadithResponse, Narrator } from '@/types/hadith'

/**
 * Main Hadith Narrator Checker Application Page
 * This page integrates all the core components for hadith analysis
 */
export default function HadithApp() {
  const [analysisResults, setAnalysisResults] = useState<ProcessHadithResponse | null>(null)
  const [selectedNarrator, setSelectedNarrator] = useState<Narrator | null>(null)
  const [currentHadithText, setCurrentHadithText] = useState('')

  const handleHadithResults = (response: ProcessHadithResponse) => {
    setAnalysisResults(response)
    setSelectedNarrator(null) // Clear any selected narrator when new results come in
  }

  const handleNarratorSelect = (narrator: Narrator) => {
    setSelectedNarrator(narrator)
  }

  const handleCloseProfile = () => {
    setSelectedNarrator(null)
  }

  const handleSearchSelect = (query: string) => {
    setCurrentHadithText(query)
    // Optionally auto-trigger the analysis
    // This would require passing the query to HadithInput component
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Hadith Narrator Checker
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Analyze hadith texts to identify narrators in the chain (isnad) and verify their credibility 
            based on classical Islamic scholarship.
          </p>
        </div>

        {/* Recent Searches - Show only when no current analysis */}
        {!analysisResults && (
          <RecentSearches 
            searches={[]} 
            onSearchSelect={handleSearchSelect}
          />
        )}

        {/* Hadith Input Section */}
        <HadithInput onResults={handleHadithResults} />

        {/* Results Section */}
        {analysisResults && (
          <div className="space-y-6">
            {analysisResults.success ? (
              <>
                {/* Hadith Details */}
                {analysisResults.hadithDetails && (
                  <div className="bg-white rounded-lg shadow-sm border p-6 max-w-4xl mx-auto">
                    <h3 className="text-lg font-semibold mb-3">Hadith Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Source:</span> {analysisResults.hadithDetails.source}</p>
                      {analysisResults.hadithDetails.chapter && (
                        <p><span className="font-medium">Chapter:</span> {analysisResults.hadithDetails.chapter}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Narrator Results */}
                <NarratorList 
                  narrators={analysisResults.narrators} 
                  onSelectNarrator={handleNarratorSelect}
                />
              </>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-4xl mx-auto">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Analysis Failed</h3>
                <p className="text-red-700">
                  {analysisResults.error || 'Unable to process the hadith text. Please try again.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Narrator Profile Modal */}
        {selectedNarrator && (
          <NarratorProfile 
            narrator={selectedNarrator} 
            onClose={handleCloseProfile}
          />
        )}

        {/* Instructions Section */}
        {!analysisResults && (
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">How to Use</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-semibold">Input Hadith Text</h3>
                <p className="text-sm text-gray-600">
                  Paste the complete hadith text including the narrator chain (isnad) in Arabic or English.
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-xl font-bold text-green-600">2</span>
                </div>
                <h3 className="font-semibold">Analyze Narrators</h3>
                <p className="text-sm text-gray-600">
                  Our system extracts and identifies each narrator in the chain with their credibility status.
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-semibold">Review Details</h3>
                <p className="text-sm text-gray-600">
                  View detailed biographies and scholarly opinions about each narrator's reliability.
                </p>
              </div>
            </div>

            {/* Features Overview */}
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-lg font-semibold mb-4 text-center">Key Features</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">✓ Narrator Identification</h4>
                  <p className="text-gray-600">Automatically extract narrator names from hadith chains</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">✓ Credibility Assessment</h4>
                  <p className="text-gray-600">View trustworthy/weak classifications for each narrator</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">✓ Scholarly Opinions</h4>
                  <p className="text-gray-600">Access opinions from classical hadith scholars</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">✓ Bookmark System</h4>
                  <p className="text-gray-600">Save narrators for quick reference and study</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

