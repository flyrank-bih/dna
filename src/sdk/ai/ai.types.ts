export interface AiPromptInput {
  systemPrompt: string;
  userPrompt: string;
}

export interface AiProviderUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  model?: string;
}

export interface AiJsonResult<TOutput> {
  data: TOutput;
  usage?: AiProviderUsage;
}
