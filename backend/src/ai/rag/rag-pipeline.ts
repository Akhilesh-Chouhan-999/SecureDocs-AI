import type { Document } from "@langchain/core/documents";
import { getChromaClient } from "../vector-db/chroma-client.js";
import { getSimilaritySearchService } from "../vector-db/similarity-search.js";
import { getContextAugmentationService } from "./context-augmentation.js";
import { getEmbeddingService } from "../embeddings/embedding-service.js";
import { logger } from "../../logs/index.js";

/**
 * RAG Pipeline
 *
 * Retrieval-Augmented Generation Pipeline
 * Orchestrates: Embedding → Storage → Retrieval → Augmentation → LLM
 *
 * Features:
 * - Document ingestion and indexing
 * - Semantic search with ranking
 * - Context augmentation for prompts
 * - Metadata enrichment
 * - Performance metrics
 */

interface RAGPipelineConfig {
  collectionName: string;
  maxContextTokens?: number;
  topK?: number;
  similarityThreshold?: number;
}

interface RAGResult {
  augmentedPrompt: string;
  retrievedDocuments: Array<{
    id: string;
    content: string;
    similarity: number;
    metadata?: Record<string, any>;
  }>;
  stats: {
    retrievalTime: number;
    augmentationTime: number;
    totalTime: number;
    relevanceScore: number;
  };
}

interface PipelineStats {
  documentsIngested: number;
  queriesProcessed: number;
  avgRetrievalTime: number;
  avgAugmentationTime: number;
  totalDocumentsInIndex: number;
}

/**
 * RAG Pipeline Orchestrator
 */
class RAGPipeline {

  private config: RAGPipelineConfig;
  private chromaClient: any;
  private searchService: any;
  private augmentationService: any;
  private embeddingService: any;
  private stats = {
    documentsIngested: 0,
    queriesProcessed: 0,
    retrievalTimes: [] as number[],
    augmentationTimes: [] as number[],
  };

  constructor(config: RAGPipelineConfig) {
    this.config = {
      maxContextTokens: 2000,
      topK: 5,
      similarityThreshold: 0.5,
      ...config,
    };

    this.chromaClient = getChromaClient({
      collectionName: config.collectionName,
    });

    this.searchService = getSimilaritySearchService(config.collectionName);
    this.augmentationService = getContextAugmentationService(
      config.collectionName,
    );
    this.embeddingService = getEmbeddingService();

    logger.info(
      `RAGPipeline initialized for collection: ${config.collectionName}`,
    );
  }

  /**
   * Initialize RAG pipeline components
   */
  async initialize(): Promise<void> {
    try {
      await this.chromaClient.initialize();
      logger.info("RAG pipeline components initialized");
    } catch (error) {
      logger.warn(
        "Could not initialize existing ChromaDB collection, will create new",
      );
    }
  }

  /**
   * Ingest documents into RAG pipeline
   */
  async ingestDocuments(
    documents: Document<Record<string, any>>[],
  ): Promise<{ success: boolean; count: number; errors?: string[] }> {
    try {
      logger.info(`Ingesting ${documents.length} documents into RAG pipeline`);

      const startTime = Date.now();

      // Add to ChromaDB
      const docIds = await this.chromaClient.addDocuments(documents);

      const ingestTime = Date.now() - startTime;

      this.stats.documentsIngested += documents.length;

      logger.info(`Ingested ${documents.length} documents in ${ingestTime}ms`);

      return {
        success: true,
        count: documents.length,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Document ingestion failed:", err);

      return {
        success: false,
        count: 0,
        errors: [err.message],
      };
    }
  }

  /**
   * Execute RAG pipeline: retrieve and augment
   */
  async retrieve(query: string, systemPrompt?: string): Promise<RAGResult> {
    const startTime = Date.now();

    try {
      // 1. Retrieve relevant documents
      const retrievalStart = Date.now();

      const searchResults = await this.searchService.search(query, {
        topK: this.config.topK,
        similarityThreshold: this.config.similarityThreshold,
      });

      const retrievalTime = Date.now() - retrievalStart;

      // 2. Augment context
      const augmentationStart = Date.now();

      const augmented = await this.augmentationService.augmentContext(
        query,
        systemPrompt,
        {
          maxContextTokens: this.config.maxContextTokens,
          contextCount: this.config.topK,
          threshold: this.config.similarityThreshold,
        },
      );

      const augmentationTime = Date.now() - augmentationStart;

      // 3. Update statistics
      this.stats.queriesProcessed++;
      this.stats.retrievalTimes.push(retrievalTime);
      this.stats.augmentationTimes.push(augmentationTime);

      const totalTime = Date.now() - startTime;

      // Calculate relevance score (0-100)
      const relevanceScore =
        searchResults.length > 0
          ? Math.round(
              (searchResults.reduce(
                (sum: number, r: any) => sum + r.similarity,
                0,
              ) /
                searchResults.length) *
                100,
            )
          : 0;

      logger.info(
        `RAG retrieval completed: ${searchResults.length} documents, ${totalTime}ms total`,
      );

      return {
        augmentedPrompt: augmented.systemContext,
        retrievedDocuments: searchResults.map((doc: any) => ({
          id: doc.id,
          content: doc.content,
          similarity: doc.similarity,
          metadata: doc.metadata,
        })),
        stats: {
          retrievalTime,
          augmentationTime,
          totalTime,
          relevanceScore,
        },
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("RAG retrieval failed:", err);
      throw error;
    }
  }

  /**
   * Query-to-augmented-prompt pipeline
   */
  async queryToAugmentedPrompt(
    userQuery: string,
    systemPrompt: string,
  ): Promise<{
    augmentedPrompt: string;
    context: RAGResult;
  }> {
    const ragResult = await this.retrieve(userQuery, systemPrompt);

    return {
      augmentedPrompt: ragResult.augmentedPrompt,
      context: ragResult,
    };
  }

  /**
   * Delete documents from RAG index
   */
  async deleteDocuments(docIds: string[]): Promise<void> {
    try {
      await this.chromaClient.deleteDocuments(docIds);
      logger.info(`Deleted ${docIds.length} documents from RAG index`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Failed to delete documents from RAG:", err);
      throw err;
    }
  }

  /**
   * Clear entire RAG index
   */
  async clear(): Promise<void> {
    try {
      await this.chromaClient.clearCollection();
      logger.info("RAG index cleared");
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Failed to clear RAG index:", err);
      throw err;
    }
  }

  /**
   * Get RAG pipeline statistics
   */
  getStats(): PipelineStats {
    return {
      documentsIngested: this.stats.documentsIngested,
      queriesProcessed: this.stats.queriesProcessed,
      avgRetrievalTime:
        this.stats.retrievalTimes.length > 0
          ? Math.round(
              this.stats.retrievalTimes.reduce((a, b) => a + b, 0) /
                this.stats.retrievalTimes.length,
            )
          : 0,
      avgAugmentationTime:
        this.stats.augmentationTimes.length > 0
          ? Math.round(
              this.stats.augmentationTimes.reduce((a, b) => a + b, 0) /
                this.stats.augmentationTimes.length,
            )
          : 0,
      totalDocumentsInIndex: this.chromaClient.getStats().totalDocuments,
    };
  }

  /**
   * Get detailed pipeline metrics
   */
  getMetrics() {
    return {
      pipeline: this.getStats(),
      chromaDB: this.chromaClient.getDetailedStats(),
      search: this.searchService.getStats(),
      augmentation: this.augmentationService.getStats(),
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    isHealthy: boolean;
    message: string;
    details: Record<string, any>;
  }> {
    try {
      const isInitialized = this.chromaClient.isInitialized();
      const stats = this.getStats();

      return {
        isHealthy: isInitialized,
        message: isInitialized
          ? "RAG pipeline is operational"
          : "RAG pipeline not fully initialized",
        details: {
          chromaDBConnected: isInitialized,
          documentsInIndex: stats.totalDocumentsInIndex,
          queriesProcessed: stats.queriesProcessed,
          avgRetrievalTime: `${stats.avgRetrievalTime}ms`,
        },
      };
    } catch (error) {
      return {
        isHealthy: false,
        message: "RAG pipeline health check failed",
        details: {
          error: String(error),
        },
      };
    }
  }

}

// Singleton instances
const instances = new Map<string, RAGPipeline>();

/**
 * Get or create RAG pipeline
 */
export function getRAGPipeline(config: RAGPipelineConfig): RAGPipeline {
  const key = config.collectionName;

  if (!instances.has(key)) {
    instances.set(key, new RAGPipeline(config));
  }

  return instances.get(key)!;
}

/**
 * Close all RAG pipelines
 */
export function closeAllRAGPipelines(): void {
  instances.clear();
  logger.info("All RAG pipeline instances closed");
}

export { RAGPipeline };
export type { RAGPipelineConfig, RAGResult, PipelineStats };
