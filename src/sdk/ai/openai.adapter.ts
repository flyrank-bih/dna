import { ensureValue, FlyDesignSdkError } from "../errors";
import { type AiJsonResult, type AiPromptInput } from "./ai.types";

interface OpenAiAdapterConfig {
  apiKey: string;
  model: string;
}

interface OpenAiResponsesOutputItem {
  type?: string;
  content?: Array<{ type?: string; text?: string }>;
}

interface OpenAiResponsesResponse {
  output?: OpenAiResponsesOutputItem[];
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
}

function parseJsonPayload<TOutput>(payload: string): TOutput {
  try {
    return JSON.parse(payload) as TOutput;
  } catch {
    const match = payload.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!match) {
      throw new FlyDesignSdkError({
        code: "provider_error",
        source: "sdk.ai.openai",
        message: "OpenAI returned a non-JSON response.",
        details: payload,
      });
    }
    return JSON.parse(match[0]) as TOutput;
  }
}

export class OpenAiSdkAdapter {
  readonly name = "openai";
  private readonly config: OpenAiAdapterConfig;

  constructor(config: OpenAiAdapterConfig) {
    this.config = config;
  }

  async generateJson<TOutput>(
    input: AiPromptInput,
  ): Promise<AiJsonResult<TOutput>> {
    ensureValue(this.config.apiKey, {
      code: "provider_unavailable",
      source: "sdk.ai.openai",
      message: "Missing OpenAI API key.",
    });

    const module = (await import("openai")) as {
      default: new (config: { apiKey: string }) => {
        responses: {
          create(params: unknown): Promise<OpenAiResponsesResponse>;
        };
      };
    };

    const client = new module.default({
      apiKey: this.config.apiKey,
    });

    const response = await client.responses.create({
      model: this.config.model,
      input: [
        { role: "system", content: input.systemPrompt },
        { role: "user", content: input.userPrompt },
      ],
      text: { format: { type: "json_object" } },
    });

    const content =
      response.output?.[0]?.content?.find((c) => c.type === "output_text")
        ?.text ?? "";
    return {
      data: parseJsonPayload<TOutput>(content),
      usage: {
        inputTokens: response.usage?.input_tokens,
        outputTokens: response.usage?.output_tokens,
        totalTokens: response.usage?.total_tokens,
        model: this.config.model,
      },
    };
  }
}
