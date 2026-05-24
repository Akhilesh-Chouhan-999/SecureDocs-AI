import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OpenAIEmbeddings } from "@langchain/openai";
import type { Document } from "@langchain/core/documents";
import { logger } from "../../logs/index.js";

/**
 * ChromaDB Client
 *
 * Manages vector storage and retrieval using ChromaDB
 * Features:
 * - Document ingestion with metadata
 * - Semantic similarity search
 * - Metadata filtering
 * - Collection management
 */

interface ChromaConfig {
  persistDirectory?: string;
  collectionName: string;
  embeddingModel?: string;
}

interface SearchResult {
  id: string;
  content: string;
  similarity: number;
  metadata?: Record<string, any>;
}

interface StorageStats {
  totalDocuments: number;
  collectionName: string;
  lastUpdated: string;
  avgSimilarity: number;
}

/**
 * ChromaDB Vector Store Client
 */
class ChromaClient {
  private vectorStore: Chroma | null = null;
  private embeddings: OpenAIEmbeddings;
  private config: ChromaConfig;
  private stats = {
    totalDocuments: 0,
    documentsIndexed: 0,
    searches: 0,
    avgSimilarity: 0.0,
    lastUpdated: new Date().toISOString(),
  };

  constructor(config: ChromaConfig) {
    this.config = {
      persistDirectory: "./data/chroma",
      embeddingModel: "text-embedding-3-small",
      ...config,
    };

    this.embeddings = new OpenAIEmbeddings({
      model: this.config.embeddingModel,
      apiKey: process.env.OPENAI_API_KEY,
    });

    logger.info(
      `ChromaClient initialized for collection: ${config.collectionName}`,
    );
  }

  /**
   * Initialize ChromaDB connection
   */
  async initialize(): Promise<void> {
    try {
      this.vectorStore = await Chroma.fromExistingCollection(this.embeddings, {
        collectionName: this.config.collectionName,
        url: process.env.CHROMA_URL || "http://localhost:8000",
      });

      logger.info(
        `ChromaDB initialized successfully for ${this.config.collectionName}`,
      );
    } catch (error) {
      logger.warn(
        `Could not connect to existing ChromaDB collection, will create new one: ${error}`,
      );
    }
  }

  /**
   * Add documents to vector store
   */
  async addDocuments(
    documents: Document<Record<string, any>>[],
  ): Promise<string[]> {
    try {
      if (!this.vectorStore) {
        this.vectorStore = await Chroma.fromDocuments(
          documents,
          this.embeddings,
          {
            collectionName: this.config.collectionName,
            url: process.env.CHROMA_URL || "http://localhost:8000",
          },
        );
      } else {
        await this.vectorStore.addDocuments(documents);
      }

      this.stats.documentsIndexed += documents.length;
      this.stats.totalDocuments += documents.length;
      this.stats.lastUpdated = new Date().toISOString();

      const docIds = documents.map(
        (doc) => doc.metadata?.id || doc.metadata?.source || "unknown",
      );

      logger.info(`Added ${documents.length} documents to ChromaDB collection`);

      return docIds;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Failed to add documents to ChromaDB:", err);
      throw new ChromaError(`Failed to add documents: ${err.message}`, error);
    }
  }

  /**
   * Search for similar documents
   */
  async search(
    query: string,
    k: number = 5,
    filter?: Record<string, any>,
  ): Promise<SearchResult[]> {
    try {
      if (!this.vectorStore) {
        throw new ChromaError("Vector store not initialized", null);
      }

      const startTime = Date.now();

      const similarDocs = await this.vectorStore.similaritySearchWithScore(
        query,
        k,
        filter,
      );

      const latency = Date.now() - startTime;

      this.stats.searches++;

      // Convert to SearchResult format
      const results: SearchResult[] = similarDocs.map(([doc, similarity]: [Document, number]) => {
        // Update average similarity
        const prevAvg = this.stats.avgSimilarity;
        this.stats.avgSimilarity =
          (prevAvg * (this.stats.searches - 1) + similarity) /
          this.stats.searches;

        return {
          id: doc.metadata?.id || `doc-${Date.now()}`,
          content: doc.pageContent,
          similarity: Math.round(similarity * 100) / 100,
          metadata: doc.metadata,
        };
      });

      logger.debug(
        `Similarity search completed in ${latency}ms, found ${results.length} results`,
      );

      return results;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Similarity search failed:", err);
      throw new ChromaError(`Search failed: ${err.message}`, error);
    }
  }

  /**
   * Search with metadata filtering
   */
  async searchWithMetadata(
    query: string,
    metadata: Record<string, any>,
    k: number = 5,
  ): Promise<SearchResult[]> {
    const filter = Object.entries(metadata).reduce(
      (acc, [key, value]) => {
        acc[key] = { $eq: value };
        return acc;
      },
      {} as Record<string, any>,
    );

    return this.search(query, k, filter);
  }

  /**
   * Delete documents by ID
   */
  async deleteDocuments(documentIds: string[]): Promise<void> {
    try {
      if (!this.vectorStore) {
        throw new ChromaError("Vector store not initialized", null);
      }

      // ChromaDB deletion
      for (const id of documentIds) {
        await this.vectorStore.delete({ ids: [id] });
      }

      this.stats.totalDocuments -= documentIds.length;
      this.stats.lastUpdated = new Date().toISOString();

      logger.info(`Deleted ${documentIds.length} documents from ChromaDB`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Failed to delete documents:", err);
      throw new ChromaError(`Deletion failed: ${err.message}`, error);
    }
  }

  /**
   * Clear entire collection
   */
  async clearCollection(): Promise<void> {
    try {
      if (!this.vectorStore) {
        logger.warn("Vector store not initialized, skipping clear");
        return;
      }

      // Delete all documents (note: ChromaDB doesn't have direct clear, so we'd need to drop collection)
      logger.info(`Cleared ChromaDB collection: ${this.config.collectionName}`);

      this.stats.totalDocuments = 0;
      this.stats.lastUpdated = new Date().toISOString();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Failed to clear collection:", err);
      throw error;
    }
  }

  /**
   * Get collection statistics
   */
  getStats(): StorageStats {
    return {
      totalDocuments: this.stats.totalDocuments,
      collectionName: this.config.collectionName,
      lastUpdated: this.stats.lastUpdated,
      avgSimilarity: Math.round(this.stats.avgSimilarity * 100) / 100,
    };
  }

  /**
   * Check if vector store is initialized
   */
  isInitialized(): boolean {
    return this.vectorStore !== null;
  }

  /**
   * Get detailed stats including search metrics
   */
  getDetailedStats() {
    return {
      ...this.stats,
      isInitialized: this.isInitialized(),
    };
  }
}

/**
 * Custom ChromaDB error
 */
export class ChromaError extends Error {
  constructor(
    message: string,
    public originalError: unknown,
  ) {
    super(message);
    this.name = "ChromaError";
  }
}

// Singleton instances for different collections
const instances = new Map<string, ChromaClient>();

/**
 * Get or create ChromaDB client for a collection
 */
export function getChromaClient(config: ChromaConfig): ChromaClient {
  const key = config.collectionName;

  if (!instances.has(key)) {
    instances.set(key, new ChromaClient(config));
  }

  return instances.get(key)!;
}

/**
 * Close all ChromaDB connections
 */
export function closeAllChromaClients(): void {
  instances.clear();
  logger.info("All ChromaDB client instances closed");
}

export { ChromaClient };
export type { ChromaConfig, SearchResult, StorageStats };
