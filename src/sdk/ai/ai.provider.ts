import { type SdkAiConfig } from "../config";
import { type AiJsonResult, type AiPromptInput } from "./ai.types";
import { OpenAiSdkAdapter } from "./openai.adapter";

export interface BrandAiProvider {
  readonly name: string;
  generateJson<TOutput>(input: AiPromptInput): Promise<AiJsonResult<TOutput>>;
}

export function resolveAiProvider(
  config: SdkAiConfig = {},
): BrandAiProvider | null {
  if (config.adapter) {
    return config.adapter as unknown as BrandAiProvider;
  }
  if (config.provider === "openai" || config.apiKey || process.env.OPENAI_API_KEY) {
    return new OpenAiSdkAdapter({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY || "",
      model: config.model || process.env.VISUAL_DNA_MODEL || "gpt-5-mini",
    });
  }
  return null;
}
