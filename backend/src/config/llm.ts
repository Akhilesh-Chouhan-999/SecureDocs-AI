import env from "./env";

/**
 * Large Language Model integration config settings
 */
export const llmConfig = {
  provider: env.openAiApiKey ? "openai" : env.geminiApiKey ? "gemini" : "mock" as "openai" | "gemini" | "mock",
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  enabled: Boolean(env.openAiApiKey || env.geminiApiKey),
};

export default llmConfig;
