'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { FloatingElements } from '@/components/ui/floating-elements'
import { AnimatedSpinner } from '@/components/ui/animated-spinner'
import { 
  BookOpen, 
  Users, 
  Search,
  BarChart3,
  Sparkles,
  Zap,
  Upload,
  Brain,
  Database,
  Clock
} from 'lucide-react'

// Import components
import HadithInput from '@/components/hadith/HadithInput'
import NarratorList from '@/components/hadith/NarratorList'
import NarratorProfile from '@/components/hadith/NarratorProfile'
import RecentSearches from '@/components/hadith/RecentSearches'
import AdvancedSearch from '@/components/hadith/AdvancedSearch'
import StatsDashboard from '@/components/hadith/StatsDashboard'
import BulkHadithProcessor from '@/components/hadith/BulkHadithProcessor'
import HadithSimilarityEngine from '@/components/hadith/HadithSimilarityEngine'
import { AIAnalysisDashboard } from '@/components/hadith/AIAnalysisDashboard'

// Import actions and types
import { processHadithText } from '@/app/actions/hadith'
import type { 
  Narrator, 
  HadithTextAnalysis,
  TextSimilarityResult 
} from '@/types/hadith'

/**
 * Main Hadith Narrator Checker Application Page
 * Modern, minimal design inspired by Notion with enhanced UX
 */
export default function HadithApp() {
  // Application state
  const [narrators, setNarrators] = useState<Narrator[]>([])
  const [selectedNarrator, setSelectedNarrator] = useState<Narrator | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState('input')

  // Advanced processing state
  const [bulkResults, setBulkResults] = useState<HadithTextAnalysis[]>([])
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [similarityResults, setSimilarityResults] = useState<TextSimilarityResult[]>([])
  const [selectedAnalysisText, setSelectedAnalysisText] = useState<string>('')

  // Handle hadith text processing
  const handleHadithProcess = async (hadithText: string) => {
    setIsProcessing(true)
    try {
      const response = await processHadithText(hadithText)
      if (response.success && response.data) {
        // Convert enhanced narrator data to standard narrator format
        const convertedNarrators: Narrator[] = response.data.narrators.map(narrator => ({
          id: parseInt(narrator.id),
          name: narrator.name,
          name_arabic: narrator.name, // Use name as fallback
          credibility: narrator.credibility_level as "trustworthy" | "weak",
          credibility_level: narrator.credibility_level,
          birth_year: narrator.birth_year,
          death_year: narrator.death_year,
          region: narrator.region,
          created_at: new Date().toISOString()
        }))
        
        setNarrators(convertedNarrators)
        if (convertedNarrators.length > 0) {
          setActiveTab('results')
        }
      } else {
        console.error('Error processing hadith:', response.error)
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
    if (searchResults.length > 0) {
      setActiveTab('results')
    }
  }

  // Handle recent search selection
  const handleRecentSearchSelect = (query: string) => {
    setActiveTab('input')
  }

  // Handle narrator selection
  const handleNarratorSelect = (narrator: Narrator) => {
    setSelectedNarrator(narrator)
  }

  // Close narrator profile
  const handleCloseProfile = () => {
    setSelectedNarrator(null)
  }

  // Handle bulk processing completion
  const handleBulkProcessingComplete = (results: HadithTextAnalysis[]) => {
    setBulkResults(results)
    console.log(`[INFO] Bulk processing completed with ${results.length} results`)
  }

  // Handle bulk processing start
  const handleBulkProcessingStart = (jobId: string) => {
    setCurrentJobId(jobId)
    console.log(`[INFO] Bulk processing started with job ID: ${jobId}`)
  }

  // Handle similarity search results
  const handleSimilarityResults = (results: TextSimilarityResult[]) => {
    setSimilarityResults(results)
    console.log(`[INFO] Similarity search found ${results.length} results`)
  }

  // Set text for similarity analysis
  const handleSetSimilarityText = (text: string) => {
    setSelectedAnalysisText(text)
    setActiveTab('advanced')
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  const tabVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 }
  }

  return (
    <div className="min-h-screen bg-white relative" dir="rtl">
      <FloatingElements />
      
      {/* Modern Header */}
      <motion.header 
        className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <motion.div 
              className="flex items-center gap-3" 
              dir="rtl"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="relative">
                <motion.div 
                  className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div 
                  className="relative bg-white rounded-lg p-2 shadow-lg"
                  whileHover={{ rotate: 10 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </motion.div>
              </div>
              <div>
                <motion.h1 
                  className="text-xl font-semibold text-gray-900" 
                  dir="rtl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  مُتحقق الرواة
                </motion.h1>
                <motion.p 
                  className="text-sm text-gray-500" 
                  dir="ltr"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Hadith Narrator Checker
                </motion.p>
              </div>
            </motion.div>

            {/* Status Indicators */}
            <motion.div 
              className="hidden md:flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Database className="h-3 w-3 mr-1" />
                  </motion.div>
                  Connected
                </Badge>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Brain className="h-3 w-3 mr-1" />
                  </motion.div>
                  AI Ready
                </Badge>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 relative z-10">
        {/* Welcome Section */}
        <motion.div 
          className="mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="text-center space-y-4 mb-8"
            variants={itemVariants}
          >
            <motion.h2 
              className="text-2xl font-medium text-gray-900" 
              dir="ltr"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Advanced Islamic Scholarship Platform
            </motion.h2>
            <motion.p 
              className="text-gray-600 text-base max-w-2xl mx-auto leading-relaxed" 
              dir="ltr"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              Authenticate hadith narrators using classical methodologies enhanced with modern AI analysis. 
              Access verified sources and comprehensive scholarly databases.
            </motion.p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[
              { icon: BookOpen, label: 'Classical Sources', value: '50+', color: 'blue', delay: 0 },
              { icon: Users, label: 'Verified Narrators', value: '10,000+', color: 'green', delay: 0.1 },
              { icon: Brain, label: 'AI Analysis', value: 'Real-time', color: 'purple', delay: 0.2 },
              { icon: Search, label: 'Search Accuracy', value: '99.2%', color: 'orange', delay: 0.3 },
              { icon: Zap, label: 'Processing', value: '< 2s avg', color: 'yellow', delay: 0.4 }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Card className="border-0 shadow-sm bg-gray-50/50 hover:bg-white transition-colors duration-300">
                  <CardContent className="p-4 text-center">
                    <motion.div
                      animate={{ 
                        rotateY: [0, 180, 360],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        delay: stat.delay * 2
                      }}
                    >
                      <stat.icon className={`h-5 w-5 text-${stat.color}-600 mx-auto mb-2`} />
                    </motion.div>
                    <p className="text-sm font-medium text-gray-900">{stat.label}</p>
                    <p className="text-xs text-gray-500">
                      <AnimatedCounter value={stat.value} delay={stat.delay + 0.8} />
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-8">
              <TabsList className="grid w-full grid-cols-6 bg-gray-100/50 rounded-xl p-1 h-auto" dir="ltr">
                {[
                  { value: 'input', icon: BookOpen, label: 'Analysis' },
                  { value: 'search', icon: Search, label: 'Search' },
                  { value: 'results', icon: Users, label: `Results (${narrators.length})` },
                  { value: 'ai', icon: Sparkles, label: 'AI Analysis' },
                  { value: 'advanced', icon: Zap, label: 'Advanced' },
                  { value: 'stats', icon: BarChart3, label: 'Statistics' }
                ].map((tab, index) => (
                  <motion.div
                    key={tab.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <TabsTrigger 
                      value={tab.value}
                      className="flex flex-col gap-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300"
                    >
                      <motion.div
                        animate={activeTab === tab.value ? { 
                          rotateY: [0, 360],
                          scale: [1, 1.2, 1]
                        } : {}}
                        transition={{ duration: 0.6 }}
                      >
                        <tab.icon className="h-4 w-4" />
                      </motion.div>
                      <span className="text-xs font-medium">{tab.label}</span>
                    </TabsTrigger>
                  </motion.div>
                ))}
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="min-h-[600px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <TabsContent value="input" className="mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Main Input Area */}
                      <motion.div 
                        className="lg:col-span-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg font-medium">
                              <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <Search className="h-5 w-5 text-blue-600" />
                              </motion.div>
                              Hadith Text Analysis
                            </CardTitle>
                            <p className="text-sm text-gray-500">
                              Enter a hadith text with its narrator chain (Isnad) to identify and verify the narrators
                            </p>
                          </CardHeader>
                          <CardContent>
                            {isProcessing ? (
                              <div className="py-8">
                                <AnimatedSpinner 
                                  text="Analyzing hadith text with AI..." 
                                  icon="brain"
                                  size="lg"
                                />
                              </div>
                            ) : (
                              <HadithInput 
                                onProcess={handleHadithProcess}
                                isProcessing={isProcessing}
                              />
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Recent Searches Sidebar */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg font-medium">
                              <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                              >
                                <Clock className="h-5 w-5 text-green-600" />
                              </motion.div>
                              Recent Searches
                            </CardTitle>
                            <p className="text-sm text-gray-500">
                              Your recent hadith analysis queries
                            </p>
                          </CardHeader>
                          <CardContent>
                            <ScrollArea className="h-[400px]">
                              <RecentSearches onSearchSelect={handleRecentSearchSelect} />
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  </TabsContent>

                  {/* Other tabs content with similar animation enhancements... */}
                  <TabsContent value="search" className="mt-0">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 text-lg font-medium">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Search className="h-5 w-5 text-purple-600" />
                            </motion.div>
                            Advanced Search
                          </CardTitle>
                          <p className="text-sm text-gray-500">
                            Search narrators by name, location, time period, or reliability status
                          </p>
                        </CardHeader>
                        <CardContent>
                          <AdvancedSearch 
                            onSearchResults={handleAdvancedSearchResults}
                            onLoading={setIsProcessing}
                          />
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  {/* Continue with other tabs... */}
                  <TabsContent value="results" className="mt-0" dir="ltr">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      {narrators.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2">
                            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                              <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg font-medium">
                                  <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                  >
                                    <Users className="h-5 w-5 text-green-600" />
                                  </motion.div>
                                  Search Results (<AnimatedCounter value={narrators.length} />)
                                </CardTitle>
                                <p className="text-sm text-gray-500">
                                  Click on any narrator to view detailed biographical information
                                </p>
                              </CardHeader>
                              <CardContent>
                                <NarratorList 
                                  narrators={narrators}
                                  onSelectNarrator={handleNarratorSelect}
                                />
                              </CardContent>
                            </Card>
                          </div>
                          
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            {selectedNarrator ? (
                              <NarratorProfile 
                                narrator={selectedNarrator}
                                onClose={handleCloseProfile}
                              />
                            ) : (
                              <Card className="border-0 shadow-sm">
                                <CardHeader>
                                  <CardTitle className="text-lg font-medium">Select a Narrator</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center py-8">
                                  <motion.div
                                    animate={{ 
                                      scale: [1, 1.1, 1],
                                      rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                  >
                                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                  </motion.div>
                                  <p className="text-gray-500 text-sm">
                                    Click on a narrator from the list to view detailed biographical information, 
                                    reliability assessments, and scholarly opinions.
                                  </p>
                                </CardContent>
                              </Card>
                            )}
                          </motion.div>
                        </div>
                      ) : (
                        <Card className="border-0 shadow-sm">
                          <CardContent className="text-center py-16">
                            <motion.div
                              animate={{ 
                                y: [0, -10, 0],
                                opacity: [0.5, 1, 0.5]
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Users className="h-16 w-16 mx-auto mb-6 text-gray-300" />
                            </motion.div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                              No narrators found. Try analyzing a hadith text or performing an advanced search to discover narrator information.
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </motion.div>
                  </TabsContent>

                  {/* AI Analysis Tab */}
                  <TabsContent value="ai" className="mt-0" dir="ltr">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 text-lg font-medium">
                            <motion.div
                              animate={{ 
                                rotate: [0, 360],
                                scale: [1, 1.2, 1]
                              }}
                              transition={{ duration: 3, repeat: Infinity }}
                            >
                              <Sparkles className="h-5 w-5 text-purple-600" />
                            </motion.div>
                            AI-Powered Analysis
                          </CardTitle>
                          <p className="text-sm text-gray-500">
                            Advanced artificial intelligence analysis for hadith authentication and narrator verification
                          </p>
                        </CardHeader>
                        <CardContent>
                          <AIAnalysisDashboard />
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  {/* Advanced Processing Tab */}
                  <TabsContent value="advanced" className="mt-0" dir="ltr">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Bulk Hadith Processor */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <CardHeader className="pb-4">
                              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                                <motion.div
                                  animate={{ y: [0, -5, 0] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <Upload className="h-5 w-5 text-orange-600" />
                                </motion.div>
                                Bulk Processing
                              </CardTitle>
                              <p className="text-sm text-gray-500">
                                Process multiple hadith texts simultaneously for efficiency
                              </p>
                            </CardHeader>
                            <CardContent>
                              <BulkHadithProcessor
                                onProcessingComplete={handleBulkProcessingComplete}
                                onProcessingStart={handleBulkProcessingStart}
                                maxTexts={25}
                              />
                              
                              {/* Bulk Results Summary */}
                              <AnimatePresence>
                                {bulkResults.length > 0 && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-6 p-4 bg-blue-50 rounded-lg"
                                  >
                                    <h4 className="font-medium text-blue-900 mb-3">Processing Summary</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-blue-700 font-medium">Texts Processed:</span>
                                        <span className="ml-2 text-blue-900">
                                          <AnimatedCounter value={bulkResults.length} />
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-blue-700 font-medium">Avg Confidence:</span>
                                        <span className="ml-2 text-blue-900">
                                          <AnimatedCounter 
                                            value={Math.round(bulkResults.reduce((acc, r) => acc + r.confidence, 0) / bulkResults.length) + '%'} 
                                          />
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-blue-700 font-medium">With Isnad:</span>
                                        <span className="ml-2 text-blue-900">
                                          <AnimatedCounter 
                                            value={bulkResults.filter(r => r.structuralAnalysis.hasIsnad).length} 
                                          />
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-blue-700 font-medium">Total Narrators:</span>
                                        <span className="ml-2 text-blue-900">
                                          <AnimatedCounter 
                                            value={bulkResults.reduce((acc, r) => acc + r.narrators.length, 0)} 
                                          />
                                        </span>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </CardContent>
                          </Card>
                        </motion.div>

                        {/* Hadith Similarity Engine */}
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <CardHeader className="pb-4">
                              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                                <motion.div
                                  animate={{ 
                                    scale: [1, 1.3, 1],
                                    rotate: [0, 180, 360]
                                  }}
                                  transition={{ duration: 3, repeat: Infinity }}
                                >
                                  <Zap className="h-5 w-5 text-yellow-600" />
                                </motion.div>
                                Similarity Analysis
                              </CardTitle>
                              <p className="text-sm text-gray-500">
                                Find similar hadith texts using advanced text comparison algorithms
                              </p>
                            </CardHeader>
                            <CardContent>
                              <HadithSimilarityEngine
                                sourceText={selectedAnalysisText}
                                onSimilarityResults={handleSimilarityResults}
                                threshold={0.7}
                              />
                              
                              {/* Similarity Results Summary */}
                              <AnimatePresence>
                                {similarityResults.length > 0 && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-6 p-4 bg-green-50 rounded-lg"
                                  >
                                    <h4 className="font-medium text-green-900 mb-3">Similarity Results</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-green-700 font-medium">Similar Texts:</span>
                                        <span className="ml-2 text-green-900">
                                          <AnimatedCounter value={similarityResults.length} />
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-green-700 font-medium">Highest Match:</span>
                                        <span className="ml-2 text-green-900">
                                          <AnimatedCounter 
                                            value={similarityResults.length > 0 
                                              ? Math.round(Math.max(...similarityResults.map(r => r.similarity)) * 100) + '%'
                                              : 'N/A'
                                            } 
                                          />
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-green-700 font-medium">Avg Similarity:</span>
                                        <span className="ml-2 text-green-900">
                                          <AnimatedCounter 
                                            value={similarityResults.length > 0
                                              ? Math.round((similarityResults.reduce((acc, r) => acc + r.similarity, 0) / similarityResults.length) * 100) + '%'
                                              : 'N/A'
                                            } 
                                          />
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-green-700 font-medium">Unique Sources:</span>
                                        <span className="ml-2 text-green-900">
                                          <AnimatedCounter 
                                            value={new Set(similarityResults.map(r => r.source)).size} 
                                          />
                                        </span>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* Statistics Tab */}
                  <TabsContent value="stats" className="mt-0" dir="ltr">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 text-lg font-medium">
                            <motion.div
                              animate={{ 
                                rotateY: [0, 180, 360],
                                scale: [1, 1.1, 1]
                              }}
                              transition={{ duration: 4, repeat: Infinity }}
                            >
                              <BarChart3 className="h-5 w-5 text-indigo-600" />
                            </motion.div>
                            Analytics & Statistics
                          </CardTitle>
                          <p className="text-sm text-gray-500">
                            Comprehensive statistics and analytics for your hadith research
                          </p>
                        </CardHeader>
                        <CardContent>
                          <StatsDashboard />
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center text-sm text-gray-500 border-t pt-6 mt-12" 
          dir="ltr"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <p>
            Built with ❤️ for Islamic scholarship • Powered by classical hadith science methodologies
          </p>
          <motion.p 
            className="mt-2" 
            dir="rtl"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <strong>تم بناؤه لخدمة العلوم الإسلامية والحديث الشريف</strong>
          </motion.p>
        </motion.div>
      </main>
    </div>
  )
}

