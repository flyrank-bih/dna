import { stringOrEmpty, take } from "@/helpers/render.helpers";

export interface VisualDNAResult {
  confidence: number;
  why: string;
  smart?: boolean;
  provider?: string;
  [key: string]: unknown;
}

export type RefinementTaskKey =
  | "pageIntent"
  | "materialLanguage"
  | "componentLibrary";

export type RefinementUpdate = Partial<
  Record<RefinementTaskKey, VisualDNAResult>
>;

interface RefinementTaskContext {
  pageIntent?: { path?: string; confidence?: number; needsSmart?: boolean };
  materialLanguage?: { confidence?: number; needsSmart?: boolean };
  componentLibrary?: { confidence?: number; needsSmart?: boolean };
}

export interface RefinementInput extends RefinementTaskContext {
  enabled: boolean;
  rawData: {
    url?: string;
    title?: string;
    light?: {
      sections?: Array<{ text?: string }>;
      stack?: { metas?: Array<{ name?: string; content?: string }> };
    };
  };
  design: {
    regions?: Array<{ role?: string }>;
  };
}

export interface RefinementResponse {
  applied: boolean;
  reason?: "unsupported";
  provider?: string;
  updates?: RefinementUpdate;
  errors?: string[];
}

export interface VisualDNAProvider {
  readonly name: "anthropic" | "openai";
  call(systemPrompt: string, userPrompt: string): Promise<string>;
}

interface DnaTaskDefinition {
  systemPrompt: string;
  shouldRun(current: unknown): boolean;
}

const DNA_TASKS: Record<RefinementTaskKey, DnaTaskDefinition> = {
  pageIntent: {
    systemPrompt:
      "You are FlyRank Visual DNA page-intent classifier. Classify as one of: landing, pricing, docs, blog, blog-post, product, about, dashboard, auth, legal, unknown. Return strict JSON: {\"type\":\"...\",\"confidence\":0.xx,\"why\":\"...\"}",
    shouldRun: (current) =>
      !!(
        current &&
        typeof current === "object" &&
        "needsSmart" in current &&
        (current as { needsSmart?: boolean }).needsSmart
      ),
  },
  materialLanguage: {
    systemPrompt:
      "You are FlyRank Visual DNA material-language classifier. Pick one: glassmorphism, neumorphism, flat, brutalist, skeuomorphic, material-you, soft-ui, mixed. Return strict JSON: {\"label\":\"...\",\"confidence\":0.xx,\"why\":\"...\"}",
    shouldRun: (current) => {
      const confidence =
        current && typeof current === "object"
          ? (current as { confidence?: number }).confidence || 0
          : 0;
      return confidence < 0.55;
    },
  },
  componentLibrary: {
    systemPrompt:
      "You are FlyRank Visual DNA UI-library classifier. Pick one: shadcn/ui, radix-ui, headlessui, mui, chakra-ui, mantine, ant-design, bootstrap, heroui, tailwind-ui, vuetify, tailwindcss, unknown. Return strict JSON: {\"library\":\"...\",\"confidence\":0.xx,\"why\":\"...\"}",
    shouldRun: (current) =>
      !!(
        current &&
        typeof current === "object" &&
        "needsSmart" in current &&
        (current as { needsSmart?: boolean }).needsSmart
      ),
  },
};

class AnthropicProvider implements VisualDNAProvider {
  readonly name = "anthropic" as const;

  async call(systemPrompt: string, userPrompt: string): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.VISUAL_DNA_MODEL || "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) throw new Error(`Anthropic error: ${response.status}`);
    const json = (await response.json()) as {
      content?: Array<{ text?: string }>;
    };
    return stringOrEmpty(json.content?.[0]?.text);
  }
}

class OpenAIProvider implements VisualDNAProvider {
  readonly name = "openai" as const;

  async call(systemPrompt: string, userPrompt: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.VISUAL_DNA_MODEL || "gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);
    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return stringOrEmpty(json.choices?.[0]?.message?.content);
  }
}

export class VisualDNARefiner {
  private readonly provider: VisualDNAProvider | null;

  constructor(provider?: VisualDNAProvider | null) {
    this.provider = provider ?? this.resolveProvider();
  }

  private resolveProvider(): VisualDNAProvider | null {
    if (process.env.ANTHROPIC_API_KEY) return new AnthropicProvider();
    if (process.env.OPENAI_API_KEY) return new OpenAIProvider();
    return null;
  }

  private buildDigest(input: RefinementInput): string {
    const text = take(input.rawData?.light?.sections, 30)
      .map((section) => stringOrEmpty(section.text))
      .join("\n")
      .slice(0, 1500);
    const metas = take(input.rawData?.light?.stack?.metas, 10)
      .map(
        (meta) =>
          `${stringOrEmpty(meta.name)}: ${stringOrEmpty(meta.content).slice(0, 100)}`,
      )
      .join("\n");
    const roles = (input.design?.regions || [])
      .map((region) => stringOrEmpty(region.role))
      .filter(Boolean)
      .join(",");

    return [
      `URL: ${input.rawData?.url || "unknown"}`,
      `TITLE: ${input.rawData?.title || "unknown"}`,
      `PATH: ${input.pageIntent?.path || "unknown"}`,
      `METAS:\n${metas}`,
      `ROLES: ${roles}`,
      `TEXT:\n${text}`,
    ].join("\n\n");
  }

  /**
   * Accept both strict JSON and model wrappers that include JSON payloads in prose.
   * This keeps request handling robust across providers and model variants.
   */
  private parseResponse(payload: string): VisualDNAResult | null {
    const parseSafe = (raw: string): VisualDNAResult | null => {
      try {
        return JSON.parse(raw) as VisualDNAResult;
      } catch {
        return null;
      }
    };
    const direct = parseSafe(payload);
    if (direct) return direct;

    const match = payload.match(/\{[\s\S]*\}/);
    return match ? parseSafe(match[0]) : null;
  }

  private activeTasks(input: RefinementInput): Array<[RefinementTaskKey, DnaTaskDefinition]> {
    return (Object.entries(DNA_TASKS) as Array<
      [RefinementTaskKey, DnaTaskDefinition]
    >).filter(([taskKey, task]) => task.shouldRun(input[taskKey]));
  }

  async refine(input: RefinementInput): Promise<RefinementResponse> {
    if (!input.enabled || !this.provider) {
      return { applied: false, reason: "unsupported" };
    }

    const digest = this.buildDigest(input);
    const updates: RefinementUpdate = {};
    const errors: string[] = [];

    for (const [taskKey, task] of this.activeTasks(input)) {
      try {
        const userPrompt = [
          "FlyRank Visual DNA digest:",
          digest,
          "",
          `Current heuristic (${taskKey}):`,
          JSON.stringify(input[taskKey] || {}),
          "",
          "Return strict JSON only.",
        ].join("\n");

        const raw = await this.provider.call(task.systemPrompt, userPrompt);
        const parsed = this.parseResponse(raw);
        if (parsed) {
          updates[taskKey] = {
            ...parsed,
            smart: true,
            provider: this.provider.name,
          };
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown provider error";
        errors.push(`${taskKey}: ${message}`);
      }
    }

    return {
      applied: true,
      provider: this.provider.name,
      updates,
      errors: errors.length ? errors : undefined,
    };
  }
}

export async function refineWithSmart(
  params: RefinementInput,
): Promise<RefinementResponse> {
  return new VisualDNARefiner().refine(params);
}
