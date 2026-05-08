import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { extractDesignLanguage } from "..";
import { formatTailwind } from "@/generators/tailwind.generator";
import { formatShadcnTheme } from "@/generators/theme.generators";
import { formatCssVars } from "@/formatters/css.formatter";
import { type ActionHandler } from "./action.protocol";

export type ApplyFramework = "tailwind" | "shadcn" | "css" | "auto";

export interface ApplyDesignOptions {
  dir?: string;
  framework?: ApplyFramework;
  [key: string]: unknown;
}

export interface AppliedFile {
  file: string;
  type: "tailwind" | "shadcn" | "css-variables";
}

export interface ApplyDesignResult {
  design: unknown;
  applied: AppliedFile[];
  framework: ApplyFramework;
}

type TailwindDesignInput = Parameters<typeof formatTailwind>[0];
type ShadcnDesignInput = Parameters<typeof formatShadcnTheme>[0];
type CssVarsDesignInput = Parameters<typeof formatCssVars>[0];

class FileResolver {
  findFirst(dir: string, candidates: string[]): string | null {
    for (const candidate of candidates) {
      const filePath = join(dir, candidate);
      if (existsSync(filePath)) return filePath;
    }
    return null;
  }
}

function detectFramework(dir: string, resolver: FileResolver): ApplyFramework {
  if (
    resolver.findFirst(dir, [
      "tailwind.config.js",
      "tailwind.config.ts",
      "tailwind.config.mjs",
    ])
  ) {
    if (resolver.findFirst(dir, ["components.json"])) return "shadcn";
    return "tailwind";
  }
  return "auto";
}

export async function applyDesignToProject(
  design: unknown,
  options: ApplyDesignOptions = {},
  resolver: FileResolver = new FileResolver(),
): Promise<ApplyDesignResult> {
  const { dir = ".", framework } = options;
  const detected = framework || detectFramework(dir, resolver);
  const applied: AppliedFile[] = [];

  if (detected === "tailwind" || detected === "auto" || detected === "shadcn") {
    const tailwindPath = resolver.findFirst(dir, [
      "tailwind.config.js",
      "tailwind.config.ts",
      "tailwind.config.mjs",
    ]);
    if (tailwindPath) {
      writeFileSync(
        tailwindPath,
        formatTailwind(design as TailwindDesignInput),
        "utf-8",
      );
      applied.push({ file: tailwindPath, type: "tailwind" });
    }
  }

  if (detected === "shadcn" || detected === "auto") {
    const globalsPath = resolver.findFirst(dir, [
      "app/globals.css",
      "src/app/globals.css",
      "styles/globals.css",
      "src/styles/globals.css",
      "src/index.css",
      "app/global.css",
    ]);
    if (globalsPath) {
      const existing = readFileSync(globalsPath, "utf-8");
      const shadcnVars = formatShadcnTheme(design as ShadcnDesignInput);
      const layerRegex = /@layer\s+base\s*\{[\s\S]*?\n\}/;
      const updated = layerRegex.test(existing)
        ? existing.replace(layerRegex, shadcnVars)
        : `${existing}\n\n${shadcnVars}`;
      writeFileSync(globalsPath, updated, "utf-8");
      applied.push({ file: globalsPath, type: "shadcn" });
    }
  }

  if (detected === "css" || detected === "auto") {
    const cssVarsContent = formatCssVars(design as CssVarsDesignInput);
    const cssPath = join(dir, "design-variables.css");
    writeFileSync(cssPath, cssVarsContent, "utf-8");
    applied.push({ file: cssPath, type: "css-variables" });
  }

  return { design, applied, framework: detected };
}

export class ApplyDesignAction
  implements ActionHandler<[design: unknown, options?: ApplyDesignOptions], Promise<ApplyDesignResult>>
{
  async run(
    design: unknown,
    options: ApplyDesignOptions = {},
  ): Promise<ApplyDesignResult> {
    return applyDesignToProject(design, options);
  }
}

export class ApplyDesignFromUrlAction
  implements ActionHandler<[url: string, options?: ApplyDesignOptions], Promise<ApplyDesignResult>>
{
  async run(
    url: string,
    options: ApplyDesignOptions = {},
  ): Promise<ApplyDesignResult> {
    const design = await extractDesignLanguage(url, options);
    return applyDesignToProject(design, options);
  }
}

export async function applyDesign(
  url: string,
  options: ApplyDesignOptions = {},
): Promise<ApplyDesignResult> {
  return new ApplyDesignFromUrlAction().run(url, options);
}
