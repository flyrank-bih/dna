import { type CueExtractor } from "./cue.protocol";

interface RoleColorValue {
  hex?: string;
}

interface ModeColors {
  primary?: RoleColorValue | string;
  secondary?: RoleColorValue | string;
  accent?: RoleColorValue | string;
  backgrounds?: Array<RoleColorValue | string>;
  text?: Array<RoleColorValue | string>;
  all?: Array<RoleColorValue | string>;
}

type RoleKey = "primary" | "secondary" | "accent";

interface ModeDesign {
  colors?: ModeColors;
  variables?: Record<string, string>;
  darkMode?: { colors?: ModeColors; variables?: Record<string, string> };
}

function hexOf(c: RoleColorValue | string | undefined) {
  if (!c) return null;
  if (typeof c === "string") return c.toLowerCase();
  return (c.hex || "").toLowerCase();
}

function pairRoleColors(light: ModeColors = {}, dark: ModeColors = {}) {
  const pairs: Record<string, { light: string | null; dark: string | null }> = {};
  const roleKeys: RoleKey[] = ["primary", "secondary", "accent"];
  for (const role of roleKeys) {
    const l = hexOf(light[role]);
    const d = hexOf(dark[role]);
    if (l || d) pairs[role] = { light: l, dark: d };
  }
  const bgPair = {
    light: hexOf(light.backgrounds?.[0]) || null,
    dark: hexOf(dark.backgrounds?.[0]) || null,
  };
  if (bgPair.light || bgPair.dark) pairs.background = bgPair;
  const textPair = {
    light: hexOf(light.text?.[0]) || null,
    dark: hexOf(dark.text?.[0]) || null,
  };
  if (textPair.light || textPair.dark) pairs.text = textPair;
  return pairs;
}

function pairVariables(
  lightVars: Record<string, string> = {},
  darkVars: Record<string, string> = {},
) {
  // Walk the union of keys; emit light/dark only when values differ.
  const keys = new Set([
    ...Object.keys(lightVars || {}),
    ...Object.keys(darkVars || {}),
  ]);
  const out: Record<string, { light: string | null; dark: string | null }> = {};
  for (const k of keys) {
    const l = lightVars[k];
    const d = darkVars[k];
    if (l == null && d == null) continue;
    if (typeof l === "string" && typeof d === "string" && l === d) continue;
    out[k] = { light: l ?? null, dark: d ?? null };
  }
  return out;
}

interface PairDarkModeResult {
  available: boolean;
  reason?: string;
  roles?: Record<string, { light: string | null; dark: string | null }>;
  variables?: Record<string, { light: string | null; dark: string | null }>;
  pairedVarCount?: number;
  audit?: {
    missingInDark: string[];
    missingInLight: string[];
    coverage: string;
  };
  tailwind?: Record<string, unknown>;
}

export class DarkModePairingCueExtractor
  implements CueExtractor<[design: ModeDesign], PairDarkModeResult>
{
  extract(design: ModeDesign = {}): PairDarkModeResult {
    if (!design.darkMode) {
      return { available: false, reason: "no --dark pass captured" };
    }
    const lightColors = design.colors || {};
    const darkColors = design.darkMode.colors || {};
    const roles = pairRoleColors(lightColors, darkColors);
    const variables = pairVariables(
      design.variables || {},
      design.darkMode.variables || {},
    );
    const pairedVarCount = Object.keys(variables).length;
    const lightSet = new Set(
      (lightColors.all || [])
        .map((c) => hexOf(c) || "")
        .filter(Boolean),
    );
    const darkSet = new Set(
      (darkColors.all || [])
        .map((c) => hexOf(c) || "")
        .filter(Boolean),
    );
    const missingInDark = [...lightSet]
      .filter((x) => !darkSet.has(x))
      .slice(0, 20);
    const missingInLight = [...darkSet]
      .filter((x) => !lightSet.has(x))
      .slice(0, 20);

    const tailwind = {
      darkMode: "class",
      theme: {
        extend: {
          colors: Object.fromEntries(
            Object.entries(roles)
              .filter(([, v]) => !!v.light && !!v.dark)
              .map(([role, v]) => [role, { DEFAULT: v.light, dark: v.dark }]),
          ),
        },
      },
    };

    return {
      available: true,
      roles,
      variables,
      pairedVarCount,
      audit: {
        missingInDark,
        missingInLight,
        coverage: pairedVarCount > 0 ? "paired" : "light-only-vars",
      },
      tailwind,
    };
  }
}

export function pairDarkMode(design: ModeDesign = {}): PairDarkModeResult {
  return new DarkModePairingCueExtractor().extract(design);
}
