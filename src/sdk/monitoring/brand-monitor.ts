import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { safeName } from "../../helpers/general.helpers";
import { type BrandSnapshot, type MonitorAlert, type SnapshotDiff } from "./monitor.types";

interface SnapshotSource {
  meta?: { url?: string };
  colors?: { primary?: { hex?: string } | null };
  typography?: { families?: Array<{ name?: string } | string> };
  brandIdentity?: { primaryLogo?: { label?: string } | null };
  composition?: { heroPattern?: string };
  messagingArchitecture?: { headlineFormula?: string };
  interactionSignature?: { hoverTreatment?: string };
  benchmarkFingerprint?: Record<string, unknown>;
}

export function createBrandSnapshot(input: SnapshotSource): BrandSnapshot {
  const fontFamilies = (input.typography?.families || [])
    .map((family) => (typeof family === "string" ? family : family.name || ""))
    .filter(Boolean);

  return {
    url: input.meta?.url || "",
    createdAt: new Date().toISOString(),
    summary: {
      primaryColor: input.colors?.primary?.hex || null,
      fontFamilies,
      logoLabel: input.brandIdentity?.primaryLogo?.label || null,
      heroPattern: input.composition?.heroPattern || null,
      messagingFormula: input.messagingArchitecture?.headlineFormula || null,
      hoverTreatment: input.interactionSignature?.hoverTreatment || null,
    },
    benchmarkFingerprint: input.benchmarkFingerprint,
  };
}

export function compareBrandSnapshots(
  current: BrandSnapshot,
  previous: BrandSnapshot,
): SnapshotDiff {
  const changes: string[] = [];

  if (current.summary.primaryColor !== previous.summary.primaryColor) {
    changes.push("primaryColor");
  }
  if (
    JSON.stringify(current.summary.fontFamilies) !==
    JSON.stringify(previous.summary.fontFamilies)
  ) {
    changes.push("fontFamilies");
  }
  if (current.summary.logoLabel !== previous.summary.logoLabel) {
    changes.push("logoLabel");
  }
  if (current.summary.heroPattern !== previous.summary.heroPattern) {
    changes.push("heroPattern");
  }
  if (current.summary.messagingFormula !== previous.summary.messagingFormula) {
    changes.push("messagingFormula");
  }
  if (current.summary.hoverTreatment !== previous.summary.hoverTreatment) {
    changes.push("hoverTreatment");
  }

  const score = changes.length / 6;
  return {
    changed: changes.length > 0,
    changes,
    score,
  };
}

export function buildMonitorAlerts(diff: SnapshotDiff): MonitorAlert[] {
  if (!diff.changed) {
    return [];
  }
  const severity: MonitorAlert["severity"] =
    diff.score >= 0.5 ? "critical" : diff.score >= 0.2 ? "warning" : "info";
  return [
    {
      severity,
      message: `Brand snapshot drift detected (${diff.changes.join(", ")})`,
      changes: diff.changes,
    },
  ];
}

export function persistSnapshot(
  snapshot: BrandSnapshot,
  directory: string,
): string {
  mkdirSync(directory, { recursive: true });
  const filePath = join(
    directory,
    `${safeName(snapshot.url || "snapshot")}-${Date.now()}.json`,
  );
  writeFileSync(filePath, JSON.stringify(snapshot, null, 2), "utf-8");
  return filePath;
}
