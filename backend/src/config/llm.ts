import env from "./env";

/**
 * Large Language Model integration config settings
 */
const llmConfig = {
  provider: env.openAiApiKey ? "openai" : env.geminiApiKey ? "gemini" : "mock",
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  enabled: Boolean(env.openAiApiKey || env.geminiApiKey),
};

export default llmConfig;
export { llmConfig };
