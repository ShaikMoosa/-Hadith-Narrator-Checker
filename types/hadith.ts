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
  updated_at?: string;
}

export interface Opinion {
  id: number;
  narrator_id: number;
  scholar: string;
  verdict: 'trustworthy' | 'weak';
  reason?: string | null;
  source_ref?: string | null;
  created_at: string;
  updated_at?: string;
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