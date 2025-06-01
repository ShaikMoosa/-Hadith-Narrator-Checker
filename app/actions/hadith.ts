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

// Enhanced error types for production-ready error handling
interface ServerActionError {
  type: 'database' | 'validation' | 'authentication' | 'network' | 'processing' | 'timeout' | 'unknown';
  message: string;
  userMessage: string;
  retryable: boolean;
  code?: string;
  context?: any;
}

interface ServerActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: ServerActionError;
  timestamp: string;
  duration?: number;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

// Default retry configuration for server operations
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2
};

/**
 * Create standardized server action error
 */
function createServerActionError(
  type: ServerActionError['type'],
  message: string,
  userMessage: string,
  retryable: boolean = true,
  code?: string,
  context?: any
): ServerActionError {
  return {
    type,
    message,
    userMessage,
    retryable,
    code,
    context
  };
}

/**
 * Log server action errors with comprehensive context
 */
function logServerActionError(error: ServerActionError, action: string, context: any = {}) {
  console.error(`[Server Action] ${action} Error:`, {
    type: error.type,
    message: error.message,
    code: error.code,
    retryable: error.retryable,
    timestamp: new Date().toISOString(),
    action,
    context: {
      ...context,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      nodeVersion: process.version
    }
  });
}

/**
 * Execute function with automatic retry logic
 */
async function executeWithRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  context: string = 'Unknown Operation'
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
          retryConfig.maxDelay
        );
        console.log(`[Server Action] Retry attempt ${attempt} for ${context} after ${delay}ms delay`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`[Server Action] Attempt ${attempt + 1} failed for ${context}:`, error);
      
      if (attempt === retryConfig.maxRetries) {
        throw createServerActionError(
          'processing',
          `Max retries exceeded for ${context}`,
          'Operation failed after multiple attempts. Please try again.',
          false,
          'MAX_RETRIES_EXCEEDED',
          { attempts: attempt + 1, context }
        );
      }
    }
  }

  throw lastError;
}

/**
 * Execute function with timeout protection
 */
async function executeWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  context: string = 'Unknown Operation'
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(
        createServerActionError(
          'timeout',
          `Operation timeout for ${context}`,
          'Operation is taking too long. Please try again.',
          true,
          'OPERATION_TIMEOUT',
          { timeoutMs, context }
        )
      ), timeoutMs)
    )
  ]);
}

/**
 * Validate input data with comprehensive error handling
 */
function validateHadithInput(text: string): ServerActionError | null {
  if (!text || typeof text !== 'string') {
    return createServerActionError(
      'validation',
      'Invalid input: text must be a non-empty string',
      'Please provide valid hadith text.',
      false,
      'INVALID_INPUT_TYPE'
    );
  }

  const trimmedText = text.trim();
  if (trimmedText.length === 0) {
    return createServerActionError(
      'validation',
      'Empty input text provided',
      'Please enter some hadith text to analyze.',
      false,
      'EMPTY_INPUT'
    );
  }

  if (trimmedText.length > 10000) {
    return createServerActionError(
      'validation',
      'Input text too long',
      'Please provide shorter text (maximum 10,000 characters).',
      false,
      'TEXT_TOO_LONG',
      { length: trimmedText.length, maxLength: 10000 }
    );
  }

  return null;
}

/**
 * Enhanced narrator data with proper validation
 */
interface EnhancedNarratorData {
  id: string;
  name: string;
  credibility_level: string;
  confidence: number;
  birth_year?: number;
  death_year?: number;
  region?: string;
  match_position?: number;
}

/**
 * Normalize Arabic text for better processing
 */
function normalizeArabicText(text: string): string {
  return text
    // Remove diacritics (تشكيل)
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    // Normalize Alef variants
    .replace(/[أإآ]/g, 'ا')
    // Normalize Teh Marbuta
    .replace(/ة/g, 'ه')
    // Normalize Yeh variants
    .replace(/[ىي]/g, 'ي')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract narrator names from text using pattern matching
 */
function extractNarratorsFromText(text: string): Array<{ name: string; confidence: number; position: number }> {
  const results: Array<{ name: string; confidence: number; position: number }> = [];
  
  // Enhanced Arabic narrator patterns
  const narratorPatterns = [
    { pattern: /حدثنا\s+([^،.؛]+)/g, confidence: 0.9 },           // "narrated to us"
    { pattern: /أخبرنا\s+([^،.؛]+)/g, confidence: 0.9 },          // "informed us"
    { pattern: /حدثني\s+([^،.؛]+)/g, confidence: 0.85 },          // "narrated to me"
    { pattern: /قال\s+([^،.؛]+)/g, confidence: 0.7 },            // "said"
    { pattern: /عن\s+([^،.؛]+)/g, confidence: 0.6 },             // "from/about"
    { pattern: /بن\s+([^،.؛]+)/g, confidence: 0.75 },            // "son of"
    { pattern: /أبو\s+([^،.؛]+)/g, confidence: 0.8 },            // "father of"
  ];

  for (const { pattern, confidence } of narratorPatterns) {
    let match;
    const tempPattern = new RegExp(pattern.source, pattern.flags);
    while ((match = tempPattern.exec(text)) !== null) {
      const name = match[1].trim();
      if (name.length > 2 && name.length < 50) {
        results.push({
          name,
          confidence,
          position: match.index
        });
      }
    }
  }

  return results;
}

/**
 * Process hadith text with comprehensive error handling and monitoring
 */
export async function processHadithText(text: string): Promise<ServerActionResult<{
  originalText: string;
  normalizedText: string;
  narrators: EnhancedNarratorData[];
  processingTime: number;
  confidence: number;
}>> {
  const startTime = performance.now();
  
  try {
    console.log('[INFO] [' + new Date().toISOString() + '] Hadith text received for processing:', text.substring(0, 100) + '...');
    
    // Input validation
    const validationError = validateHadithInput(text);
    if (validationError) {
      logServerActionError(validationError, 'processHadithText', { textLength: text.length });
      return {
        success: false,
        error: validationError,
        timestamp: new Date().toISOString()
      };
    }

    // Get user context (if available)
    const userContext = 'anonymous'; // TODO: Get from auth session
    console.log('[INFO] [' + new Date().toISOString() + '] Processing hadith for user:', userContext);

    // Normalize text with error handling
    const normalizedText = await executeWithTimeout(
      () => executeWithRetry(
        () => Promise.resolve(normalizeArabicText(text)),
        { maxRetries: 2 },
        'Text Normalization'
      ),
      5000,
      'Text Normalization'
    );

    console.log('[INFO] [' + new Date().toISOString() + '] Normalized hadith text:', normalizedText.substring(0, 100) + '...');

    // Extract narrator information with database lookup
    const narratorData = await executeWithTimeout(
      () => executeWithRetry(
        () => extractAndLookupNarrators(normalizedText),
        { maxRetries: 3 },
        'Narrator Extraction and Database Lookup'
      ),
      15000,
      'Narrator Processing'
    );

    const processingTime = performance.now() - startTime;
    
    // Calculate overall confidence
    const confidence = narratorData.length > 0 
      ? narratorData.reduce((sum, n) => sum + n.confidence, 0) / narratorData.length
      : 0.5;

    console.log('[INFO] [' + new Date().toISOString() + '] Successfully processed hadith and found', narratorData.length, 'narrators');

    return {
      success: true,
      data: {
        originalText: text,
        normalizedText,
        narrators: narratorData,
        processingTime: Math.round(processingTime),
        confidence
      },
      timestamp: new Date().toISOString(),
      duration: Math.round(processingTime)
    };

  } catch (error: any) {
    const processingTime = performance.now() - startTime;
    
    const serverActionError = error.type ? error as ServerActionError : createServerActionError(
      'processing',
      error.message || 'Unknown error during hadith processing',
      'Failed to process hadith text. Please try again.',
      true,
      'PROCESSING_ERROR',
      { originalError: error.message, stack: error.stack }
    );

    logServerActionError(serverActionError, 'processHadithText', { 
      textLength: text.length,
      processingTime: Math.round(processingTime)
    });

    return {
      success: false,
      error: serverActionError,
      timestamp: new Date().toISOString(),
      duration: Math.round(processingTime)
    };
  }
}

/**
 * Extract and lookup narrators with enhanced error handling
 */
async function extractAndLookupNarrators(text: string): Promise<EnhancedNarratorData[]> {
  try {
    // Pattern-based extraction
    const extractedNarrators = extractNarratorsFromText(text);
    
    if (extractedNarrators.length === 0) {
      console.log('[INFO] [' + new Date().toISOString() + '] No narrators found in text using pattern matching');
      return [];
    }

    // Database lookup with error handling
    const supabase = await createSupabaseAdminClient();
    const enhancedNarrators: EnhancedNarratorData[] = [];

    for (const extracted of extractedNarrators) {
      try {
        const { data: matchedNarrators, error } = await supabase
          .from('narrator')
          .select('*')
          .ilike('name_arabic', `%${extracted.name}%`)
          .limit(5);

        if (error) {
          console.warn('[WARN] [' + new Date().toISOString() + '] Database lookup failed for narrator:', extracted.name, error);
          // Continue processing other narrators instead of failing completely
          continue;
        }

        if (matchedNarrators && matchedNarrators.length > 0) {
          const bestMatch = matchedNarrators[0];
          enhancedNarrators.push({
            id: bestMatch.id.toString(),
            name: bestMatch.name_arabic,
            credibility_level: bestMatch.credibility || 'unknown',
            confidence: extracted.confidence,
            birth_year: bestMatch.birth_year || undefined,
            death_year: bestMatch.death_year || undefined,
            region: bestMatch.region || undefined,
            match_position: extracted.position
          });
        }
      } catch (narratorError: any) {
        console.warn('[WARN] [' + new Date().toISOString() + '] Failed to process narrator:', extracted.name, narratorError);
        // Continue with other narrators
      }
    }

    return enhancedNarrators;

  } catch (error: any) {
    throw createServerActionError(
      'database',
      `Narrator extraction and lookup failed: ${error.message}`,
      'Failed to analyze narrator information. Please try again.',
      true,
      'NARRATOR_EXTRACTION_ERROR',
      { originalError: error.message }
    );
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
 * Search narrators with enhanced error handling and pagination
 */
export async function searchNarratorsWithFilters(
  query: string,
  filters: {
    credibility?: string;
    region?: string;
    birth_year_min?: number;
    birth_year_max?: number;
  } = {},
  page: number = 1,
  limit: number = 10
): Promise<ServerActionResult<{
  narrators: any[];
  total: number;
  page: number;
  totalPages: number;
}>> {
  const startTime = performance.now();

  try {
    // Input validation
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      const error = createServerActionError(
        'validation',
        'Search query is required',
        'Please enter a search term.',
        false,
        'EMPTY_SEARCH_QUERY'
      );
      return {
        success: false,
        error,
        timestamp: new Date().toISOString()
      };
    }

    if (page < 1 || limit < 1 || limit > 100) {
      const error = createServerActionError(
        'validation',
        'Invalid pagination parameters',
        'Invalid page or limit parameters.',
        false,
        'INVALID_PAGINATION'
      );
      return {
        success: false,
        error,
        timestamp: new Date().toISOString()
      };
    }

    const supabase = await executeWithRetry(
      () => Promise.resolve(createSupabaseAdminClient()),
      { maxRetries: 2 },
      'Supabase Client Creation'
    );

    // Build query with filters
    let queryBuilder = supabase
      .from('narrator')
      .select('*', { count: 'exact' })
      .ilike('name_arabic', `%${query.trim()}%`);

    if (filters.credibility) {
      queryBuilder = queryBuilder.eq('credibility', filters.credibility);
    }
    if (filters.region) {
      queryBuilder = queryBuilder.ilike('region', `%${filters.region}%`);
    }
    if (filters.birth_year_min) {
      queryBuilder = queryBuilder.gte('birth_year', filters.birth_year_min);
    }
    if (filters.birth_year_max) {
      queryBuilder = queryBuilder.lte('birth_year', filters.birth_year_max);
    }

    // Execute query with pagination
    const { data, count, error } = await executeWithTimeout(
      () => queryBuilder
        .order('name_arabic')
        .range((page - 1) * limit, page * limit - 1),
      10000,
      'Narrator Search Query'
    );

    if (error) {
      throw createServerActionError(
        'database',
        `Database query failed: ${error.message}`,
        'Search failed. Please try again.',
        true,
        'DATABASE_QUERY_ERROR',
        { query, filters, error: error.message }
      );
    }

    const processingTime = performance.now() - startTime;
    const totalPages = Math.ceil((count || 0) / limit);

    return {
      success: true,
      data: {
        narrators: data || [],
        total: count || 0,
        page,
        totalPages
      },
      timestamp: new Date().toISOString(),
      duration: Math.round(processingTime)
    };

  } catch (error: any) {
    const processingTime = performance.now() - startTime;
    
    const serverActionError = error.type ? error as ServerActionError : createServerActionError(
      'processing',
      error.message || 'Unknown error during narrator search',
      'Search failed. Please try again.',
      true,
      'SEARCH_ERROR',
      { query, filters, originalError: error.message }
    );

    logServerActionError(serverActionError, 'searchNarratorsWithFilters', { 
      query,
      filters,
      page,
      limit,
      processingTime: Math.round(processingTime)
    });

    return {
      success: false,
      error: serverActionError,
      timestamp: new Date().toISOString(),
      duration: Math.round(processingTime)
    };
  }
}

/**
 * Get narrator opinions with enhanced error handling
 */
export async function getNarratorOpinions(narratorId: string): Promise<ServerActionResult<any[]>> {
  const startTime = performance.now();

  try {
    console.log('[INFO] [' + new Date().toISOString() + '] Fetching opinions for narrator ID:', narratorId);

    // Input validation
    if (!narratorId || typeof narratorId !== 'string') {
      const error = createServerActionError(
        'validation',
        'Invalid narrator ID',
        'Invalid narrator identifier.',
        false,
        'INVALID_NARRATOR_ID'
      );
      return {
        success: false,
        error,
        timestamp: new Date().toISOString()
      };
    }

    const supabase = await executeWithRetry(
      () => Promise.resolve(createSupabaseAdminClient()),
      { maxRetries: 2 },
      'Supabase Client Creation'
    );

    const { data, error } = await executeWithTimeout(
      () => supabase
        .from('opinion')
        .select(`
          *,
          narrator:narrator_id (
            name_arabic,
            credibility
          )
        `)
        .eq('narrator_id', narratorId)
        .order('created_at', { ascending: false }),
      8000,
      'Opinion Query'
    );

    if (error) {
      throw createServerActionError(
        'database',
        `Failed to fetch opinions: ${error.message}`,
        'Unable to load opinions. Please try again.',
        true,
        'OPINION_FETCH_ERROR',
        { narratorId, error: error.message }
      );
    }

    const processingTime = performance.now() - startTime;
    console.log('[INFO] [' + new Date().toISOString() + '] Fetched', data?.length || 0, 'opinions for narrator', narratorId);

    return {
      success: true,
      data: data || [],
      timestamp: new Date().toISOString(),
      duration: Math.round(processingTime)
    };

  } catch (error: any) {
    const processingTime = performance.now() - startTime;
    
    const serverActionError = error.type ? error as ServerActionError : createServerActionError(
      'processing',
      error.message || 'Unknown error fetching opinions',
      'Failed to load opinions. Please try again.',
      true,
      'OPINION_ERROR',
      { narratorId, originalError: error.message }
    );

    logServerActionError(serverActionError, 'getNarratorOpinions', { 
      narratorId,
      processingTime: Math.round(processingTime)
    });

    return {
      success: false,
      error: serverActionError,
      timestamp: new Date().toISOString(),
      duration: Math.round(processingTime)
    };
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
 * Simple search narrators by name or transliteration (for basic use cases)
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

/**
 * Save search to database for search history
 */
async function saveSearchToDatabase(userId: string, searchQuery: string, hasResults: boolean): Promise<void> {
  try {
    const supabase = await createSupabaseAdminClient();
    
    const { error } = await supabase
      .from('search')
      .insert({
        user_id: userId,
        query: searchQuery,
        has_results: hasResults,
        searched_at: new Date().toISOString()
      });

    if (error) {
      console.error(`[ERROR] [${new Date().toISOString()}] Failed to save search to database:`, error);
      // Don't throw error - search history is not critical
    } else {
      console.log(`[INFO] [${new Date().toISOString()}] Search saved to database: "${searchQuery}"`);
    }
  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error saving search to database:`, error);
    // Don't throw error - search history is not critical
  }
}

/**
 * Alias for getNarratorOpinions to maintain compatibility with existing imports
 */
export async function fetchNarratorOpinions(narratorId: string): Promise<any[]> {
  console.log(`[INFO] [${new Date().toISOString()}] Fetching opinions for narrator (alias): ${narratorId}`);
  
  try {
    const result = await getNarratorOpinions(narratorId);
    
    if (result.success) {
      return result.data || [];
    } else {
      console.error(`[ERROR] [${new Date().toISOString()}] Error fetching opinions:`, result.error);
      return [];
    }
  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error in fetchNarratorOpinions:`, error);
    return [];
  }
} 