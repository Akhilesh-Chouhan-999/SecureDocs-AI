/**
 * Base LLM Interface
 * Abstract class for LLM providers
 */

import { BaseLanguageModel } from "@langchain/core/language_models/base";

/**
 * ILLMConfig - Common configuration for LLM providers
 */
export interface ILLMConfig {
  modelName: string;
  temperature: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * ILLMClient - Interface for LLM client implementations
 */
export interface ILLMClient {
  initialize(): Promise<BaseLanguageModel>;
  invoke(input: string): Promise<string>;
  isAvailable(): Promise<boolean>;
  getProviderName(): string;
  getModelName(): string;
}

/**
 * LLMError - Custom error for LLM operations
 */
export class LLMError extends Error {
  constructor(
    public provider: string,
    public originalError: Error,
    message?: string,
  ) {
    super(message || originalError.message);
    this.name = "LLMError";
  }
}

/**
 * LLMResult - Standardized result from LLM invocation
 */
export interface LLMResult {
  success: boolean;
  content: string;
  provider: string;
  model: string;
  tokens?: {
    input: number;
    output: number;
    total: number;
  };
  latency?: number;
  error?: string;
}

/**
 * LLMOptions - Options for LLM invocation
 */
export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  timeout?: number;
}

export default ILLMClient;
