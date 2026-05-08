import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import {
  formatBrandMatrix,
  formatBrandMatrixHtml,
  type BrandBenchmarkResult,
} from "./multibrand.action";
import { type ActionHandler } from "./action.protocol";

export interface CategoryPackOptions {
  outDir: string;
}

export interface CategoryPackResult {
  dir: string;
  files: string[];
}

function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, JSON.stringify(value, null, 2), "utf-8");
}

function writeText(path: string, value: string): void {
  writeFileSync(path, value, "utf-8");
}

function safeSlug(value: string): string {
  return value.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();
}

function buildPositioningMap(
  result: BrandBenchmarkResult,
): Array<{
  hostname: string;
  premium: string;
  narrative: string;
  expression: string;
  archetype: string;
  distinctiveness: number;
}> {
  return result.brands
    .filter(
      (brand): brand is NonNullable<typeof brand> &
        Required<Pick<typeof brand, "hostname" | "positioning" | "archetype" | "distinctiveness">> =>
        Boolean(
          brand.positioning &&
            brand.archetype &&
            brand.distinctiveness,
        ),
    )
    .map((brand) => ({
      hostname: brand.hostname,
      premium: brand.positioning.premium,
      narrative: brand.positioning.narrative,
      expression: brand.positioning.expression,
      archetype: brand.archetype.primary,
      distinctiveness: brand.distinctiveness.overall,
    }));
}

export class BuildCategoryPackAction
  implements
    ActionHandler<
      [result: BrandBenchmarkResult, opts: CategoryPackOptions],
      CategoryPackResult
    >
{
  run(
    result: BrandBenchmarkResult,
    opts: CategoryPackOptions,
  ): CategoryPackResult {
    const outDir = opts.outDir;
    const files: string[] = [];
    ensureDir(outDir);

    const cardDir = join(outDir, "brand-cards");
    ensureDir(cardDir);

    const overviewPath = join(outDir, "benchmark-overview.json");
    writeJson(overviewPath, {
      brandCount: result.brands.length,
      baseline: result.baseline,
      topSharedPatterns: result.topSharedPatterns,
      topUniqueSignals: result.topUniqueSignals,
    });
    files.push(overviewPath);

    const similarityPath = join(outDir, "similarity-matrix.json");
    writeJson(similarityPath, result.similarityMatrix);
    files.push(similarityPath);

    const baselinePath = join(outDir, "category-baseline.json");
    writeJson(baselinePath, result.baseline);
    files.push(baselinePath);

    const whitespacePath = join(outDir, "whitespace-opportunities.json");
    writeJson(whitespacePath, result.whitespace);
    files.push(whitespacePath);

    const positioningPath = join(outDir, "brand-positioning-map.json");
    writeJson(positioningPath, buildPositioningMap(result));
    files.push(positioningPath);

    const summaryPath = join(outDir, "competitive-summary.md");
    writeText(summaryPath, formatBrandMatrix(result));
    files.push(summaryPath);

    const summaryHtmlPath = join(outDir, "competitive-summary.html");
    writeText(summaryHtmlPath, formatBrandMatrixHtml(result));
    files.push(summaryHtmlPath);

    for (const brand of result.brands) {
      const brandPath = join(cardDir, `${safeSlug(brand.hostname)}.json`);
      writeJson(brandPath, brand);
      files.push(brandPath);
    }

    return { dir: outDir, files };
  }
}

export function buildCategoryPack(
  result: BrandBenchmarkResult,
  opts: CategoryPackOptions,
): CategoryPackResult {
  return new BuildCategoryPackAction().run(result, opts);
}
