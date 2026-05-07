import { describe, expect, it } from "@rstest/core";
import {
  VisualDNARefiner,
  type RefinementInput,
  type VisualDNAProvider,
} from "../llm-fallback";

const baseInput = (): RefinementInput => ({
  enabled: true,
  rawData: {
    url: "https://example.com/pricing",
    title: "Example Pricing",
    light: {
      sections: [{ text: "Pricing plans and subscription tiers" }],
      stack: { metas: [{ name: "description", content: "Pricing page" }] },
    },
  },
  design: {
    regions: [{ role: "pricing-table" }],
  },
  pageIntent: { path: "/pricing", needsSmart: true },
  materialLanguage: { confidence: 0.2 },
  componentLibrary: { needsSmart: true },
});

describe("VisualDNARefiner", () => {
  it("returns unsupported when disabled", async () => {
    const refiner = new VisualDNARefiner();
    const result = await refiner.refine({ ...baseInput(), enabled: false });
    expect(result).toEqual({ applied: false, reason: "unsupported" });
  });

  it("applies smart updates with provider-backed refinement", async () => {
    const provider: VisualDNAProvider = {
      name: "openai",
      async call(systemPrompt: string): Promise<string> {
        if (systemPrompt.includes("page-intent")) {
          return '{"type":"pricing","confidence":0.92,"why":"pricing language detected"}';
        }
        if (systemPrompt.includes("material-language")) {
          return '{"label":"flat","confidence":0.73,"why":"clean modern tokens"}';
        }
        return 'Result: {"library":"tailwindcss","confidence":0.88,"why":"utility-first class patterns"}';
      },
    };

    const refiner = new VisualDNARefiner(provider);
    const result = await refiner.refine(baseInput());

    expect(result.applied).toBe(true);
    expect(result.provider).toBe("openai");
    expect(result.errors).toBeUndefined();
    expect(result.updates?.pageIntent?.provider).toBe("openai");
    expect(result.updates?.pageIntent?.smart).toBe(true);
    expect(result.updates?.materialLanguage?.provider).toBe("openai");
    expect(result.updates?.componentLibrary?.provider).toBe("openai");
  });
});
