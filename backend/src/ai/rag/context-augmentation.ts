import { getSimilaritySearchService } from "../vector-db/similarity-search.js";
import { logger } from "../../logs/index.js";

/**
 * Context Augmentation Service
 *
 * Augments LLM prompts with relevant context from vector store
 * Features:
 * - Dynamic context retrieval
 * - Context ranking and filtering
 * - Token-aware truncation
 * - Metadata enrichment
 */

interface ContextAugmentationOptions {
  maxContextTokens?: number;
  contextCount?: number;
  threshold?: number;
  includeMetadata?: boolean;
  rankingStrategy?: "similarity" | "relevance" | "hybrid";
}

interface AugmentedContext {
  systemContext: string;
  relevantDocuments: Array<{
    id: string;
    content: string;
    similarity: number;
    rank: number;
    metadata?: Record<string, any>;
  }>;
  tokenCount: number;
  augmentationScore: number;
}

interface ContextStats {
  augmentations: number;
  avgContextLength: number;
  avgDocumentsAdded: number;
  avgSimilarityUsed: number;
}

/**
 * Context Augmentation Service
 */
class ContextAugmentationService {

  private searchService: any;
  private stats = {
    augmentations: 0,
    avgContextLength: 0,
    avgDocumentsAdded: 0,
    avgSimilarityUsed: 0,
  };

  private contextLengths: number[] = [];
  private docCountList: number[] = [];
  private similarityList: number[] = [];

  constructor(collectionName?: string) {
    this.searchService = getSimilaritySearchService(collectionName);
    logger.info("ContextAugmentationService initialized");
  }

  /**
   * Augment prompt with context from vector store
   */
  async augmentContext(
    query: string,
    systemPrompt?: string,
    options: ContextAugmentationOptions = {},
  ): Promise<AugmentedContext> {
    const {
      maxContextTokens = 2000,
      contextCount = 5,
      threshold = 0.5,
      includeMetadata = true,
      rankingStrategy = "hybrid",
    } = options;

    try {
      // Search for relevant documents
      const searchResults = await this.searchService.search(query, {
        topK: contextCount,
        similarityThreshold: threshold,
      });

      if (searchResults.length === 0) {
        logger.warn("No relevant context found for query");
        return {
          systemContext: systemPrompt || "",
          relevantDocuments: [],
          tokenCount: 0,
          augmentationScore: 0,
        };
      }

      // Rank and filter results
      const rankedDocs = this.rankResults(searchResults, rankingStrategy);

      // Truncate to token limit
      const {
        documents: truncatedDocs,
        tokenCount,
        augmentationScore,
      } = this.truncateToTokenLimit(rankedDocs, maxContextTokens);

      // Build augmented system context
      const systemContext = this.buildAugmentedPrompt(
        systemPrompt || "",
        truncatedDocs,
        includeMetadata,
      );

      // Update statistics
      this.stats.augmentations++;
      this.contextLengths.push(tokenCount);
      this.docCountList.push(truncatedDocs.length);
      this.similarityList.push(
        truncatedDocs.length > 0
          ? truncatedDocs.reduce((sum, doc) => sum + doc.similarity, 0) /
              truncatedDocs.length
          : 0,
      );

      this.updateAverages();

      logger.info(
        `Context augmented with ${truncatedDocs.length} documents (${tokenCount} tokens)`,
      );

      return {
        systemContext,
        relevantDocuments: truncatedDocs,
        tokenCount,
        augmentationScore,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Context augmentation failed:", err);
      throw error;
    }
  }

  /**
   * Augment multiple queries with their contexts
   */
  async augmentMultipleQueries(
    queries: string[],
    systemPrompt?: string,
    options: ContextAugmentationOptions = {},
  ): Promise<Map<string, AugmentedContext>> {
    const results = new Map<string, AugmentedContext>();

    for (const query of queries) {
      const augmented = await this.augmentContext(query, systemPrompt, options);
      results.set(query, augmented);
    }

    return results;
  }

  /**
   * Rank search results by strategy
   */
  private rankResults(
    results: any[],
    strategy: "similarity" | "relevance" | "hybrid",
  ): any[] {
    switch (strategy) {
      case "similarity":
        return results.sort((a, b) => b.similarity - a.similarity);

      case "relevance":
        return results.sort((a, b) => b.relevanceScore - a.relevanceScore);

      case "hybrid":
      default:
        return results.sort(
          (a, b) =>
            (b.similarity + (b.relevanceScore || b.rank)) / 2 -
            (a.similarity + (a.relevanceScore || a.rank)) / 2,
        );
    }
  }

  /**
   * Truncate documents to token limit
   */
  private truncateToTokenLimit(
    documents: any[],
    maxTokens: number,
  ): {
    documents: any[];
    tokenCount: number;
    augmentationScore: number;
  } {
    let totalTokens = 0;
    const selectedDocs: any[] = [];
    const tokenEstimate = 1.3; // Rough estimate: 1 word ≈ 1.3 tokens

    for (const doc of documents) {
      const docTokens = Math.ceil(
        doc.content.split(/\s+/).length * tokenEstimate,
      );

      if (totalTokens + docTokens <= maxTokens) {
        selectedDocs.push(doc);
        totalTokens += docTokens;
      } else {
        // Try to add truncated content
        const availableTokens = maxTokens - totalTokens;
        if (availableTokens > 100) {
          const truncatedContent = doc.content
            .split(/\s+/)
            .slice(0, Math.floor(availableTokens / tokenEstimate))
            .join(" ");

          selectedDocs.push({
            ...doc,
            content: truncatedContent + "...",
          });

          totalTokens = maxTokens;
        }

        break;
      }
    }

    // Calculate augmentation score (0-100)
    const utilizationRate = totalTokens / maxTokens;
    const augmentationScore =
      (selectedDocs.length / documents.length) * 100 * utilizationRate;

    return {
      documents: selectedDocs,
      tokenCount: totalTokens,
      augmentationScore: Math.round(augmentationScore * 100) / 100,
    };
  }

  /**
   * Build augmented prompt with context
   */
  private buildAugmentedPrompt(
    systemPrompt: string,
    documents: any[],
    includeMetadata: boolean,
  ): string {
    if (documents.length === 0) {
      return systemPrompt;
    }

    let augmented = systemPrompt;

    if (augmented && !augmented.endsWith("\n")) {
      augmented += "\n";
    }

    augmented += "\n## RELEVANT CONTEXT FROM VECTOR STORE:\n";
    augmented += `(Retrieved ${documents.length} documents)\n\n`;

    documents.forEach((doc, index) => {
      augmented += `### Document ${index + 1}`;

      if (includeMetadata && doc.metadata) {
        const metaStr = Object.entries(doc.metadata)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");

        augmented += ` [${metaStr}]`;
      }

      augmented += `\n**Similarity: ${(doc.similarity * 100).toFixed(1)}%**\n`;
      augmented += `${doc.content}\n\n`;
    });

    augmented +=
      "## END CONTEXT\n\nUse the above context to inform your analysis and response.\n";

    return augmented;
  }

  /**
   * Update average statistics
   */
  private updateAverages(): void {
    if (this.contextLengths.length > 0) {
      this.stats.avgContextLength =
        this.contextLengths.reduce((a, b) => a + b, 0) /
        this.contextLengths.length;
    }

    if (this.docCountList.length > 0) {
      this.stats.avgDocumentsAdded =
        this.docCountList.reduce((a, b) => a + b, 0) / this.docCountList.length;
    }

    if (this.similarityList.length > 0) {
      this.stats.avgSimilarityUsed =
        this.similarityList.reduce((a, b) => a + b, 0) /
        this.similarityList.length;
    }
  }

  /**
   * Get augmentation statistics
   */
  getStats(): ContextStats {
    return {
      augmentations: this.stats.augmentations,
      avgContextLength: Math.round(this.stats.avgContextLength),
      avgDocumentsAdded: Math.round(this.stats.avgDocumentsAdded * 10) / 10,
      avgSimilarityUsed: Math.round(this.stats.avgSimilarityUsed * 100) / 100,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      augmentations: 0,
      avgContextLength: 0,
      avgDocumentsAdded: 0,
      avgSimilarityUsed: 0,
    };
    this.contextLengths = [];
    this.docCountList = [];
    this.similarityList = [];
    logger.info("Context augmentation statistics reset");
  }

}

// Singleton instance
let instance: ContextAugmentationService | null = null;

/**
 * Get or create context augmentation service
 */
export function getContextAugmentationService(
  collectionName?: string,
): ContextAugmentationService {
  if (!instance) {
    instance = new ContextAugmentationService(collectionName);
  }
  return instance;
}

export { ContextAugmentationService };
export type { ContextAugmentationOptions, AugmentedContext, ContextStats };
