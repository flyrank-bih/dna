export interface CssDesignInput {
  colors: {
    primary?: { hex: string };
    secondary?: { hex: string };
    accent?: { hex: string };
    neutrals: Array<{ hex: string }>;
    backgrounds: string[];
    text: string[];
  };
  typography: {
    families: Array<{
      name: string;
      usage?: "headings" | "body" | "mono" | string;
    }>;
    scale: Array<{ size: number }>;
  };
  spacing: {
    scale: number[];
  };
  borders: {
    radii: Array<{ label: string; value: number }>;
  };
  shadows: {
    values: Array<{ label: string; raw: string }>;
  };
  variables: Record<string, Record<string, string>>;
}

export interface CssVarsObserver {
  format(design: CssDesignInput): string;
}

function indent(line: string, level = 1): string {
  return `${"  ".repeat(level)}${line}`;
}

export const DefaultCssVarsObserver: CssVarsObserver = {
  format(design: CssDesignInput): string {
    const out: string[] = [":root {"];

    out.push(indent("/* Colors — Primary */"));
    if (design.colors.primary)
      out.push(indent(`--color-primary: ${design.colors.primary.hex};`));
    if (design.colors.secondary)
      out.push(indent(`--color-secondary: ${design.colors.secondary.hex};`));
    if (design.colors.accent)
      out.push(indent(`--color-accent: ${design.colors.accent.hex};`));
    out.push("");

    if (design.colors.neutrals?.length) {
      out.push(indent("/* Colors — Neutrals */"));
      design.colors.neutrals.slice(0, 10).forEach((c, i) => {
        const key = i === 0 ? 50 : (i + 1) * 100;
        out.push(indent(`--color-neutral-${key}: ${c.hex};`));
      });
      out.push("");
    }

    if (design.colors.backgrounds?.length) {
      out.push(indent("/* Colors — Backgrounds */"));
      design.colors.backgrounds.forEach((c, i) => {
        out.push(indent(`--color-bg${i === 0 ? "" : `-${i}`}: ${c};`));
      });
      out.push("");
    }

    if (design.colors.text?.length) {
      out.push(indent("/* Colors — Text */"));
      design.colors.text.slice(0, 5).forEach((c, i) => {
        out.push(indent(`--color-text${i === 0 ? "" : `-${i}`}: ${c};`));
      });
      out.push("");
    }

    if (design.typography.families?.length) {
      out.push(indent("/* Typography — Families */"));

      design.typography.families.forEach((f, i) => {
        let key = "font";

        if (f.usage === "headings") key = "heading";
        else if (f.usage === "body") key = "body";
        else if (f.name.toLowerCase().includes("mono")) key = "mono";
        else key = i === 0 ? "sans" : `font-${i}`;

        out.push(indent(`--font-${key}: '${f.name}', sans-serif;`));
      });

      out.push("");
    }

    if (design.typography.scale?.length) {
      out.push(indent("/* Typography — Scale */"));
      design.typography.scale.slice(0, 12).forEach((s) => {
        out.push(indent(`--font-size-${s.size}: ${s.size}px;`));
      });
      out.push("");
    }

    if (design.spacing.scale?.length) {
      out.push(indent("/* Spacing */"));
      design.spacing.scale.slice(0, 20).forEach((v) => {
        out.push(indent(`--spacing-${v}: ${v}px;`));
      });
      out.push("");
    }

    if (design.borders.radii?.length) {
      out.push(indent("/* Border Radius */"));
      design.borders.radii.forEach((r) => {
        out.push(indent(`--radius-${r.label}: ${r.value}px;`));
      });
      out.push("");
    }

    if (design.shadows.values?.length) {
      out.push(indent("/* Shadows */"));
      design.shadows.values.forEach((s) => {
        out.push(indent(`--shadow-${s.label}: ${s.raw};`));
      });
      out.push("");
    }

    const vars = Object.entries(design.variables ?? {}).filter(
      ([, v]) => Object.keys(v).length > 0,
    );

    if (vars.length) {
      out.push(indent("/* Original Site Variables */"));

      for (const [group, entries] of vars) {
        out.push(indent(`/* ${group} */`));

        for (const [k, v] of Object.entries(entries)) {
          out.push(indent(`${k}: ${v};`));
        }
      }

      out.push("");
    }

    out.push("}");
    return out.join("\n");
  },
};
