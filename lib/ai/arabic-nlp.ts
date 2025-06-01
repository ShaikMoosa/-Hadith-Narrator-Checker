/**
 * Advanced Arabic NLP Engine for Hadith Analysis
 * Uses Hugging Face Transformers for narrator recognition and text processing
 */

import { pipeline, env } from '@xenova/transformers';
import cosineSimilarity from 'cosine-similarity';

// Configure transformer.js environment for browser compatibility
env.allowRemoteModels = true;
env.allowLocalModels = false;

interface NarratorEntity {
  name: string;
  confidence: number;
  startPosition: number;
  endPosition: number;
  type: 'narrator' | 'companion' | 'scholar' | 'uncertain';
}

interface ArabicTextAnalysis {
  originalText: string;
  normalizedText: string;
  detectedNarrators: NarratorEntity[];
  confidence: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  language: 'arabic' | 'mixed' | 'english';
  readabilityScore: number;
  keyTerms: string[];
}

interface SemanticSimilarityResult {
  similarity: number;
  embedding1: number[];
  embedding2: number[];
  processingTime: number;
}

class ArabicNLPEngine {
  private nerPipeline: any = null;
  private embeddingPipeline: any = null;
  private classificationPipeline: any = null;
  private initialized = false;

  /**
   * Initialize all AI models for Arabic text processing
   */
  async initialize(): Promise<void> {
    try {
      console.log('[AI] Initializing Arabic NLP engine...');
      
      // Load multilingual BERT model for NER (Named Entity Recognition)
      this.nerPipeline = await pipeline(
        'token-classification',
        'Xenova/bert-base-multilingual-cased',
        { quantized: true }
      );

      // Load sentence transformer for embeddings
      this.embeddingPipeline = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2',
        { quantized: true }
      );

      // Load text classification model
      this.classificationPipeline = await pipeline(
        'text-classification',
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
        { quantized: true }
      );

      this.initialized = true;
      console.log('[AI] Arabic NLP engine initialized successfully');
    } catch (error) {
      console.error('[AI] Failed to initialize NLP engine:', error);
      throw new Error('Failed to initialize AI models');
    }
  }

  /**
   * Ensure models are loaded before processing
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Normalize Arabic text for better processing
   */
  normalizeArabicText(text: string): string {
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
   * Extract narrator names using advanced NER
   */
  async extractNarrators(text: string): Promise<NarratorEntity[]> {
    await this.ensureInitialized();
    
    try {
      const normalizedText = this.normalizeArabicText(text);
      const entities = await this.nerPipeline(normalizedText);
      
      const narrators: NarratorEntity[] = [];
      
      // Common Arabic narrator patterns
      const narratorPatterns = [
        /حدثنا\s+([^،.]+)/g,           // "narrated to us"
        /أخبرنا\s+([^،.]+)/g,          // "informed us"
        /قال\s+([^،.]+)/g,            // "said"
        /عن\s+([^،.]+)/g,             // "from/about"
        /بن\s+([^،.]+)/g,             // "son of"
        /أبو\s+([^،.]+)/g,            // "father of"
        /أم\s+([^،.]+)/g,             // "mother of"
      ];

      // Extract using regex patterns
      for (const pattern of narratorPatterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
          const name = match[1].trim();
          if (name.length > 2 && name.length < 50) {
            narrators.push({
              name: name,
              confidence: 0.7, // Base confidence for pattern matching
              startPosition: match.index,
              endPosition: match.index + match[0].length,
              type: this.classifyNarratorType(name)
            });
          }
        }
      }

      // Enhance with NER results
      if (Array.isArray(entities)) {
        entities.forEach((entity: any) => {
          if (entity.entity?.includes('PER') && entity.score > 0.5) {
            narrators.push({
              name: entity.word,
              confidence: entity.score,
              startPosition: entity.start || 0,
              endPosition: entity.end || 0,
              type: 'uncertain'
            });
          }
        });
      }

      // Remove duplicates and sort by confidence
      const uniqueNarrators = this.removeDuplicateNarrators(narrators);
      return uniqueNarrators.sort((a, b) => b.confidence - a.confidence);

    } catch (error) {
      console.error('[AI] Error extracting narrators:', error);
      return [];
    }
  }

  /**
   * Classify narrator type based on name patterns
   */
  private classifyNarratorType(name: string): NarratorEntity['type'] {
    const companions = ['أبو بكر', 'عمر', 'عثمان', 'علي', 'عائشة', 'فاطمة'];
    const scholarPatterns = ['الإمام', 'الشيخ', 'العلامة', 'الفقيه'];
    
    if (companions.some(comp => name.includes(comp))) {
      return 'companion';
    }
    
    if (scholarPatterns.some(pattern => name.includes(pattern))) {
      return 'scholar';
    }
    
    return 'narrator';
  }

  /**
   * Remove duplicate narrator entries
   */
  private removeDuplicateNarrators(narrators: NarratorEntity[]): NarratorEntity[] {
    const seen = new Set<string>();
    return narrators.filter(narrator => {
      const key = narrator.name.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Generate text embeddings for semantic similarity
   */
  async generateEmbedding(text: string): Promise<number[]> {
    await this.ensureInitialized();
    
    try {
      const normalizedText = this.normalizeArabicText(text);
      const result = await this.embeddingPipeline(normalizedText, {
        pooling: 'mean',
        normalize: true
      });
      
      // Convert tensor to array if needed
      return Array.isArray(result.data) ? result.data : Array.from(result.data);
    } catch (error) {
      console.error('[AI] Error generating embedding:', error);
      throw new Error('Failed to generate text embedding');
    }
  }

  /**
   * Calculate semantic similarity between two texts
   */
  async calculateSemanticSimilarity(
    text1: string, 
    text2: string
  ): Promise<SemanticSimilarityResult> {
    const startTime = performance.now();
    
    try {
      const [embedding1, embedding2] = await Promise.all([
        this.generateEmbedding(text1),
        this.generateEmbedding(text2)
      ]);

      const similarity = cosineSimilarity(embedding1, embedding2);
      const processingTime = performance.now() - startTime;

      return {
        similarity: Number(similarity.toFixed(4)),
        embedding1,
        embedding2,
        processingTime: Math.round(processingTime)
      };
    } catch (error) {
      console.error('[AI] Error calculating semantic similarity:', error);
      throw new Error('Failed to calculate semantic similarity');
    }
  }

  /**
   * Perform comprehensive Arabic text analysis
   */
  async analyzeText(text: string): Promise<ArabicTextAnalysis> {
    await this.ensureInitialized();
    
    try {
      const startTime = performance.now();
      
      // Parallel processing for efficiency
      const [narrators, sentiment, keyTerms] = await Promise.all([
        this.extractNarrators(text),
        this.analyzeSentiment(text),
        this.extractKeyTerms(text)
      ]);

      const normalizedText = this.normalizeArabicText(text);
      const language = this.detectLanguage(text);
      const readabilityScore = this.calculateReadabilityScore(text);
      
      // Calculate overall confidence based on narrator extraction
      const confidence = narrators.length > 0 
        ? narrators.reduce((sum, n) => sum + n.confidence, 0) / narrators.length
        : 0.5;

      const processingTime = performance.now() - startTime;
      console.log(`[AI] Text analysis completed in ${Math.round(processingTime)}ms`);

      return {
        originalText: text,
        normalizedText,
        detectedNarrators: narrators,
        confidence: Number(confidence.toFixed(3)),
        sentiment,
        language,
        readabilityScore,
        keyTerms
      };
    } catch (error) {
      console.error('[AI] Error analyzing text:', error);
      throw new Error('Failed to analyze text');
    }
  }

  /**
   * Analyze text sentiment
   */
  private async analyzeSentiment(text: string): Promise<'positive' | 'neutral' | 'negative'> {
    try {
      const result = await this.classificationPipeline(text);
      if (Array.isArray(result) && result.length > 0) {
        const topResult = result[0];
        if (topResult.label?.toLowerCase().includes('positive')) return 'positive';
        if (topResult.label?.toLowerCase().includes('negative')) return 'negative';
      }
      return 'neutral';
    } catch (error) {
      console.error('[AI] Error analyzing sentiment:', error);
      return 'neutral';
    }
  }

  /**
   * Extract key terms from text
   */
  private extractKeyTerms(text: string): string[] {
    const normalizedText = this.normalizeArabicText(text);
    const words = normalizedText.split(/\s+/);
    
    // Islamic and hadith-specific terms
    const islamicTerms = [
      'حديث', 'سنة', 'رسول', 'الله', 'صلى', 'عليه', 'وسلم',
      'رضي', 'عنه', 'عنها', 'قال', 'قالت', 'حدثنا', 'أخبرنا'
    ];
    
    const keyTerms = words.filter(word => 
      word.length > 2 && (
        islamicTerms.includes(word) ||
        word.match(/^[أ-ي]+$/) // Arabic letters only
      )
    );
    
    // Return unique terms, limited to top 10
    return [...new Set(keyTerms)].slice(0, 10);
  }

  /**
   * Detect text language
   */
  private detectLanguage(text: string): 'arabic' | 'mixed' | 'english' {
    const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
    const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
    const totalChars = arabicChars + englishChars;
    
    if (totalChars === 0) return 'mixed';
    
    const arabicRatio = arabicChars / totalChars;
    
    if (arabicRatio > 0.7) return 'arabic';
    if (arabicRatio < 0.3) return 'english';
    return 'mixed';
  }

  /**
   * Calculate readability score (simplified)
   */
  private calculateReadabilityScore(text: string): number {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?؟]/g).length;
    const avgWordsPerSentence = words / Math.max(sentences, 1);
    
    // Simplified readability: lower score = easier to read
    return Math.min(100, Math.max(0, 100 - avgWordsPerSentence * 2));
  }
}

// Singleton instance
let nlpEngine: ArabicNLPEngine | null = null;

/**
 * Get or create the Arabic NLP engine instance
 */
export async function getArabicNLPEngine(): Promise<ArabicNLPEngine> {
  if (!nlpEngine) {
    nlpEngine = new ArabicNLPEngine();
    await nlpEngine.initialize();
  }
  return nlpEngine;
}

// Export types and main class
export type {
  NarratorEntity,
  ArabicTextAnalysis,
  SemanticSimilarityResult
};

export { ArabicNLPEngine }; 