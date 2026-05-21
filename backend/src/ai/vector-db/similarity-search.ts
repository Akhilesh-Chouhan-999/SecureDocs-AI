import { getChromaClient } from "./chroma-client.js";
import { getEmbeddingService } from "../embeddings/embedding-service.js";
import { logger } from "../../logs/index.js";

/**
 * Similarity Search Service
 *
 * Handles semantic similarity search operations
 * Features:
 * - Single query search
 * - Multi-query expansion
 * - Result ranking and filtering
 * - Relevance scoring
 */

interface SimilaritySearchOptions {
  topK?: number;
  similarityThreshold?: number;
  expandQueries?: boolean;
  metadata?: Record<string, any>;
}

interface SearchResultWithRank {
  id: string;
  content: string;
  similarity: number;
  rank: number;
  relevanceScore: number;
  metadata?: Record<string, any>;
}

interface SearchStats {
  queryCount: number;
  totalResults: number;
  avgRelevance: number;
  executionTime: number;
}

/**
 * Similarity Search Service
 */
class SimilaritySearchService {
  private collectionName: string;
  private stats = {
    queryCount: 0,
    totalResults: 0,
    avgRelevance: 0,
    executionTime: 0,
  };

  constructor(collectionName: string = "fraud_documents") {
    this.collectionName = collectionName;
    logger.info(
      `SimilaritySearchService initialized for collection: ${collectionName}`,
    );
  }

  /**
   * Perform semantic similarity search
   */
  async search(
    query: string,
    options: SimilaritySearchOptions = {},
  ): Promise<SearchResultWithRank[]> {
    const {
      topK = 5,
      similarityThreshold = 0.5,
      expandQueries = false,
      metadata,
    } = options;

    const startTime = Date.now();

    try {
      const queries = expandQueries ? this.expandQuery(query) : [query];

      const allResults = new Map<string, SearchResultWithRank>();

      // Search with each query expansion
      for (const q of queries) {
        const chromaClient = getChromaClient({
          collectionName: this.collectionName,
        });

        if (!chromaClient.isInitialized()) {
          await chromaClient.initialize();
        }

        const results = await chromaClient.search(q, topK * 2, metadata);

        // Merge and deduplicate results
        for (const result of results) {
          if (result.similarity >= similarityThreshold) {
            if (allResults.has(result.id)) {
              // Keep highest similarity score
              const existing = allResults.get(result.id)!;
              existing.similarity = Math.max(
                existing.similarity,
                result.similarity,
              );
            } else {
              allResults.set(result.id, {
                ...result,
                rank: 0,
                relevanceScore: 0,
              });
            }
          }
        }
      }

      // Sort by similarity and rank
      const rankedResults = Array.from(allResults.values())
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK)
        .map((result, index) => ({
          ...result,
          rank: index + 1,
          relevanceScore: this.calculateRelevanceScore(
            result.similarity,
            index + 1,
            topK,
          ),
        }));

      // Update statistics
      const executionTime = Date.now() - startTime;
      this.stats.queryCount++;
      this.stats.totalResults += rankedResults.length;
      this.stats.avgRelevance =
        (this.stats.avgRelevance * (this.stats.queryCount - 1) +
          (rankedResults.length > 0
            ? rankedResults.reduce((sum, r) => sum + r.relevanceScore, 0) /
              rankedResults.length
            : 0)) /
        this.stats.queryCount;
      this.stats.executionTime = executionTime;

      logger.info(
        `Similarity search completed: ${rankedResults.length} results found in ${executionTime}ms`,
      );

      return rankedResults;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Similarity search failed:", err);
      throw error;
    }
  }

  /**
   * Search for multiple queries with result aggregation
   */
  async multiSearch(
    queries: string[],
    options: SimilaritySearchOptions = {},
  ): Promise<Map<string, SearchResultWithRank[]>> {
    const results = new Map<string, SearchResultWithRank[]>();

    for (const query of queries) {
      const searchResults = await this.search(query, options);
      results.set(query, searchResults);
    }

    return results;
  }

  /**
   * Find similar documents to a given document
   */
  async findSimilarDocuments(
    documentContent: string,
    options: SimilaritySearchOptions = {},
  ): Promise<SearchResultWithRank[]> {
    return this.search(documentContent, {
      ...options,
      topK: options.topK || 10,
    });
  }

  /**
   * Hybrid search: Combine similarity with metadata filtering
   */
  async hybridSearch(
    query: string,
    filters: Record<string, any>,
    options: SimilaritySearchOptions = {},
  ): Promise<SearchResultWithRank[]> {
    return this.search(query, {
      ...options,
      metadata: filters,
    });
  }

  /**
   * Expand query with variations for better search
   */
  private expandQuery(query: string): string[] {
    const variations: string[] = [query];

    // Add common variations
    if (query.includes("fraud")) {
      variations.push(query.replace("fraud", "suspicious"));
      variations.push(query.replace("fraud", "anomaly"));
    }

    if (query.includes("income")) {
      variations.push(query.replace("income", "earnings"));
      variations.push(query.replace("income", "revenue"));
    }

    if (query.includes("document")) {
      variations.push(query.replace("document", "file"));
      variations.push(query.replace("document", "paperwork"));
    }

    return variations;
  }

  /**
   * Calculate relevance score (0-100)
   */
  private calculateRelevanceScore(
    similarity: number,
    rank: number,
    maxRank: number,
  ): number {
    // Combine similarity (70% weight) and rank (30% weight)
    const similarityScore = similarity * 100 * 0.7;
    const rankScore = (1 - rank / maxRank) * 100 * 0.3;
    return Math.round((similarityScore + rankScore) * 100) / 100;
  }

  /**
   * Get search statistics
   */
  getStats(): SearchStats {
    return {
      queryCount: this.stats.queryCount,
      totalResults: this.stats.totalResults,
      avgRelevance: Math.round(this.stats.avgRelevance * 100) / 100,
      executionTime: this.stats.executionTime,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      queryCount: 0,
      totalResults: 0,
      avgRelevance: 0,
      executionTime: 0,
    };
    logger.info("Similarity search statistics reset");
  }
}

// Singleton instances
const instances = new Map<string, SimilaritySearchService>();

/**
 * Get or create similarity search service
 */
export function getSimilaritySearchService(
  collectionName?: string,
): SimilaritySearchService {
  const key = collectionName || "fraud_documents";

  if (!instances.has(key)) {
    instances.set(key, new SimilaritySearchService(key));
  }

  return instances.get(key)!;
}

export {
  SimilaritySearchService,
  SimilaritySearchOptions,
  SearchResultWithRank,
  SearchStats,
};
