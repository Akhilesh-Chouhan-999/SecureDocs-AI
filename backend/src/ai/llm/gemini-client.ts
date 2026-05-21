/**
 * Google Gemini LLM Client
 * Handles ChatGoogleGenerativeAI integration with Gemini Pro
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { logger } from "../../logs/index.js";
import { ILLMClient, ILLMConfig, LLMError, LLMOptions } from "./base-llm.js";

/**
 * GeminiClient - ChatGoogleGenerativeAI wrapper
 */
export class GeminiClient implements ILLMClient {
  private client: ChatGoogleGenerativeAI | null = null;
  private config: ILLMConfig;
  private providerName = "Google Gemini";

  constructor(config: ILLMConfig) {
    this.config = {
      ...config,
      timeout: config.timeout || 60000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
    };

    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY not found in environment");
    }
  }

  /**
   * Initialize Gemini client
   */
  async initialize(): Promise<BaseLanguageModel> {
    try {
      if (this.client) {
        return this.client;
      }

      this.client = new ChatGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_API_KEY,
        modelName: this.config.modelName || "gemini-pro",
        temperature: this.config.temperature || 0.3,
        maxOutputTokens: this.config.maxTokens || 2000,
        topP: this.config.topP || 1,
      });

      logger.info(
        `Gemini client initialized with model: ${this.config.modelName}`,
      );
      return this.client;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Gemini initialization failed:", err);
      throw new LLMError(
        this.providerName,
        err,
        "Failed to initialize Gemini client",
      );
    }
  }

  /**
   * Invoke Gemini with input
   */
  async invoke(input: string, options?: LLMOptions): Promise<string> {
    try {
      const client = await this.initialize();

      const startTime = Date.now();

      const response = await (client as ChatGoogleGenerativeAI).invoke(input, {
        temperature: options?.temperature || this.config.temperature,
        maxOutputTokens: options?.maxTokens || this.config.maxTokens,
      });

      const latency = Date.now() - startTime;

      logger.debug(`Gemini invocation completed in ${latency}ms`);

      return response.content ? String(response.content) : "";
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Gemini invocation failed:", err);
      throw new LLMError(this.providerName, err, "Failed to invoke Gemini");
    }
  }

  /**
   * Check if Gemini API is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      if (!process.env.GOOGLE_API_KEY) {
        return false;
      }

      await this.initialize();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get provider name
   */
  getProviderName(): string {
    return this.providerName;
  }

  /**
   * Get model name
   */
  getModelName(): string {
    return this.config.modelName || "gemini-pro";
  }
}

export default GeminiClient;
