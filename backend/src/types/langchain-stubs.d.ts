declare module "@langchain/agents" {
  export function initializeAgentExecutorWithOptions(
    tools: any[],
    llm: any,
    options?: any,
  ): Promise<any>;
}

declare module "@langchain/google-genai" {
  export class ChatGoogleGenerativeAI {

    constructor(options?: any);
    invoke(input: any): Promise<any>;
  
}
}

declare module "@langchain/core/language_models/llm" {
  export interface BaseLLMCallOptions {
    [key: string]: any;
  }

  export interface LLMResult {
    generations: any[];
    [key: string]: any;
  }
}
