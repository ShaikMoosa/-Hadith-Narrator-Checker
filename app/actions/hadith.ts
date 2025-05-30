'use server'

import { createSupabaseAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import type { 
  Narrator, 
  Opinion, 
  Search, 
  ProcessHadithResponse,
  BookmarkToggleData 
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
      } else {
        foundNarrators = narratorData || [];
      }
    }

    // If no specific narrators found, return some default well-known narrators for demo
    if (foundNarrators.length === 0) {
      const { data: defaultNarrators, error: defaultError } = await supabase
        .from('narrator')
        .select('*')
        .limit(3);

      if (!defaultError && defaultNarrators) {
        foundNarrators = defaultNarrators;
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
 * Fetch recent searches for a user
 */
export async function fetchRecentSearches(): Promise<Search[]> {
  console.log(`[INFO] [${new Date().toISOString()}] Fetching recent searches`);

  try {
    const session = await auth();
    if (!session?.user?.id) {
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
    return data || [];
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
    return data || [];
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
    return data || [];
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
    return data || [];
  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error in searchNarrators:`, error);
    return [];
  }
} 