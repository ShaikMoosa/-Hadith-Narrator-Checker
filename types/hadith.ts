// Hadith Narrator Checker Application Types

export interface Narrator {
  id: number;
  name_arabic: string;
  name_transliteration?: string | null;
  credibility: 'trustworthy' | 'weak';
  biography?: string | null;
  birth_year?: number | null;
  death_year?: number | null;
  region?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface Opinion {
  id: number;
  narrator_id: number;
  scholar: string;
  verdict: 'trustworthy' | 'weak';
  reason?: string | null;
  source_ref?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface Bookmark {
  id: number;
  user_id: string;
  narrator_id: number;
  created_at: string;
}

export interface Search {
  id: number;
  query: string;
  result_found: boolean;
  user_id: string;
  searched_at: string;
}

// Database result types for type safety
export interface DatabaseNarrator {
  id: number;
  name_arabic: string;
  name_transliteration: string | null;
  credibility: string;
  biography: string | null;
  birth_year: number | null;
  death_year: number | null;
  region: string | null;
  created_at: string | null;
  updated_at: string | null;
  search_rank?: number;
}

export interface DatabaseOpinion {
  id: number;
  narrator_id: number;
  scholar: string;
  verdict: string;
  reason: string | null;
  source_ref: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DatabaseSearch {
  id: number;
  query: string;
  result_found: boolean;
  user_id: string;
  searched_at: string | null;
}

// Advanced Processing Types (Phase 5A)
export interface BulkProcessingJob {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  totalTexts: number;
  processedTexts: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface TextSimilarityResult {
  id: string;
  text: string;
  similarity: number;
  source: 'user_search' | 'canonical_hadith' | 'database_entry';
  timestamp: string;
  metadata?: {
    narratorCount?: number;
    confidence?: number;
    sourceReference?: string;
  };
}

export interface ProcessingProgress {
  jobId: string;
  processed: number;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  currentText?: string;
  timestamp: string;
  results?: HadithTextAnalysis[];
  error?: string;
  estimatedTimeRemaining?: number;
}

export interface HadithTextAnalysis {
  originalText: string;
  normalizedText: string;
  linguisticFeatures: {
    length: number;
    wordCount: number;
    arabicWordCount: number;
    englishWordCount: number;
    hasTraditionalMarkers: boolean;
    hasNarratorIndicators: boolean;
    textComplexity: number;
  };
  narratorChain: {
    extractedNames: string[];
    chainLength: number;
    hasTraditionalMarkers: boolean;
    confidence: number;
  };
  structuralAnalysis: {
    hasIsnad: boolean;
    hasMatn: boolean;
    structureScore: number;
    traditionalFormula: boolean;
  };
  similarTexts: TextSimilarityResult[];
  narrators: Narrator[];
  confidence: number;
  timestamp: string;
  metadata?: {
    processingTime?: number;
    analysisVersion?: string;
    warnings?: string[];
  };
}

// Search and suggestion types
export interface SearchSuggestion {
  suggestion: string;
  type: string;
  credibility: string;
}

export interface AdvancedSearchParams {
  searchTerm?: string;
  credibilityFilter?: 'trustworthy' | 'weak' | '';
  regionFilter?: string;
  minBirthYear?: number;
  maxBirthYear?: number;
  limit?: number;
}

export interface NarratorStats {
  totalNarrators: number;
  trustworthyCount: number;
  weakCount: number;
  regionsCount: number;
  opinionsCount: number;
}

// Type conversion functions
export function convertDatabaseNarrator(dbNarrator: DatabaseNarrator): Narrator {
  return {
    id: dbNarrator.id,
    name_arabic: dbNarrator.name_arabic,
    name_transliteration: dbNarrator.name_transliteration,
    credibility: dbNarrator.credibility as 'trustworthy' | 'weak',
    biography: dbNarrator.biography,
    birth_year: dbNarrator.birth_year,
    death_year: dbNarrator.death_year,
    region: dbNarrator.region,
    created_at: dbNarrator.created_at || new Date().toISOString(),
    updated_at: dbNarrator.updated_at,
  };
}

export function convertDatabaseOpinion(dbOpinion: DatabaseOpinion): Opinion {
  return {
    id: dbOpinion.id,
    narrator_id: dbOpinion.narrator_id,
    scholar: dbOpinion.scholar,
    verdict: dbOpinion.verdict as 'trustworthy' | 'weak',
    reason: dbOpinion.reason,
    source_ref: dbOpinion.source_ref,
    created_at: dbOpinion.created_at || new Date().toISOString(),
    updated_at: dbOpinion.updated_at,
  };
}

export function convertDatabaseSearch(dbSearch: DatabaseSearch): Search {
  return {
    id: dbSearch.id,
    query: dbSearch.query,
    result_found: dbSearch.result_found,
    user_id: dbSearch.user_id,
    searched_at: dbSearch.searched_at || new Date().toISOString(),
  };
}

// Frontend Application State Types
export interface HadithAppState {
  hadithInput: string;
  narrators: Narrator[];
  selectedNarrator: Narrator | null;
  recentSearches: Search[];
  bookmarkedNarrators: Narrator[];
  isProcessing: boolean;
  error: string | null;
}

// API Response Types
export interface ProcessHadithResponse {
  success: boolean;
  narrators: Narrator[];
  hadithDetails?: {
    id: string;
    text: string;
    source: string;
    chapter?: string;
  };
  error?: string;
}

// Component Props Types
export interface NarratorListProps {
  narrators: Narrator[];
  onSelectNarrator: (narrator: Narrator) => void;
}

export interface NarratorProfileProps {
  narrator: Narrator;
  onClose: () => void;
}

export interface OpinionsListProps {
  opinions: Opinion[];
  sortBy?: 'scholar' | 'verdict';
}

export interface RecentSearchesProps {
  searches: Search[];
  onSearchSelect: (query: string) => void;
}

// Form Types
export interface BookmarkToggleData {
  narratorId: number;
  isBookmarked: boolean;
}

export interface HadithSubmissionData {
  hadithText: string;
}

// Advanced Processing Component Props (Phase 5A)
export interface BulkProcessorProps {
  onProcessingComplete: (results: HadithTextAnalysis[]) => void;
  onProcessingStart: (jobId: string) => void;
  maxTexts?: number;
}

export interface SimilarityEngineProps {
  sourceText: string;
  onSimilarityResults: (results: TextSimilarityResult[]) => void;
  threshold?: number;
}

export interface ProcessingProgressProps {
  jobId: string;
  onProgressUpdate: (progress: ProcessingProgress) => void;
  pollingInterval?: number;
}

export interface AnalysisResultsProps {
  analyses: HadithTextAnalysis[];
  onExport: (format: 'json' | 'csv' | 'pdf') => void;
  sortBy?: 'confidence' | 'timestamp' | 'wordCount';
}

// Export Configuration Types
export interface ExportConfig {
  format: 'json' | 'csv' | 'pdf';
  includeMetadata: boolean;
  includeNarrators: boolean;
  includeSimilarTexts: boolean;
  maxResults?: number;
} 