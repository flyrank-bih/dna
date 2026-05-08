import { type CueExtractor } from "./cue.protocol";

type VariableMap = Record<string, string>;

interface VariableExtractionResult {
  colors: VariableMap;
  spacing: VariableMap;
  typography: VariableMap;
  shadows: VariableMap;
  radii: VariableMap;
  other: VariableMap;
  dependencies: Record<string, string[]>;
  semantic: {
    success: VariableMap;
    warning: VariableMap;
    error: VariableMap;
    info: VariableMap;
  };
}

export class VariableCueExtractor
  implements CueExtractor<[cssVariables?: VariableMap], VariableExtractionResult>
{
  extract(cssVariables: VariableMap = {}): VariableExtractionResult {
    const categories = {
      colors: {} as VariableMap,
      spacing: {} as VariableMap,
      typography: {} as VariableMap,
      shadows: {} as VariableMap,
      radii: {} as VariableMap,
      other: {} as VariableMap,
    };

    for (const [name, value] of Object.entries(cssVariables)) {
      const lower = name.toLowerCase();
      if (
        /color|bg|foreground|primary|secondary|accent|muted|border|ring|destructive|card|popover|chart/.test(
          lower,
        )
      ) {
        categories.colors[name] = value;
      } else if (/spacing|gap|padding|margin|space|size/.test(lower)) {
        categories.spacing[name] = value;
      } else if (/font|text|line-height|letter|tracking|leading/.test(lower)) {
        categories.typography[name] = value;
      } else if (/shadow/.test(lower)) {
        categories.shadows[name] = value;
      } else if (/radius|rounded/.test(lower)) {
        categories.radii[name] = value;
      } else {
        categories.other[name] = value;
      }
    }

    const dependencies: Record<string, string[]> = {};
    for (const [name, value] of Object.entries(cssVariables)) {
      const refs = [...value.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1]);
      if (refs.length > 0) dependencies[name] = refs;
    }

    const semantic = {
      success: {} as VariableMap,
      warning: {} as VariableMap,
      error: {} as VariableMap,
      info: {} as VariableMap,
    };
    for (const [name, value] of Object.entries(cssVariables)) {
      const lower = name.toLowerCase();
      if (/success|green|valid|positive/.test(lower)) semantic.success[name] = value;
      else if (/warning|warn|yellow|caution|amber/.test(lower)) semantic.warning[name] = value;
      else if (/error|danger|destructive|red|invalid|negative/.test(lower)) {
        semantic.error[name] = value;
      } else if (/info|informati|blue|notice/.test(lower)) {
        semantic.info[name] = value;
      }
    }

    return { ...categories, dependencies, semantic };
  }
}

export function extractVariables(
  cssVariables: VariableMap = {},
): VariableExtractionResult {
  return new VariableCueExtractor().extract(cssVariables);
}
