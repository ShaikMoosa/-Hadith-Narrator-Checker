'use server'

import { createSupabaseAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import type { 
  Narrator, 
  Opinion, 
  Search, 
  ProcessHadithResponse,
  DatabaseNarrator,
  DatabaseOpinion,
  DatabaseSearch,
  SearchSuggestion,
  AdvancedSearchParams,
  NarratorStats
} from '@/types/hadith'
import { 
  convertDatabaseNarrator, 
  convertDatabaseOpinion, 
  convertDatabaseSearch 
} from '@/types/hadith'

/**
 * Process hadith text to extract narrator chain and identify hadith
 * This is the main server action for hadith analysis
 */
export async function processHadithText(hadithText: string): Promise<ProcessHadithResponse> {
  console.log(`[INFO] [${new Date().toISOString()}] Hadith text received for processing: "${hadithText.substring(0, 100)}..."`);

  try {
    // Input validation
    if (!hadithText || hadithText.trim().length === 0) {
      console.error(`[ERROR] [${new Date().toISOString()}] Invalid hadith text input.`);
      return {
        success: false,
        narrators: [],
        error: 'Please provide a valid hadith text.'
      };
    }

    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        narrators: [],
        error: 'Authentication required.'
      };
    }

    const normalizedText = hadithText.trim();
    console.log(`[INFO] [${new Date().toISOString()}] Normalized hadith text: "${normalizedText.substring(0, 100)}..."`);

    // TODO: Integrate with specialized libraries when available
    // For now, we'll simulate the process and search for matching narrators in the database
    
    // Simulate hadith processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Search for narrators that might be mentioned in the hadith text
    const supabase = await createSupabaseAdminClient();
    
    // Extract potential narrator names from the text (simplified approach)
    const potentialNarratorNames = extractNarratorNamesFromText(normalizedText);
    
    let foundNarrators: Narrator[] = [];
    
    if (potentialNarratorNames.length > 0) {
      const { data: narratorData, error: narratorError } = await supabase
        .from('narrator')
        .select('*')
        .or(potentialNarratorNames.map(name => `name_arabic.ilike.%${name}%,name_transliteration.ilike.%${name}%`).join(','));

      if (narratorError) {
        console.error(`[ERROR] [${new Date().toISOString()}] Error fetching narrators:`, narratorError);
      } else if (narratorData) {
        foundNarrators = narratorData.map(convertDatabaseNarrator);
      }
    }

    // If no specific narrators found, return some default well-known narrators for demo
    if (foundNarrators.length === 0) {
      const { data: defaultNarrators, error: defaultError } = await supabase
        .from('narrator')
        .select('*')
        .limit(3);

      if (!defaultError && defaultNarrators) {
        foundNarrators = defaultNarrators.map(convertDatabaseNarrator);
      }
    }

    // Save search to database
    await saveSearchToDatabase(session.user.id, hadithText, foundNarrators.length > 0);

    console.log(`[INFO] [${new Date().toISOString()}] Successfully processed hadith and found ${foundNarrators.length} narrators`);

    return {
      success: true,
      narrators: foundNarrators,
      hadithDetails: {
        id: `hadith-${Date.now()}`,
        text: normalizedText,
        source: 'Processing Result',
        chapter: 'Hadith Analysis'
      }
    };

  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error processing hadith text:`, error);
    return {
      success: false,
      narrators: [],
      error: 'Failed to process hadith text. Please try again.'
    };
  }
}

/**
 * Simple function to extract potential narrator names from hadith text
 * This is a simplified approach - in production, this would use specialized hadith processing libraries
 */
function extractNarratorNamesFromText(text: string): string[] {
  const commonNarratorTerms = [
    'أبو هريرة', 'Abu Hurairah',
    'عائشة', 'Aisha',
    'أبو بكر', 'Abu Bakr',
    'عمر', 'Umar',
    'علي', 'Ali',
    'حدثنا', 'أخبرنا', 'عن'
  ];

  const foundTerms: string[] = [];
  
  for (const term of commonNarratorTerms) {
    if (text.includes(term)) {
      foundTerms.push(term);
    }
  }

  return foundTerms;
}

/**
 * Save search query to database for search history
 */
async function saveSearchToDatabase(userId: string, query: string, resultFound: boolean): Promise<void> {
  try {
    const supabase = await createSupabaseAdminClient();
    
    const { error } = await supabase
      .from('search')
      .insert({
        query: query.substring(0, 500), // Limit query length
        result_found: resultFound,
        user_id: userId,
        searched_at: new Date().toISOString()
      });

    if (error) {
      console.error(`[ERROR] [${new Date().toISOString()}] Failed to save search:`, error);
    } else {
      console.log(`[INFO] [${new Date().toISOString()}] Search saved to database`);
    }
  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error saving search:`, error);
  }
}

/**
 * Toggle bookmark status for a narrator
 */
export async function toggleBookmark(narratorId: number): Promise<{ success: boolean; isBookmarked: boolean; error?: string }> {
  console.log(`[INFO] [${new Date().toISOString()}] Toggle bookmark for narrator ID: ${narratorId}`);

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        isBookmarked: false,
        error: 'Authentication required.'
      };
    }

    const supabase = await createSupabaseAdminClient();

    // Check if bookmark already exists
    const { data: existingBookmark, error: checkError } = await supabase
      .from('bookmark')
      .select('id')
      .eq('narrator_id', narratorId)
      .eq('user_id', session.user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw checkError;
    }

    if (existingBookmark) {
      // Remove bookmark
      const { error: deleteError } = await supabase
        .from('bookmark')
        .delete()
        .eq('narrator_id', narratorId)
        .eq('user_id', session.user.id);

      if (deleteError) throw deleteError;

      console.log(`[INFO] [${new Date().toISOString()}] Bookmark removed for narrator ${narratorId}`);
      revalidatePath('/app');
      return { success: true, isBookmarked: false };
    } else {
      // Add bookmark
      const { error: insertError } = await supabase
        .from('bookmark')
        .insert({
          narrator_id: narratorId,
          user_id: session.user.id,
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      console.log(`[INFO] [${new Date().toISOString()}] Bookmark added for narrator ${narratorId}`);
      revalidatePath('/app');
      return { success: true, isBookmarked: true };
    }
  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error toggling bookmark:`, error);
    return {
      success: false,
      isBookmarked: false,
      error: 'Failed to update bookmark. Please try again.'
    };
  }
}

/**
 * Fetch recent searches for the current user
 */
export async function fetchRecentSearches(): Promise<Search[]> {
  console.log(`[INFO] [${new Date().toISOString()}] Fetching recent searches for user`);

  try {
    const session = await auth();
    if (!session?.user?.id) {
      console.log(`[INFO] [${new Date().toISOString()}] No authenticated user found`);
      return [];
    }

    const supabase = await createSupabaseAdminClient();
    
    const { data, error } = await supabase
      .from('search')
      .select('*')
      .eq('user_id', session.user.id)
      .order('searched_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error(`[ERROR] [${new Date().toISOString()}] Error fetching recent searches:`, error);
      return [];
    }

    console.log(`[INFO] [${new Date().toISOString()}] Fetched ${data?.length || 0} recent searches`);
    return (data as DatabaseSearch[])?.map(convertDatabaseSearch) || [];
  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error in fetchRecentSearches:`, error);
    return [];
  }
}

/**
 * Fetch opinions for a specific narrator
 */
export async function fetchNarratorOpinions(narratorId: number): Promise<Opinion[]> {
  console.log(`[INFO] [${new Date().toISOString()}] Fetching opinions for narrator ID: ${narratorId}`);

  try {
    const supabase = await createSupabaseAdminClient();
    
    const { data, error } = await supabase
      .from('opinion')
      .select('*')
      .eq('narrator_id', narratorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`[ERROR] [${new Date().toISOString()}] Error fetching opinions:`, error);
      return [];
    }

    console.log(`[INFO] [${new Date().toISOString()}] Fetched ${data?.length || 0} opinions for narrator ${narratorId}`);
    return (data as DatabaseOpinion[])?.map(convertDatabaseOpinion) || [];
  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error in fetchNarratorOpinions:`, error);
    return [];
  }
}

/**
 * Check if a narrator is bookmarked by the current user
 */
export async function checkBookmarkStatus(narratorId: number): Promise<boolean> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return false;
    }

    const supabase = await createSupabaseAdminClient();
    
    const { data, error } = await supabase
      .from('bookmark')
      .select('id')
      .eq('narrator_id', narratorId)
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error(`[ERROR] [${new Date().toISOString()}] Error checking bookmark status:`, error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error in checkBookmarkStatus:`, error);
    return false;
  }
}

/**
 * Get all narrators with optional filtering
 */
export async function getAllNarrators(limit?: number): Promise<Narrator[]> {
  console.log(`[INFO] [${new Date().toISOString()}] Fetching all narrators`);

  try {
    const supabase = await createSupabaseAdminClient();
    
    let query = supabase
      .from('narrator')
      .select('*')
      .order('name_arabic', { ascending: true });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`[ERROR] [${new Date().toISOString()}] Error fetching narrators:`, error);
      return [];
    }

    console.log(`[INFO] [${new Date().toISOString()}] Fetched ${data?.length || 0} narrators`);
    return (data as DatabaseNarrator[])?.map(convertDatabaseNarrator) || [];
  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error in getAllNarrators:`, error);
    return [];
  }
}

/**
 * Search narrators by name or transliteration
 */
export async function searchNarrators(searchTerm: string): Promise<Narrator[]> {
  console.log(`[INFO] [${new Date().toISOString()}] Searching narrators with term: "${searchTerm}"`);

  try {
    const supabase = await createSupabaseAdminClient();
    
    const { data, error } = await supabase
      .from('narrator')
      .select('*')
      .or(`name_arabic.ilike.%${searchTerm}%,name_transliteration.ilike.%${searchTerm}%`)
      .order('name_arabic', { ascending: true })
      .limit(20);

    if (error) {
      console.error(`[ERROR] [${new Date().toISOString()}] Error searching narrators:`, error);
      return [];
    }

    console.log(`[INFO] [${new Date().toISOString()}] Found ${data?.length || 0} narrators matching "${searchTerm}"`);
    return (data as DatabaseNarrator[])?.map(convertDatabaseNarrator) || [];
  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error in searchNarrators:`, error);
    return [];
  }
}

/**
 * Advanced narrator search with full-text search and filtering
 */
export async function searchNarratorsAdvanced(params: AdvancedSearchParams): Promise<(Narrator & { searchRank?: number })[]> {
  console.log(`[INFO] [${new Date().toISOString()}] Advanced search with params:`, params);

  try {
    const supabase = await createSupabaseAdminClient();
    
    const {
      searchTerm = '',
      credibilityFilter = '',
      regionFilter = '',
      minBirthYear,
      maxBirthYear,
      limit = 20
    } = params;

    // Use the advanced search function if available, otherwise fallback to regular query
    try {
      const { data, error } = await supabase
        .rpc('search_narrators_advanced', {
          search_term: searchTerm,
          credibility_filter: credibilityFilter,
          region_filter: regionFilter,
          min_birth_year: minBirthYear,
          max_birth_year: maxBirthYear,
          limit_count: limit
        });

      if (error) {
        console.error(`[ERROR] [${new Date().toISOString()}] Error in advanced search RPC:`, error);
        // Fallback to regular search
        return await fallbackSearch(params);
      }

      const results = (data as DatabaseNarrator[])?.map(item => ({
        ...convertDatabaseNarrator(item),
        searchRank: item.search_rank
      })) || [];

      console.log(`[INFO] [${new Date().toISOString()}] Advanced search found ${results.length} results`);
      return results;
    } catch (rpcError) {
      console.error(`[ERROR] [${new Date().toISOString()}] RPC function not available, using fallback:`, rpcError);
      return await fallbackSearch(params);
    }
  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error in searchNarratorsAdvanced:`, error);
    return [];
  }
}

/**
 * Fallback search function when RPC is not available
 */
async function fallbackSearch(params: AdvancedSearchParams): Promise<Narrator[]> {
  try {
    const supabase = await createSupabaseAdminClient();
    
    let query = supabase.from('narrator').select('*');
    
    if (params.searchTerm) {
      query = query.or(`name_arabic.ilike.%${params.searchTerm}%,name_transliteration.ilike.%${params.searchTerm}%`);
    }
    
    if (params.credibilityFilter) {
      query = query.eq('credibility', params.credibilityFilter);
    }
    
    if (params.regionFilter) {
      query = query.ilike('region', `%${params.regionFilter}%`);
    }
    
    if (params.minBirthYear) {
      query = query.gte('birth_year', params.minBirthYear);
    }
    
    if (params.maxBirthYear) {
      query = query.lte('birth_year', params.maxBirthYear);
    }
    
    query = query.order('name_arabic').limit(params.limit || 20);
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`[ERROR] [${new Date().toISOString()}] Error in fallback search:`, error);
      return [];
    }
    
    return (data as DatabaseNarrator[])?.map(convertDatabaseNarrator) || [];
  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error in fallback search:`, error);
    return [];
  }
}

/**
 * Get search suggestions for autocomplete
 */
export async function getSearchSuggestions(partialTerm: string, limit: number = 10): Promise<SearchSuggestion[]> {
  console.log(`[INFO] [${new Date().toISOString()}] Getting suggestions for: "${partialTerm}"`);

  try {
    if (!partialTerm || partialTerm.length < 2) {
      return [];
    }

    const supabase = await createSupabaseAdminClient();
    
    try {
      const { data, error } = await supabase
        .rpc('get_search_suggestions', {
          partial_term: partialTerm,
          suggestion_limit: limit
        });

      if (error) {
        console.error(`[ERROR] [${new Date().toISOString()}] Error getting suggestions RPC:`, error);
        return await fallbackSuggestions(partialTerm, limit);
      }

      const suggestions = (data as SearchSuggestion[]) || [];
      console.log(`[INFO] [${new Date().toISOString()}] Found ${suggestions.length} suggestions`);
      return suggestions;
    } catch (rpcError) {
      console.error(`[ERROR] [${new Date().toISOString()}] RPC function not available for suggestions:`, rpcError);
      return await fallbackSuggestions(partialTerm, limit);
    }
  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error in getSearchSuggestions:`, error);
    return [];
  }
}

/**
 * Fallback suggestions when RPC is not available
 */
async function fallbackSuggestions(partialTerm: string, limit: number): Promise<SearchSuggestion[]> {
  try {
    const supabase = await createSupabaseAdminClient();
    
    const { data, error } = await supabase
      .from('narrator')
      .select('name_arabic, name_transliteration, credibility, region')
      .or(`name_arabic.ilike.${partialTerm}%,name_transliteration.ilike.${partialTerm}%`)
      .limit(limit);
    
    if (error || !data) {
      return [];
    }
    
    const suggestions: SearchSuggestion[] = [];
    
    data.forEach(narrator => {
      if (narrator.name_arabic?.toLowerCase().includes(partialTerm.toLowerCase())) {
        suggestions.push({
          suggestion: narrator.name_arabic,
          type: 'arabic_name',
          credibility: narrator.credibility || 'unknown'
        });
      }
      if (narrator.name_transliteration?.toLowerCase().includes(partialTerm.toLowerCase())) {
        suggestions.push({
          suggestion: narrator.name_transliteration,
          type: 'transliteration',
          credibility: narrator.credibility || 'unknown'
        });
      }
    });
    
    return suggestions.slice(0, limit);
  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error in fallback suggestions:`, error);
    return [];
  }
}

/**
 * Get narrator statistics for dashboard
 */
export async function getNarratorStats(): Promise<{
  totalNarrators: number;
  trustworthyCount: number;
  weakCount: number;
  regionsCount: number;
  opinionsCount: number;
}> {
  console.log(`[INFO] [${new Date().toISOString()}] Fetching narrator statistics`);

  try {
    const supabase = await createSupabaseAdminClient();
    
    // Get narrator counts by credibility
    const { data: narratorStats, error: narratorError } = await supabase
      .from('narrator')
      .select('credibility');

    // Get unique regions count
    const { data: regions, error: regionsError } = await supabase
      .from('narrator')
      .select('region')
      .not('region', 'is', null);

    // Get total opinions count
    const { data: opinions, error: opinionsError } = await supabase
      .from('opinion')
      .select('id');

    if (narratorError || regionsError || opinionsError) {
      console.error(`[ERROR] [${new Date().toISOString()}] Error fetching stats:`, { narratorError, regionsError, opinionsError });
      return {
        totalNarrators: 0,
        trustworthyCount: 0,
        weakCount: 0,
        regionsCount: 0,
        opinionsCount: 0
      };
    }

    const trustworthyCount = narratorStats?.filter(n => n.credibility === 'trustworthy').length || 0;
    const weakCount = narratorStats?.filter(n => n.credibility === 'weak').length || 0;
    const uniqueRegions = new Set(regions?.map(r => r.region).filter(Boolean));

    const stats = {
      totalNarrators: narratorStats?.length || 0,
      trustworthyCount,
      weakCount,
      regionsCount: uniqueRegions.size,
      opinionsCount: opinions?.length || 0
    };

    console.log(`[INFO] [${new Date().toISOString()}] Stats fetched:`, stats);
    return stats;
  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error in getNarratorStats:`, error);
    return {
      totalNarrators: 0,
      trustworthyCount: 0,
      weakCount: 0,
      regionsCount: 0,
      opinionsCount: 0
    };
  }
}

/**
 * Get unique regions for filter dropdown
 */
export async function getAvailableRegions(): Promise<string[]> {
  try {
    const supabase = await createSupabaseAdminClient();
    
    const { data, error } = await supabase
      .from('narrator')
      .select('region')
      .not('region', 'is', null)
      .order('region');

    if (error) {
      console.error(`[ERROR] [${new Date().toISOString()}] Error fetching regions:`, error);
      return [];
    }

    const uniqueRegions = [...new Set(data?.map(item => item.region).filter(Boolean))];
    return uniqueRegions as string[];
  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error in getAvailableRegions:`, error);
    return [];
  }
}

/**
 * Enhanced processHadithText with better search integration
 */
export async function processHadithTextEnhanced(hadithText: string): Promise<ProcessHadithResponse> {
  console.log(`[INFO] [${new Date().toISOString()}] Enhanced hadith processing for: "${hadithText.substring(0, 100)}..."`);

  try {
    // Input validation
    if (!hadithText || hadithText.trim().length === 0) {
      return {
        success: false,
        narrators: [],
        error: 'Please provide a valid hadith text.'
      };
    }

    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        narrators: [],
        error: 'Authentication required.'
      };
    }

    const normalizedText = hadithText.trim();

    // Extract potential narrator names and search terms
    const searchTerms = extractEnhancedSearchTerms(normalizedText);
    
    let foundNarrators: Narrator[] = [];
    
    // Use advanced search for each term
    for (const term of searchTerms) {
      const results = await searchNarratorsAdvanced({
        searchTerm: term,
        limit: 5
      });
      foundNarrators.push(...results);
    }

    // Remove duplicates
    const uniqueNarrators = foundNarrators.filter((narrator, index, self) => 
      index === self.findIndex(n => n.id === narrator.id)
    );

    // If no specific narrators found, get some defaults
    if (uniqueNarrators.length === 0) {
      const defaultResults = await searchNarratorsAdvanced({ limit: 3 });
      uniqueNarrators.push(...defaultResults);
    }

    // Save search to database
    await saveSearchToDatabase(session.user.id, hadithText, uniqueNarrators.length > 0);

    console.log(`[INFO] [${new Date().toISOString()}] Enhanced processing found ${uniqueNarrators.length} narrators`);

    return {
      success: true,
      narrators: uniqueNarrators,
      hadithDetails: {
        id: `hadith-${Date.now()}`,
        text: normalizedText,
        source: 'Enhanced Analysis',
        chapter: 'Advanced Processing'
      }
    };

  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error in enhanced processing:`, error);
    return {
      success: false,
      narrators: [],
      error: 'Failed to process hadith text. Please try again.'
    };
  }
}

/**
 * Enhanced function to extract search terms from hadith text
 */
function extractEnhancedSearchTerms(text: string): string[] {
  const enhancedTerms = [
    // Arabic narrator indicators
    'أبو هريرة', 'Abu Hurairah',
    'عائشة', 'Aisha',
    'أبو بكر', 'Abu Bakr', 
    'عمر', 'Umar',
    'علي', 'Ali',
    // Hadith transmission terms
    'حدثنا', 'أخبرنا', 'عن', 'قال',
    // Common names
    'محمد', 'أحمد', 'عبد الله', 'عبد الرحمن'
  ];

  const foundTerms: string[] = [];
  
  for (const term of enhancedTerms) {
    if (text.includes(term)) {
      foundTerms.push(term);
    }
  }

  // Also extract quoted names or potential names
  const namePattern = /(?:حدثنا|أخبرنا|عن)\s+([أ-ي\s]{3,})/g;
  let match;
  while ((match = namePattern.exec(text)) !== null) {
    if (match[1]) {
      foundTerms.push(match[1].trim());
    }
  }

  return [...new Set(foundTerms)]; // Remove duplicates
} 