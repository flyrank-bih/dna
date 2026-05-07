/**
 * @file agent formatter
 * @description Generates agent instruction files that enforce FlyRank Visual DNA token usage.
 */

import { createReferenceResolver, ReferenceResolver } from "@/helpers/design-token.helpers";
import { type TokenNode } from "@/helpers/formatter-token.helpers";

type TokenTree = Record<string, unknown>;
type DesignInput = { meta?: { url?: string }; regions?: Array<{ role?: string; name?: string }> };

interface AgentFormatInput {
  design?: DesignInput;
  tokens?: TokenTree & { $metadata?: { source?: string; generatedAt?: string } };
  url?: string;
}

class AgentRulesFormatter {
  constructor(
    private readonly design: DesignInput,
    private readonly tokens: TokenTree,
    private readonly resolvedUrl: string,
    private readonly iso: string,
    private readonly tokenResolver: ReferenceResolver,
  ) {}

  private hostFromUrl(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url || "unknown";
    }
  }

  private resolveSemantic(path: string, fallback: string): string {
    const value = this.tokenResolver.resolve(path);
    return typeof value === "string" && value ? value : fallback;
  }



  private firstFontFamily(): string {
    const fam = (this.tokens as { primitive?: { fontFamily?: Record<string, { $value?: unknown }> } })
      ?.primitive?.fontFamily || {};
    const keys = Object.keys(fam);
    if (!keys.length) return "system-ui";
    const value = fam[keys[0]]?.$value;
    return typeof value === "string" ? value : "system-ui";
  }

  private buildBody(): string {
    const lines: string[] = [];
    lines.push(`Source: ${this.resolvedUrl}`);
    lines.push(`Extracted by FlyRank Visual DNA v7.0.0 on ${this.iso}`);
    lines.push("");
    lines.push("## Semantic tokens (use these)");
    lines.push(`- color.action.primary: ${this.resolveSemantic("semantic.color.action.primary", "#000000")}`);
    lines.push(`- color.surface.default: ${this.resolveSemantic("semantic.color.surface.default", "#ffffff")}`);
    lines.push(`- color.text.body: ${this.resolveSemantic("semantic.color.text.body", "#111111")}`);
    lines.push(`- radius.control: ${this.resolveSemantic("semantic.radius.control", "0px")}`);
    lines.push(`- typography.body.fontFamily: ${this.firstFontFamily()}`);

    const regions = Array.isArray(this.design?.regions) ? this.design.regions : [];
    if (regions.length) {
      lines.push("");
      lines.push("## Regions");
      for (const region of regions) {
        const name = region.role || region.name;
        if (name) lines.push(`- ${name}`);
      }
    }

    lines.push("");
    lines.push("## How to use");
    lines.push("- Prefer `semantic.*` tokens over `primitive.*`.");
    lines.push("- Never invent new tokens or hex values; reuse the ones above.");
    lines.push("- When a value is missing, pick the closest existing semantic token and flag the gap.");
    lines.push("- Reference tokens by dotted path (e.g. `semantic.color.action.primary`).");
    return lines.join("\n");
  }

  private cursorFile(body: string): string {
    const frontmatter = [
      "---",
      `description: Design system extracted from ${this.resolvedUrl} - use these tokens, do not invent new ones.`,
      "globs: **/*.{ts,tsx,jsx,js,css,scss,html,vue,svelte,swift,kt,dart,php}",
      "alwaysApply: true",
      "---",
      "",
      "# Design System Reference",
    ].join("\n");
    return `${frontmatter}\n${body}\n`;
  }

  private claudeSkillFile(body: string): string {
    const host = this.hostFromUrl(this.resolvedUrl);
    const frontmatter = [
      "---",
      "name: flyrank-visual-dna-tokens",
      `description: Use when styling UI for ${host} - references FlyRank Visual DNA tokens instead of inventing colors, spacing, or typography.`,
      "---",
      "",
      "# FlyRank Visual DNA Tokens",
    ].join("\n");
    return `${frontmatter}\n${body}\n`;
  }

  private claudeFragmentFile(body: string): string {
    return `## Design system (via FlyRank Visual DNA)\n\n${body}\n`;
  }

  private agentsMdFile(body: string): string {
    const head = [
      "# Agent Instructions - Design System",
      "",
      `This project follows the design system extracted from ${this.resolvedUrl}.`,
      "Any coding agent working here must use the tokens below and avoid inventing new ones.",
      "",
    ].join("\n");
    return `${head}${body}\n`;
  }

  public format(): Record<string, string> {
    const body = this.buildBody();
    return {
      ".cursor/rules/flyrank-visual-dna.mdc": this.cursorFile(body),
      ".claude/skills/flyrank-visual-dna/SKILL.md": this.claudeSkillFile(body),
      "CLAUDE.md.fragment": this.claudeFragmentFile(body),
      "AGENTS.md.fragment": this.agentsMdFile(body),
    };
  }
}

export function formatAgentRules(input: AgentFormatInput): Record<string, string> {
  const design = input.design || {};
  const tokens = input.tokens || {};
  const resolvedUrl = input.url || input.tokens?.$metadata?.source || design.meta?.url || "unknown";
  const iso = input.tokens?.$metadata?.generatedAt || new Date().toISOString();
  return new AgentRulesFormatter(
    design,
    tokens,
    resolvedUrl,
    iso,
    createReferenceResolver(tokens as Record<string, TokenNode>),
  ).format();
}
