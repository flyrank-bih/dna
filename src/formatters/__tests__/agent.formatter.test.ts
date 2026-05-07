import { describe, expect, it } from "@rstest/core";
import { formatAgentRules } from "../agent.formatter";

describe("formatAgentRules", () => {
  it("generates FlyRank Visual DNA agent instruction files", () => {
    const files = formatAgentRules({
      url: "https://example.com",
      tokens: {
        semantic: {
          color: {
            action: { primary: { $value: "#2563eb" } },
            surface: { default: { $value: "#ffffff" } },
            text: { body: { $value: "#111827" } },
          },
          radius: { control: { $value: "8px" } },
        },
        primitive: {
          fontFamily: { body: { $value: "Inter" } },
        },
      },
      design: {},
    });

    expect(files[".cursor/rules/flyrank-visual-dna.mdc"]).toContain("FlyRank Visual DNA");
    expect(files[".claude/skills/flyrank-visual-dna/SKILL.md"]).toContain("flyrank-visual-dna-tokens");
    expect(files["AGENTS.md.fragment"]).toContain("semantic.color.action.primary");
  });
});
