'use server'

import { createSupabaseAdminClient } from '@/utils/supabase/server'
import { auth } from '@/lib/auth'
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
  const supabase = await createSupabaseAdminClient();
  
  try {
    console.log(`[INFO] [${new Date().toISOString()}] Processing bulk job ${jobId} for user ${userId}`);

    const results: HadithTextAnalysis[] = [];
    const totalTexts = hadithTexts.length;
    
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
      await storeProgress(jobId, progress);

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

    await storeProgress(jobId, finalProgress);
    
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

    await storeProgress(jobId, errorProgress);
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
    const supabase = await createSupabaseAdminClient();
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
    const supabase = await createSupabaseAdminClient();

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
          timestamp: search.searched_at
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
function normalizeArabicTextAdvanced(text: string): string {
  let normalized = text;
  
  // Remove diacritics (tashkeel)
  normalized = normalized.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
  
  // Normalize Arabic letters
  normalized = normalized.replace(/[أإآ]/g, 'ا'); // Normalize Alif variants
  normalized = normalized.replace(/[ة]/g, 'ه');     // Normalize Taa Marbouta
  normalized = normalized.replace(/[ى]/g, 'ي');     // Normalize Alif Maqsura
  
  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  // Convert to lowercase for English parts
  normalized = normalized.toLowerCase();
  
  return normalized;
}

/**
 * Extract linguistic features from hadith text
 */
function extractLinguisticFeatures(text: string): any {
  const features = {
    length: text.length,
    wordCount: text.split(/\s+/).length,
    arabicWordCount: (text.match(/[\u0600-\u06FF]+/g) || []).length,
    englishWordCount: (text.match(/[a-zA-Z]+/g) || []).length,
    hasTraditionalMarkers: /حدثنا|أخبرنا|عن|قال/.test(text),
    hasNarratorIndicators: /أبو|بن|الحسن|الحسين/.test(text),
    textComplexity: calculateTextComplexity(text)
  };
  
  return features;
}

/**
 * Extract narrator chain with enhanced analysis
 */
function extractNarratorChainAdvanced(text: string): any {
  const narratorMarkers = ['حدثنا', 'أخبرنا', 'عن', 'قال'];
  const namePatterns = /أبو\s+\w+|بن\s+\w+|[أ-ي]+\s+الحسن|[أ-ي]+\s+الحسين/g;
  
  const extractedNames = [];
  const matches = text.match(namePatterns) || [];
  
  for (const match of matches) {
    extractedNames.push(match.trim());
  }
  
  return {
    extractedNames: [...new Set(extractedNames)], // Remove duplicates
    chainLength: extractedNames.length,
    hasTraditionalMarkers: narratorMarkers.some(marker => text.includes(marker)),
    confidence: extractedNames.length > 0 ? Math.min(extractedNames.length * 20, 100) : 0
  };
}

/**
 * Analyze text structure for authenticity markers
 */
function analyzeTextStructure(text: string): any {
  return {
    hasIsnad: /حدثنا|أخبرنا/.test(text),
    hasMatn: text.length > 50, // Simplified check for hadith content
    structureScore: calculateStructureScore(text),
    traditionalFormula: /قال رسول الله|صلى الله عليه وسلم/.test(text)
  };
}

/**
 * Calculate text complexity score
 */
function calculateTextComplexity(text: string): number {
  const sentences = text.split(/[.!?]/).length;
  const words = text.split(/\s+/).length;
  const avgWordsPerSentence = words / sentences;
  
  // Simple complexity formula
  return Math.min(avgWordsPerSentence * 5, 100);
}

/**
 * Calculate text structure score
 */
function calculateStructureScore(text: string): number {
  let score = 0;
  
  if (/حدثنا|أخبرنا/.test(text)) score += 30;
  if (/عن/.test(text)) score += 20;
  if (/قال/.test(text)) score += 15;
  if (/صلى الله عليه وسلم/.test(text)) score += 25;
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
 * Store processing progress (simplified implementation)
 */
async function storeProgress(jobId: string, progress: ProcessingProgress): Promise<void> {
  // In production, use Redis or similar for real-time progress
  // For now, we'll log the progress
  console.log(`[PROGRESS] Job ${jobId}: ${progress.processed}/${progress.total} - ${progress.status}`);
}

/**
 * Retrieve processing progress (simplified implementation)
 */
async function retrieveProgress(jobId: string): Promise<ProcessingProgress | null> {
  // In production, retrieve from Redis or similar
  // For now, return a mock progress
  return null;
}

/**
 * Export hadith analysis results to various formats
 */
export async function exportAnalysisResults(
  analyses: HadithTextAnalysis[],
  format: 'json' | 'csv' | 'pdf' = 'json'
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    console.log(`[INFO] [${new Date().toISOString()}] Exporting ${analyses.length} analyses to ${format}`);

    switch (format) {
      case 'json':
        return {
          success: true,
          data: JSON.stringify(analyses, null, 2)
        };
      
      case 'csv':
        const csvData = convertAnalysesToCSV(analyses);
        return {
          success: true,
          data: csvData
        };
      
      case 'pdf':
        // PDF generation would require additional libraries
        return {
          success: false,
          error: 'PDF export not yet implemented'
        };
      
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