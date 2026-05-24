/**
 * Base Agent Class
 * Common functionality for all LangChain agents
 */

import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { StructuredTool } from "@langchain/core/tools";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { logger } from "../../logs/index.js";

/**
 * AgentExecutionResult - Standard result format for agent execution
 */
export interface AgentExecutionResult {
  success: boolean;
  status: "completed" | "failed" | "partial";
  output: string;
  intermediateSteps?: Array<{
    tool: string;
    input: string;
    output: string;
  }>;
  error?: string;
  executionTime?: number;
  agentType: string;
}

/**
 * BaseAgent - Abstract base class for agents
 */
export abstract class BaseAgent {
  protected agentExecutor: AgentExecutor | null = null;
  protected tools: any[];
  protected llm: any;
  protected agentName: string;

  constructor(agentName: string, llm: any, tools: any[] = []) {
    this.agentName = agentName;
    this.llm = llm;
    this.tools = tools;
  }

  /**
   * Initialize agent executor
   */
  protected async initializeAgent(
    systemPrompt: string,
  ): Promise<AgentExecutor> {
    try {
      if (this.agentExecutor) {
        return this.agentExecutor;
      }

      const prompt = ChatPromptTemplate.fromMessages([
        ["system", systemPrompt],
        ["human", "{input}"],
        ["ai", "{agent_scratchpad}"],
      ]);

      const agent = await createOpenAIFunctionsAgent({
        llm: this.llm,
        tools: this.tools,
        prompt,
      });

      this.agentExecutor = new AgentExecutor({
        agent,
        tools: this.tools,
        verbose: process.env.LOG_LEVEL === "debug",
        returnIntermediateSteps: true,
      });

      logger.info(
        `Agent '${this.agentName}' initialized with ${this.tools.length} tools`,
      );
      return this.agentExecutor;
    } catch (error) {
      logger.error(`Failed to initialize agent '${this.agentName}':`, error);
      throw error;
    }
  }

  /**
   * Execute agent with input
   */
  protected async executeAgent(
    input: string,
    systemPrompt: string,
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now();

    try {
      const executor = await this.initializeAgent(systemPrompt);

      const result = await executor.invoke({
        input,
      });

      const executionTime = Date.now() - startTime;

      const intermediateSteps =
        result.intermediateSteps?.map((step: any) => ({
          tool: step[0].tool,
          input: step[0].toolInput,
          output: step[1],
        })) || [];

      logger.info(
        `Agent '${this.agentName}' execution completed in ${executionTime}ms`,
      );

      return {
        success: true,
        status: "completed",
        output: result.output || "",
        intermediateSteps,
        executionTime,
        agentType: this.agentName,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      logger.error(
        `Agent '${this.agentName}' failed after ${executionTime}ms:`,
        error,
      );

      return {
        success: false,
        status: "failed",
        output: "",
        error: errorMessage,
        executionTime,
        agentType: this.agentName,
      };
    }
  }

  /**
   * Add tools to agent
   */
  addTools(tools: any[]): void {
    this.tools.push(...tools);
    logger.debug(`Added ${tools.length} tools to agent '${this.agentName}'`);
  }

  /**
   * Get agent name
   */
  getAgentName(): string {
    return this.agentName;
  }

  /**
   * Get tools count
   */
  getToolsCount(): number {
    return this.tools.length;
  }

  /**
   * Abstract method to be implemented by subclasses
   */
  abstract execute(input: any): Promise<AgentExecutionResult>;
}

export default BaseAgent;
