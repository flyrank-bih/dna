import { type ActionHandler } from "./action.protocol";

interface ColorEntry {
  hex?: string;
}

interface DarkDiffDesign {
  colors?: { all?: ColorEntry[] };
  variables?: Record<string, unknown>;
}

interface VariableChange {
  name: string;
  light: string | null;
  dark: string;
}

interface DarkDiffResult {
  hasChanges: boolean;
  changes: Array<
    | {
        category: "colors";
        light: number;
        dark: number;
        added: string[];
        removed: string[];
      }
    | {
        category: "cssVariables";
        changed: VariableChange[];
        newInDark: VariableChange[];
      }
  >;
  summary: {
    colorsChanged: number;
    variablesChanged: number;
    newDarkVariables: number;
  };
}

function flattenVars(variables: Record<string, unknown> = {}): Record<string, string> {
  const flat: Record<string, string> = {};
  for (const group of Object.values(variables)) {
    if (!group || typeof group !== "object") continue;
    for (const [key, value] of Object.entries(group as Record<string, unknown>)) {
      if (typeof value === "string") flat[key] = value;
    }
  }
  return flat;
}

export class DarkModeDiffAction
  implements ActionHandler<[lightDesign: DarkDiffDesign, darkDesign: DarkDiffDesign], DarkDiffResult>
{
  run(lightDesign: DarkDiffDesign = {}, darkDesign: DarkDiffDesign = {}): DarkDiffResult {
    const changes: DarkDiffResult["changes"] = [];
    const lightAll = lightDesign.colors?.all || [];
    const darkAll = darkDesign.colors?.all || [];

    const lightHexes = lightAll.map((color) => color.hex).filter((hex): hex is string => !!hex);
    const darkHexes = darkAll.map((color) => color.hex).filter((hex): hex is string => !!hex);
    const lightColors = new Set(lightHexes);
    const darkColors = new Set(darkHexes);

    const addedInDark = darkHexes.filter((hex) => !lightColors.has(hex));
    const removedInDark = lightHexes.filter((hex) => !darkColors.has(hex));

    if (addedInDark.length > 0 || removedInDark.length > 0) {
      changes.push({
        category: "colors",
        light: lightAll.length,
        dark: darkAll.length,
        added: addedInDark,
        removed: removedInDark,
      });
    }

    const lightVars = flattenVars(lightDesign.variables as Record<string, unknown>);
    const darkVars = flattenVars(darkDesign.variables as Record<string, unknown>);
    const varChanges: VariableChange[] = [];
    for (const [name, light] of Object.entries(lightVars)) {
      const dark = darkVars[name];
      if (typeof dark === "string" && dark !== light) {
        varChanges.push({ name, light, dark });
      }
    }

    const newDarkVars: VariableChange[] = Object.entries(darkVars)
      .filter(([name]) => !(name in lightVars))
      .map(([name, dark]) => ({ name, light: null, dark }));

    if (varChanges.length > 0 || newDarkVars.length > 0) {
      changes.push({
        category: "cssVariables",
        changed: varChanges,
        newInDark: newDarkVars,
      });
    }

    return {
      hasChanges: changes.length > 0,
      changes,
      summary: {
        colorsChanged: addedInDark.length + removedInDark.length,
        variablesChanged: varChanges.length,
        newDarkVariables: newDarkVars.length,
      },
    };
  }
}

export function diffDarkMode(
  lightDesign: DarkDiffDesign,
  darkDesign: DarkDiffDesign,
): DarkDiffResult {
  return new DarkModeDiffAction().run(lightDesign, darkDesign);
}
