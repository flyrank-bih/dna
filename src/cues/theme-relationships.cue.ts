import { type CueExtractor } from "./cue.protocol";

interface ThemeRelationshipsInput {
  colors?: {
    primary?: { hex?: string } | null;
    secondary?: { hex?: string } | null;
    accent?: { hex?: string } | null;
    backgrounds?: string[];
    text?: string[];
  };
  variables?: Record<string, unknown>;
  darkMode?: {
    colors?: {
      backgrounds?: string[];
      text?: string[];
    };
  } | null;
}

interface ThemeRelationshipsResult {
  aliases: Record<string, string | null>;
  themeFamilies: string[];
  hasDarkMode: boolean;
  evidence: string[];
}

export class ThemeRelationshipsCueExtractor
  implements CueExtractor<[input: ThemeRelationshipsInput], ThemeRelationshipsResult>
{
  extract(input: ThemeRelationshipsInput = {}): ThemeRelationshipsResult {
    const aliases = {
      brand: input.colors?.primary?.hex || null,
      accent: input.colors?.accent?.hex || null,
      surface: input.colors?.backgrounds?.[0] || null,
      text: input.colors?.text?.[0] || null,
      secondary: input.colors?.secondary?.hex || null,
    };
    const variableKeys = Object.keys(input.variables || {});
    const evidence = variableKeys
      .filter((key) => /color|surface|border|text|accent|primary/i.test(key))
      .slice(0, 8);

    const themeFamilies = [
      "brand",
      aliases.surface ? "surface" : "",
      aliases.text ? "content" : "",
      input.darkMode ? "dark" : "",
    ].filter(Boolean);

    return {
      aliases,
      themeFamilies,
      hasDarkMode: Boolean(input.darkMode),
      evidence,
    };
  }
}

export function extractThemeRelationships(
  input: ThemeRelationshipsInput = {},
): ThemeRelationshipsResult {
  return new ThemeRelationshipsCueExtractor().extract(input);
}
