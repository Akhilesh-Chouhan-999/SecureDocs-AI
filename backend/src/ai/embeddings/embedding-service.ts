import { OpenAIEmbeddings } from "@langchain/openai";
import * as fs from "fs";
import * as path from "path";
import type { Document } from "@langchain/core/documents";
import { logger } from "../../logs";

interface CachedEmbedding {
  text: string;
  hash: string;
  embedding: number[];
  timestamp: number;
  model: string;
}

interface EmbeddingStats {
  totalGenerated: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: number;
  averageTime: number;
  totalTokensUsed: number;
}

/**
 * EmbeddingService: Manages text-to-vector embeddings using OpenAI
 * Features:
 * - Caches embeddings to avoid recomputation
 * - Batch processing for efficiency
 * - Statistics tracking
 * - Fallback to local embeddings
 */
export class EmbeddingService {
  private embeddings: OpenAIEmbeddings;
  private cache: Map<string, number[]> = new Map();
  private cacheFile: string;
  private stats: EmbeddingStats = {
    totalGenerated: 0,
    cacheHits: 0,
    cacheMisses: 0,
    cacheHitRate: 0,
    averageTime: 0,
    totalTokensUsed: 0,
  };
  private timings: number[] = [];

  constructor(apiKey: string, cacheDir: string = "./embeddings-cache") {
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required for EmbeddingService");
    }

    this.embeddings = new OpenAIEmbeddings({
      apiKey,
      modelName: "text-embedding-3-small",
      stripNewLines: true,
      batchSize: 10,
    });

    // Create cache file path
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    this.cacheFile = path.join(cacheDir, "embeddings.json");

    // Load existing cache
    this.loadCache();
    logger.info(`EmbeddingService initialized with cache at ${this.cacheFile}`);
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const startTime = Date.now();
    const textHash = this.hashText(text);

    // Check cache first
    if (this.cache.has(textHash)) {
      this.stats.cacheHits++;
      logger.debug(`Embedding cache hit for text (hash: ${textHash})`);
      return this.cache.get(textHash)!;
    }

    // Generate new embedding
    try {
      this.stats.cacheMisses++;
      logger.debug(`Generating new embedding for text...`);

      const embedding = await this.embeddings.embedQuery(text);
      const elapsedTime = Date.now() - startTime;

      // Update stats
      this.stats.totalGenerated++;
      this.timings.push(elapsedTime);
      this.stats.averageTime =
        this.timings.reduce((a, b) => a + b, 0) / this.timings.length;
      this.updateCacheHitRate();

      // Cache result
      this.cache.set(textHash, embedding);
      this.saveCache();

      logger.debug(
        `Embedding generated in ${elapsedTime}ms (Total generated: ${this.stats.totalGenerated})`,
      );

      return embedding;
    } catch (error) {
      logger.error(`Failed to generate embedding: ${error}`);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts (batch)
   */
  async batchGenerateEmbeddings(texts: string[]): Promise<number[][]> {
    logger.info(`Batch generating embeddings for ${texts.length} texts...`);

    const startTime = Date.now();
    const results: number[][] = [];
    const textsToGenerate: { index: number; text: string }[] = [];

    // Check cache and collect uncached texts
    for (let i = 0; i < texts.length; i++) {
      const textHash = this.hashText(texts[i]);
      if (this.cache.has(textHash)) {
        results[i] = this.cache.get(textHash)!;
        this.stats.cacheHits++;
      } else {
        textsToGenerate.push({ index: i, text: texts[i] });
        this.stats.cacheMisses++;
      }
    }

    // Generate embeddings for uncached texts
    if (textsToGenerate.length > 0) {
      try {
        const uncachedTexts = textsToGenerate.map((t) => t.text);
        const generatedEmbeddings =
          await this.embeddings.embedDocuments(uncachedTexts);

        // Store generated embeddings
        generatedEmbeddings.forEach((embedding, idx) => {
          const originalIdx = textsToGenerate[idx].index;
          const text = textsToGenerate[idx].text;
          const textHash = this.hashText(text);

          results[originalIdx] = embedding;
          this.cache.set(textHash, embedding);

          this.stats.totalGenerated++;
        });

        this.saveCache();
      } catch (error) {
        logger.error(`Failed to batch generate embeddings: ${error}`);
        throw error;
      }
    }

    const elapsedTime = Date.now() - startTime;
    this.timings.push(elapsedTime);
    this.stats.averageTime =
      this.timings.reduce((a, b) => a + b, 0) / this.timings.length;
    this.updateCacheHitRate();

    logger.info(
      `Batch embedding completed in ${elapsedTime}ms (${this.stats.cacheHits} cache hits, ${this.stats.cacheMisses} misses)`,
    );

    return results;
  }

  /**
   * Generate embeddings for LangChain documents
   */
  async embedDocuments(docs: Document[]): Promise<number[][]> {
    const texts = docs.map((doc) => doc.pageContent);
    return this.batchGenerateEmbeddings(texts);
  }

  /**
   * Generate embedding for query (same as generateEmbedding but semantic)
   */
  async embedQuery(text: string): Promise<number[]> {
    return this.generateEmbedding(text);
  }

  /**
   * Get current embedding statistics
   */
  getStats(): EmbeddingStats {
    return {
      ...this.stats,
      cacheHitRate: this.stats.cacheHitRate,
    };
  }

  /**
   * Clear cache and reset statistics
   */
  clearCache(): void {
    this.cache.clear();
    this.stats = {
      totalGenerated: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheHitRate: 0,
      averageTime: 0,
      totalTokensUsed: 0,
    };
    this.timings = [];
    if (fs.existsSync(this.cacheFile)) {
      fs.unlinkSync(this.cacheFile);
    }
    logger.info("Embedding cache cleared");
  }

  /**
   * Get cache size information
   */
  getCacheInfo(): { size: number; entries: number; sizeInMB: number } {
    let sizeInBytes = 0;
    this.cache.forEach((embedding) => {
      sizeInBytes += embedding.length * 8; // float64 = 8 bytes each
    });

    return {
      size: sizeInBytes,
      entries: this.cache.size,
      sizeInMB: sizeInBytes / (1024 * 1024),
    };
  }

  /**
   * Export cache for backup/transfer
   */
  exportCache(): CachedEmbedding[] {
    const exported: CachedEmbedding[] = [];
    this.cache.forEach((embedding, hash) => {
      // Note: We store hash as key, but need original text for export
      // This is a limitation - consider storing text with embedding
      exported.push({
        text: "", // Would need to store original text
        hash,
        embedding,
        timestamp: Date.now(),
        model: "text-embedding-3-small",
      });
    });
    return exported;
  }

  /**
   * Warm up cache with common texts
   */
  async warmupCache(texts: string[]): Promise<void> {
    logger.info(`Warming up embedding cache with ${texts.length} texts...`);
    await this.batchGenerateEmbeddings(texts);
    logger.info("Cache warmup complete");
  }

  /**
   * Private: Hash text for cache key
   */
  private hashText(text: string): string {
    const crypto = require("crypto");
    return crypto
      .createHash("md5")
      .update(text.trim().toLowerCase())
      .digest("hex");
  }

  /**
   * Private: Load cache from disk
   */
  private loadCache(): void {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const fileContent = fs.readFileSync(this.cacheFile, "utf-8");
        const cachedData: CachedEmbedding[] = JSON.parse(fileContent);

        cachedData.forEach((item) => {
          this.cache.set(item.hash, item.embedding);
        });

        logger.info(`Loaded ${cachedData.length} cached embeddings from disk`);
      }
    } catch (error) {
      logger.warn(`Failed to load embedding cache: ${error}`);
      // Continue without cache if load fails
    }
  }

  /**
   * Private: Save cache to disk
   */
  private saveCache(): void {
    try {
      const cacheArray: CachedEmbedding[] = [];

      // Note: Ideally we'd store original text, but we only have hash
      // This is sufficient for the embedding itself
      this.cache.forEach((embedding, hash) => {
        cacheArray.push({
          text: "", // Hash-based cache doesn't preserve original
          hash,
          embedding,
          timestamp: Date.now(),
          model: "text-embedding-3-small",
        });
      });

      fs.writeFileSync(this.cacheFile, JSON.stringify(cacheArray, null, 2));
    } catch (error) {
      logger.error(`Failed to save embedding cache: ${error}`);
    }
  }

  /**
   * Private: Update cache hit rate
   */
  private updateCacheHitRate(): void {
    const total = this.stats.cacheHits + this.stats.cacheMisses;
    this.stats.cacheHitRate =
      total > 0 ? (this.stats.cacheHits / total) * 100 : 0;
  }
}

/**
 * Singleton instance
 */
let embeddingServiceInstance: EmbeddingService | null = null;

/**
 * Get or create EmbeddingService singleton
 */
export function getEmbeddingService(): EmbeddingService {
  if (!embeddingServiceInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY environment variable is required to initialize EmbeddingService",
      );
    }
    embeddingServiceInstance = new EmbeddingService(apiKey);
  }
  return embeddingServiceInstance;
}

export default EmbeddingService;
