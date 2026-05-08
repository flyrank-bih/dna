export interface BrandSnapshot {
  url: string;
  createdAt: string;
  summary: {
    primaryColor: string | null;
    fontFamilies: string[];
    logoLabel: string | null;
    heroPattern: string | null;
    messagingFormula: string | null;
    hoverTreatment: string | null;
  };
  benchmarkFingerprint?: Record<string, unknown>;
}

export interface SnapshotDiff {
  changed: boolean;
  changes: string[];
  score: number;
}

export interface MonitorAlert {
  severity: "info" | "warning" | "critical";
  message: string;
  changes: string[];
}
