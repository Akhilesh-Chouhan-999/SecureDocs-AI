import { Redis } from "ioredis";
import env from "../../config/env.js";
import { logger } from "../../logs/index.js";

class OcrCache {

  private client: Redis | null = null;
  private readonly defaultTTL = 86400; // 24 hours

  constructor() {
    try {
      if (env.redisUrl) {
        this.client = new Redis(env.redisUrl, { lazyConnect: true });
      } else {
        this.client = new Redis({
          host: "127.0.0.1",
          port: 6379,
          lazyConnect: true,
        });
      }

      this.client.on("error", (err: Error) => {
        logger.warn("Redis OCR Cache error:", err);
      });
    } catch (err) {
      logger.error("Failed to initialize OCR Cache Redis client", err);
    }
  }

  /**
   * Generates a cache key for the OCR result
   * @param documentId Document ID
   * @returns Cache key string
   */
  private getCacheKey(documentId: string): string {
    return `ocr:result:${documentId}`;
  }

  /**
   * Retrieves an OCR result from the cache
   * @param documentId Document ID
   * @returns The parsed OCR result, or null if not found
   */
  async get(documentId: string): Promise<any | null> {
    if (!this.client) return null;

    try {
      const data = await this.client.get(this.getCacheKey(documentId));
      if (data) {
        logger.info(`OCR Cache hit for document ${documentId}`);
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      logger.warn(`Failed to retrieve OCR cache for ${documentId}`, error);
      return null;
    }
  }

  /**
   * Saves an OCR result to the cache
   * @param documentId Document ID
   * @param result The OCR output object
   * @param ttl Time-to-live in seconds (default 24h)
   */
  async set(
    documentId: string,
    result: any,
    ttl: number = this.defaultTTL,
  ): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.set(
        this.getCacheKey(documentId),
        JSON.stringify(result),
        "EX",
        ttl,
      );
      logger.info(`OCR Cache set for document ${documentId}`);
    } catch (error) {
      logger.warn(`Failed to set OCR cache for ${documentId}`, error);
    }
  }

}

export const ocrCache = new OcrCache();
