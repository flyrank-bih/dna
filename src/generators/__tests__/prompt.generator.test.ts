import { describe, expect, it } from "@rstest/core";
import {
  buildPromptPack,
  formatCodexPrompt,
  formatCopilotPrompt,
} from "../prompt.generator";

const design = {
  colors: { all: [{ hex: "#2563eb" }, { hex: "#111827" }] },
  typography: { families: [{ name: "Inter" }, "JetBrains Mono"] },
  spacing: { scale: [4, 8, 16] },
  borders: { radii: [{ value: 8 }] },
  shadows: { values: [{ raw: "0 4px 10px rgba(0,0,0,0.15)" }] },
  materialLanguage: { label: "soft" },
  pageIntent: { type: "landing" },
  sectionRoles: { sections: [{ role: "hero" }, { role: "cta" }] },
  voice: { tone: "confident", ctaVerbs: ["Start", "Explore"] },
  componentLibrary: { library: "shadcn/ui" },
  componentClusters: [{ kind: "button", variants: [] }],
};

describe("prompt.generator", () => {
  it("builds prompt pack with codex/copilot prompts", () => {
    const pack = buildPromptPack(design);
    expect(pack["codex.md"]).toContain("FlyRank Visual DNA");
    expect(pack["copilot.md"]).toContain("Render sections in this order");
    expect(pack["cursor.md"]).toContain("## Tokens");
    expect(pack.recipes.length).toBe(1);
  });

  it("exposes direct codex/copilot formatters", () => {
    expect(formatCodexPrompt(design)).toContain("Constraints:");
    expect(formatCopilotPrompt(design)).toContain("Library hint:");
  });
});
