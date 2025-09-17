'use server'

import { createSupabaseAdminClient } from '@/utils/supabase/server'
import { auth } from '@/lib/auth'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Json } from '@/types/database.types'
type SupabaseAdmin = SupabaseClient<Database>;
import type { 
  Narrator, 
  ProcessHadithResponse,
  DatabaseNarrator,
  BulkProcessingJob,
  TextSimilarityResult,
  ProcessingProgress,
  HadithTextAnalysis
} from '@/types/hadith'
import { convertDatabaseNarrator } from '@/types/hadith'
import { generateHadithAnalysisPdf } from '@/lib/pdf/hadith-report'

/**
 * Advanced Hadith Text Analysis Engine
 * Provides bulk processing, similarity detection, and enhanced Arabic text analysis
 */

/**
 * Process multiple hadith texts in bulk
 * Returns processing job ID for progress tracking
 */
export async function processBulkHadithTexts(
  hadithTexts: string[]
): Promise<{ success: boolean; jobId: string; error?: string }> {
  console.log(`[INFO] [${new Date().toISOString()}] Starting bulk hadith processing for ${hadithTexts.length} texts`);

  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        jobId: '',
        error: 'Authentication required for bulk processing.'
      };
    }

    // Validate input
    if (!hadithTexts || hadithTexts.length === 0) {
      return {
        success: false,
        jobId: '',
        error: 'No hadith texts provided for processing.'
      };
    }

    if (hadithTexts.length > 100) {
      return {
        success: false,
        jobId: '',
        error: 'Maximum 100 hadiths can be processed at once.'
      };
    }

    // Generate unique job ID
    const jobId = `bulk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`[INFO] [${new Date().toISOString()}] Created bulk processing job: ${jobId}`);

    // Process hadiths asynchronously
    processBulkHadithsAsync(jobId, hadithTexts, session.user.id);

    return {
      success: true,
      jobId
    };

  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error starting bulk processing:`, error);
    return {
      success: false,
      jobId: '',
      error: 'Failed to start bulk processing.'
    };
  }
}

/**
 * Async function to process hadiths in bulk (runs in background)
 */
async function processBulkHadithsAsync(jobId: string, hadithTexts: string[], userId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  
  try {
    console.log(`[INFO] [${new Date().toISOString()}] Processing bulk job ${jobId} for user ${userId}`);

    const results: HadithTextAnalysis[] = [];
    const totalTexts = hadithTexts.length;

    await storeProgress(jobId, userId, {
      jobId,
      processed: 0,
      total: totalTexts,
      status: 'processing',
      currentText: 'Preparing analysis...',
      timestamp: new Date().toISOString()
    }, supabase);

    for (let i = 0; i < hadithTexts.length; i++) {
      const hadithText = hadithTexts[i];
      
      // Update progress
      const progress: ProcessingProgress = {
        jobId,
        processed: i + 1,
        total: totalTexts,
        status: 'processing',
        currentText: hadithText.substring(0, 50) + '...',
        timestamp: new Date().toISOString()
      };

      // Store progress (in production, use Redis or similar)
      await storeProgress(jobId, userId, progress, supabase);

      // Process individual hadith
      const analysis = await analyzeHadithTextAdvanced(hadithText);
      results.push(analysis);

      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Final progress update
    const finalProgress: ProcessingProgress = {
      jobId,
      processed: totalTexts,
      total: totalTexts,
      status: 'completed',
      currentText: 'Processing completed',
      timestamp: new Date().toISOString(),
      results
    };

    await storeProgress(jobId, userId, finalProgress, supabase);
    
    console.log(`[INFO] [${new Date().toISOString()}] Completed bulk processing job ${jobId}`);

  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error in bulk processing job ${jobId}:`, error);
    
    // Store error progress
    const errorProgress: ProcessingProgress = {
      jobId,
      processed: 0,
      total: hadithTexts.length,
      status: 'error',
      currentText: 'Processing failed',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };

    await storeProgress(jobId, userId, errorProgress, supabase);
  }
}

/**
 * Get processing progress for a bulk job
 */
export async function getBulkProcessingProgress(jobId: string): Promise<ProcessingProgress | null> {
  try {
    // In production, retrieve from Redis or similar
    // For now, we'll use a simple file-based approach or database
    return await retrieveProgress(jobId);
  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error retrieving progress for job ${jobId}:`, error);
    return null;
  }
}

/**
 * Advanced hadith text analysis with enhanced features
 */
export async function analyzeHadithTextAdvanced(hadithText: string): Promise<HadithTextAnalysis> {
  console.log(`[INFO] [${new Date().toISOString()}] Starting advanced analysis for hadith text`);

  try {
    // Normalize and clean Arabic text
    const normalizedText = normalizeArabicTextAdvanced(hadithText);
    
    // Extract enhanced linguistic features
    const linguisticFeatures = extractLinguisticFeatures(normalizedText);
    
    // Extract narrator chain with confidence scores
    const narratorChain = extractNarratorChainAdvanced(normalizedText);
    
    // Analyze text structure and authenticity markers
    const structuralAnalysis = analyzeTextStructure(normalizedText);
    
    // Search for similar hadiths in database
    const similarTexts = await findSimilarHadiths(normalizedText);
    
    // Get narrator information from database
    const supabase = createSupabaseAdminClient();
    const narrators: Narrator[] = [];
    
    for (const narratorName of narratorChain.extractedNames) {
      const { data: narratorData } = await supabase
        .from('narrator')
        .select('*')
        .or(`name_arabic.ilike.%${narratorName}%,name_transliteration.ilike.%${narratorName}%`)
        .limit(1);
      
      if (narratorData && narratorData.length > 0) {
        narrators.push(convertDatabaseNarrator(narratorData[0]));
      }
    }

    const analysis: HadithTextAnalysis = {
      originalText: hadithText,
      normalizedText,
      linguisticFeatures,
      narratorChain,
      structuralAnalysis,
      similarTexts,
      narrators,
      confidence: calculateOverallConfidence(narratorChain, structuralAnalysis),
      timestamp: new Date().toISOString()
    };

    console.log(`[INFO] [${new Date().toISOString()}] Completed advanced analysis with confidence: ${analysis.confidence}%`);
    
    return analysis;

  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error in advanced analysis:`, error);
    throw error;
  }
}

/**
 * Find similar hadiths using text similarity algorithms
 */
export async function findSimilarHadiths(
  hadithText: string, 
  threshold: number = 0.7
): Promise<TextSimilarityResult[]> {
  console.log(`[INFO] [${new Date().toISOString()}] Finding similar hadiths with threshold: ${threshold}`);

  try {
    const normalizedText = normalizeArabicTextAdvanced(hadithText);
    const supabase = createSupabaseAdminClient();

    // Get all previous searches for similarity comparison
    const { data: searchData, error } = await supabase
      .from('search')
      .select('id, query, result_found, searched_at')
      .limit(1000)
      .order('searched_at', { ascending: false });

    if (error) {
      console.error('Error fetching search data:', error);
      return [];
    }

    const similarTexts: TextSimilarityResult[] = [];

    for (const search of searchData || []) {
      const similarity = calculateTextSimilarity(normalizedText, search.query);
      
      if (similarity >= threshold) {
        similarTexts.push({
          id: search.id.toString(),
          text: search.query,
          similarity,
          source: 'user_search',
          timestamp: search.searched_at || new Date().toISOString()
        });
      }
    }

    // Sort by similarity score
    similarTexts.sort((a, b) => b.similarity - a.similarity);
    
    console.log(`[INFO] [${new Date().toISOString()}] Found ${similarTexts.length} similar texts`);
    
    return similarTexts.slice(0, 10); // Return top 10 similar texts

  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error finding similar hadiths:`, error);
    return [];
  }
}

/**
 * Enhanced Arabic text normalization
 */
const ISNAD_MARKERS = ['حدثنا', 'حدّثنا', 'أخبرنا', 'اخبرنا', 'حدثني', 'حدّثني', 'قال', 'عن', 'سمع', 'سمعت'];
const LINEAGE_MARKERS = ['بن', 'ابن', 'بنت'];
const KUNYA_MARKERS = ['أبو', 'أبي', 'ابو'];
const TRADITIONAL_PHRASES = ['قال رسول الله', 'قال النبي', 'رضي الله عنه', 'رضي الله عنها', 'صلى الله عليه وسلم'];

function normalizeArabicTextAdvanced(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[إأٱآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractLinguisticFeatures(text: string): any {
  const normalized = text.trim();
  const arabicWords = normalized.match(/[\u0600-\u06FF]+/g) || [];
  const englishWords = normalized.match(/[a-zA-Z]+/g) || [];
  const hasIsnadMarker = new RegExp(`(?:${ISNAD_MARKERS.join('|')})`, 'u').test(normalized);
  const hasNameIndicator = new RegExp(`(?:${LINEAGE_MARKERS.concat(KUNYA_MARKERS).join('|')})`, 'u').test(normalized);

  const features = {
    length: normalized.length,
    wordCount: normalized.split(/\s+/).length,
    arabicWordCount: arabicWords.length,
    englishWordCount: englishWords.length,
    hasTraditionalMarkers: hasIsnadMarker,
    hasNarratorIndicators: hasNameIndicator,
    textComplexity: calculateTextComplexity(normalized)
  };

  return features;
}

function extractNarratorChainAdvanced(text: string): any {
  const markerConfigurations = [
    { marker: 'حدثنا', confidence: 0.9 },
    { marker: 'حدّثنا', confidence: 0.9 },
    { marker: 'أخبرنا', confidence: 0.9 },
    { marker: 'اخبرنا', confidence: 0.85 },
    { marker: 'حدثني', confidence: 0.85 },
    { marker: 'حدّثني', confidence: 0.85 },
    { marker: 'قال', confidence: 0.7 },
    { marker: 'عن', confidence: 0.6 },
    { marker: 'سمع', confidence: 0.6 },
    { marker: 'سمعت', confidence: 0.6 },
  ];

  const extractedMap = new Map<string, { confidence: number; position: number }>();

  for (const { marker, confidence } of markerConfigurations) {
    const pattern = new RegExp(`(?:^|\s)${marker}\s+([\p{Script=Arabic}\s]{2,60})`, 'gu');
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const candidate = match[1]
        .split(/[،؛.]/)[0]
        .replace(/\s{2,}/g, ' ')
        .trim();

      if (candidate.length > 1 && candidate.length < 80 && !extractedMap.has(candidate)) {
        const tokens = candidate.split(/\s+/).length;
        const adjustedConfidence = Math.min(confidence + tokens * 0.02, 0.99);
        extractedMap.set(candidate, { confidence: adjustedConfidence, position: match.index });
      }
    }
  }

  const lineagePattern = new RegExp(`(?:${LINEAGE_MARKERS.concat(KUNYA_MARKERS).join('|')})\s+[\p{Script=Arabic}]{2,40}`, 'gu');
  let fallbackMatch: RegExpExecArray | null;

  while ((fallbackMatch = lineagePattern.exec(text)) !== null) {
    const candidate = fallbackMatch[0]
      .split(/[،؛.]/)[0]
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (candidate.length > 1 && !extractedMap.has(candidate)) {
      extractedMap.set(candidate, { confidence: 0.65, position: fallbackMatch.index });
    }
  }

  const extractedNames = Array.from(extractedMap.entries()).map(([name]) => name);
  const chainLength = extractedNames.length;

  return {
    extractedNames,
    chainLength,
    hasTraditionalMarkers: ISNAD_MARKERS.some(marker => text.includes(marker)),
    confidence: chainLength > 0 ? Math.min(chainLength * 20, 100) : 0
  };
}

function analyzeTextStructure(text: string): any {
  const hasIsnad = ISNAD_MARKERS.some(marker => text.includes(marker));
  const hasFormula = TRADITIONAL_PHRASES.some(phrase => text.includes(phrase));

  return {
    hasIsnad,
    hasMatn: text.length > 50,
    structureScore: calculateStructureScore(text),
    traditionalFormula: hasFormula
  };
}

function calculateTextComplexity(text: string): number {
  const sentences = text.split(/[.!؟]/).filter(Boolean).length;
  const words = text.split(/\s+/).length;
  const average = sentences > 0 ? words / sentences : words;
  return Math.min(Math.max(average * 5, 0), 100);
}

function calculateStructureScore(text: string): number {
  let score = 0;

  if (ISNAD_MARKERS.some(marker => text.includes(marker))) score += 30;
  if (LINEAGE_MARKERS.some(marker => new RegExp(`\s${marker}\s`, 'u').test(text))) score += 20;
  if (text.includes('قال')) score += 15;
  if (TRADITIONAL_PHRASES.some(phrase => text.includes(phrase))) score += 25;
  if (text.length > 100) score += 10;

  return Math.min(score, 100);
}

/**
 * Calculate overall confidence score
 */
function calculateOverallConfidence(narratorChain: any, structuralAnalysis: any): number {
  const narratorScore = narratorChain.confidence * 0.4;
  const structureScore = structuralAnalysis.structureScore * 0.6;
  
  return Math.round(narratorScore + structureScore);
}

/**
 * Calculate text similarity using a simple algorithm
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

/**
 * Store processing progress using Supabase persistence
 */
async function storeProgress(
  jobId: string,
  userId: string,
  progress: ProcessingProgress,
  client?: SupabaseAdmin
): Promise<void> {
  const supabase = client ?? createSupabaseAdminClient();

  try {
    const { error } = await supabase
      .from('bulk_processing_job')
      .upsert({
        job_id: jobId,
        user_id: userId,
        status: progress.status,
        processed: progress.processed,
        total: progress.total,
        current_text: progress.currentText ?? null,
        error: progress.error ?? null,
        results: (progress.results as unknown as Json | null) ?? null
      });

    if (error) {
      console.error(`[ERROR] [${new Date().toISOString()}] Failed to persist progress for job ${jobId}:`, error);
      return;
    }

    console.log(`[PROGRESS] Job ${jobId}: ${progress.processed}/${progress.total} - ${progress.status}`);
  } catch (persistError) {
    console.error(`[ERROR] [${new Date().toISOString()}] Unexpected error storing progress for job ${jobId}:`, persistError);
  }
}
/**
 * Retrieve processing progress from Supabase
 */
async function retrieveProgress(jobId: string): Promise<ProcessingProgress | null> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('bulk_processing_job')
      .select('*')
      .eq('job_id', jobId)
      .maybeSingle();

    if (error) {
      console.error(`[ERROR] [${new Date().toISOString()}] Failed to load progress for job ${jobId}:`, error);
      return null;
    }

    if (!data) {
      return null;
    }

    const results = (data.results as HadithTextAnalysis[] | null) ?? undefined;

    return {
      jobId: data.job_id,
      processed: data.processed ?? 0,
      total: data.total ?? 0,
      status: data.status as ProcessingProgress['status'],
      currentText: data.current_text ?? undefined,
      timestamp: data.updated_at ?? data.created_at ?? new Date().toISOString(),
      results,
      error: data.error ?? undefined
    };
  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Unexpected error retrieving progress for job ${jobId}:`, error);
    return null;
  }
}
/**
 * Export hadith analysis results to various formats
 */
export async function exportAnalysisResults(
  analyses: HadithTextAnalysis[],
  format: 'json' | 'csv' | 'pdf' = 'json'
): Promise<{ success: boolean; data?: string; error?: string; contentType?: string; filename?: string }> {
  try {
    console.log(`[INFO] [${new Date().toISOString()}] Exporting ${analyses.length} analyses to ${format}`);

    switch (format) {
      case 'json':
        return {
          success: true,
          data: JSON.stringify(analyses, null, 2),
          contentType: 'application/json',
          filename: `hadith-analysis-${Date.now()}.json`
        };
      
      case 'csv':
        const csvData = convertAnalysesToCSV(analyses);
        return {
          success: true,
          data: csvData,
          contentType: 'text/csv',
          filename: `hadith-analysis-${Date.now()}.csv`
        };
      
      case 'pdf': {
        const buffer = await generateHadithAnalysisPdf(analyses);
        return {
          success: true,
          data: buffer.toString('base64'),
          contentType: 'application/pdf',
          filename: `hadith-analysis-${Date.now()}.pdf`
        };
      }
      
      default:
        return {
          success: false,
          error: 'Unsupported export format'
        };
    }
  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error exporting results:`, error);
    return {
      success: false,
      error: 'Failed to export analysis results'
    };
  }
}

/**
 * Convert analyses to CSV format
 */
function convertAnalysesToCSV(analyses: HadithTextAnalysis[]): string {
  const headers = [
    'Text',
    'Word Count',
    'Arabic Words',
    'English Words',
    'Narrator Count',
    'Confidence',
    'Has Isnad',
    'Structure Score',
    'Timestamp'
  ];

  const rows = analyses.map(analysis => [
    `"${analysis.originalText.replace(/"/g, '""').substring(0, 100)}..."`,
    analysis.linguisticFeatures.wordCount,
    analysis.linguisticFeatures.arabicWordCount,
    analysis.linguisticFeatures.englishWordCount,
    analysis.narratorChain.chainLength,
    analysis.confidence,
    analysis.structuralAnalysis.hasIsnad,
    analysis.structuralAnalysis.structureScore,
    analysis.timestamp
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
} 





