import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type {
  BaseLLMCallOptions,
  LLMResult,
} from "@langchain/core/language_models/llm";
import type { BaseLanguageModel } from "@langchain/core/language_models/base";
import { logger } from "../../logs/index.js";

/**
 * LLM Configuration for SecureDoc AI
 * Supports:
 * - Primary: OpenAI GPT-4 (best accuracy)
 * - Fallback: Google Gemini (cost-effective)
 * - Automatic retry with exponential backoff
 */

export interface LLMConfig {
  primaryModel: "openai" | "gemini";
  temperature: number; // 0.0-1.0 (0 = deterministic, 1 = creative)
  maxTokens: number;
  timeout: number;
  retries: number;
  retryDelay: number; // milliseconds
  [key: string]: unknown;
}

const DEFAULT_CONFIG: LLMConfig = {
  primaryModel: "openai",
  temperature: 0.3, // Low for consistent fraud detection
  maxTokens: 2000,
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000,
};

/**
 * LLMManager: Handles LLM initialization and fallback logic
 */
export class LLMManager {
  private openaiClient: ChatOpenAI | null = null;
  private geminiClient: ChatGoogleGenerativeAI | null = null;
  private config: LLMConfig;
  private callStats = {
    openaiSuccesses: 0,
    openaiFailures: 0,
    geminiSuccesses: 0,
    geminiFailures: 0,
  };

  constructor(config: Partial<LLMConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    logger.info(`LLMManager initialized with config:`, this.config);
  }

  /**
   * Initialize primary LLM (GPT-4 via OpenAI)
   */
  private initOpenAI(): ChatOpenAI {
    if (this.openaiClient) {
      return this.openaiClient;
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY environment variable is required for GPT-4",
      );
    }

    this.openaiClient = new ChatOpenAI({
      apiKey,
      modelName: "gpt-4",
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      timeout: this.config.timeout,
    });

    logger.info("OpenAI GPT-4 client initialized");
    return this.openaiClient;
  }

  /**
   * Initialize fallback LLM (Google Gemini)
   */
  private initGemini(): ChatGoogleGenerativeAI {
    if (this.geminiClient) {
      return this.geminiClient;
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      logger.warn("GOOGLE_API_KEY not set, Gemini fallback unavailable");
      throw new Error("GOOGLE_API_KEY environment variable is required");
    }

    this.geminiClient = new ChatGoogleGenerativeAI({
      apiKey,
      modelName: "gemini-pro",
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
    });

    logger.info("Google Gemini client initialized");
    return this.geminiClient;
  }

  /**
   * Get primary LLM with automatic fallback
   */
  async getPrimaryLLM(): Promise<any> {
    try {
      if (this.config.primaryModel === "openai") {
        return this.initOpenAI();
      } else {
        return this.initGemini() as unknown as BaseLanguageModel;
      }
    } catch (error) {
      logger.error(`Failed to initialize primary LLM: ${error}`);
      throw error;
    }
  }

  /**
   * Get fallback LLM
   */
  async getFallbackLLM(): Promise<any> {
    try {
      if (this.config.primaryModel === "openai") {
        // Primary is OpenAI, fallback is Gemini
        return this.initGemini() as unknown as BaseLanguageModel;
      } else {
        // Primary is Gemini, fallback is OpenAI
        return this.initOpenAI();
      }
    } catch (error) {
      logger.error(`Failed to initialize fallback LLM: ${error}`);
      throw error;
    }
  }

  /**
   * Invoke LLM with automatic retry and fallback
   */
  async invoke(
    prompt: string,
    retryCount: number = 0,
  ): Promise<{ text: string; model: string }> {
    try {
      const llm = await this.getPrimaryLLM();

      logger.debug(`Invoking LLM with prompt: ${prompt.substring(0, 100)}...`);

      const response = await (llm as any).invoke(prompt);
      const text =
        response.content ||
        response.text ||
        JSON.stringify(response).substring(0, 500);

      // Track success
      if (this.config.primaryModel === "openai") {
        this.callStats.openaiSuccesses++;
      } else {
        this.callStats.geminiSuccesses++;
      }

      return {
        text: String(text),
        model: this.config.primaryModel,
      };
    } catch (error) {
      logger.error(
        `LLM invocation failed (attempt ${retryCount + 1}): ${error}`,
      );

      // Track failure
      if (this.config.primaryModel === "openai") {
        this.callStats.openaiFailures++;
      } else {
        this.callStats.geminiFailures++;
      }

      // Retry with backoff
      if (retryCount < this.config.retries) {
        const delayMs = this.config.retryDelay * Math.pow(2, retryCount);
        logger.warn(
          `Retrying after ${delayMs}ms... (attempt ${retryCount + 1}/${this.config.retries})`,
        );

        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return this.invoke(prompt, retryCount + 1);
      }

      // Try fallback LLM
      try {
        logger.warn("Primary LLM failed, attempting fallback...");
        const fallbackLLM = await this.getFallbackLLM();
        const response = await (fallbackLLM as any).invoke(prompt);
        const text =
          response.content ||
          response.text ||
          JSON.stringify(response).substring(0, 500);

        // Track fallback success
        if (this.config.primaryModel === "openai") {
          this.callStats.geminiSuccesses++;
        } else {
          this.callStats.openaiSuccesses++;
        }

        logger.info("Fallback LLM succeeded");
        return {
          text: String(text),
          model: this.config.primaryModel === "openai" ? "gemini" : "openai",
        };
      } catch (fallbackError) {
        logger.error(`Fallback LLM also failed: ${fallbackError}`);
        throw new Error(
          `Both primary and fallback LLMs failed: ${error} | ${fallbackError}`,
        );
      }
    }
  }

  /**
   * Get LLM statistics
   */
  getStats() {
    return {
      config: this.config,
      callStats: this.callStats,
      successRate: {
        openai:
          this.callStats.openaiSuccesses + this.callStats.openaiFailures > 0
            ? (
                (this.callStats.openaiSuccesses /
                  (this.callStats.openaiSuccesses +
                    this.callStats.openaiFailures)) *
                100
              ).toFixed(2) + "%"
            : "N/A",
        gemini:
          this.callStats.geminiSuccesses + this.callStats.geminiFailures > 0
            ? (
                (this.callStats.geminiSuccesses /
                  (this.callStats.geminiSuccesses +
                    this.callStats.geminiFailures)) *
                100
              ).toFixed(2) + "%"
            : "N/A",
      },
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.callStats = {
      openaiSuccesses: 0,
      openaiFailures: 0,
      geminiSuccesses: 0,
      geminiFailures: 0,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info("LLMManager config updated", this.config);
  }
}

/**
 * Singleton instance
 */
let llmManagerInstance: LLMManager | null = null;

/**
 * Get or create LLMManager singleton
 */
export function getLLMManager(config?: Partial<LLMConfig>): LLMManager {
  if (!llmManagerInstance) {
    llmManagerInstance = new LLMManager(config);
  }
  return llmManagerInstance;
}

export default LLMManager;
