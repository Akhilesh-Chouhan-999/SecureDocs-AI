/**
 * OpenAI LLM Client
 * Handles ChatOpenAI integration with GPT-4 and GPT-3.5-turbo
 */

import { ChatOpenAI } from "@langchain/openai";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { logger } from "../../logs/index.js";
import {
  ILLMClient,
  ILLMConfig,
  LLMError,
  LLMResult,
  LLMOptions,
} from "./base-llm.js";

/**
 * OpenAIClient - ChatOpenAI wrapper
 */
export class OpenAIClient implements ILLMClient {
  private client: ChatOpenAI | null = null;
  private config: ILLMConfig;
  private providerName = "OpenAI";

  constructor(config: ILLMConfig) {
    this.config = {
      ...config,
      timeout: config.timeout || 60000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
    };

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not found in environment");
    }
  }

  /**
   * Initialize OpenAI client
   */
  async initialize(): Promise<BaseLanguageModel> {
    try {
      if (this.client) {
        return this.client;
      }

      this.client = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: this.config.modelName || "gpt-4",
        temperature: this.config.temperature || 0.3,
        maxTokens: this.config.maxTokens || 2000,
        topP: this.config.topP || 1,
        frequencyPenalty: this.config.frequencyPenalty || 0,
        presencePenalty: this.config.presencePenalty || 0,
        timeout: this.config.timeout,
        maxRetries: this.config.retryAttempts,
      });

      logger.info(
        `OpenAI client initialized with model: ${this.config.modelName}`,
      );
      return this.client;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("OpenAI initialization failed:", err);
      throw new LLMError(
        this.providerName,
        err,
        "Failed to initialize OpenAI client",
      );
    }
  }

  /**
   * Invoke OpenAI with input
   */
  async invoke(input: string, options?: LLMOptions): Promise<string> {
    try {
      const client = await this.initialize();

      const startTime = Date.now();

      const response = await (client as ChatOpenAI).invoke(input);

      const latency = Date.now() - startTime;

      logger.debug(`OpenAI invocation completed in ${latency}ms`);

      return response.content ? String(response.content) : "";
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("OpenAI invocation failed:", err);
      throw new LLMError(this.providerName, err, "Failed to invoke OpenAI");
    }
  }

  /**
   * Check if OpenAI API is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      if (!process.env.OPENAI_API_KEY) {
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
    return this.config.modelName || "gpt-4";
  }
}

export default OpenAIClient;
