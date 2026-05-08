interface AuditInput {
  colors?: {
    all?: Array<{ hex?: string }>;
    primary?: { hex?: string } | null;
  };
  typography?: {
    families?: Array<{ name?: string } | string>;
  };
  brandIdentity?: {
    lockup?: string;
    themeColor?: string | null;
    primaryLogo?: { label?: string } | null;
    alternateLogos?: unknown[];
  };
  composition?: {
    heroPattern?: string;
    density?: string;
    pacing?: string;
  };
  interactionSignature?: {
    hoverTreatment?: string;
    consistency?: string;
  };
  messagingArchitecture?: {
    headlineFormula?: string;
    proofModules?: string[];
  };
  themeRelationships?: {
    hasDarkMode?: boolean;
    themeFamilies?: string[];
  };
}

export interface BrandAuditResult {
  summary: string;
  strengths: string[];
  risks: string[];
  evidence: string[];
  metrics: Record<string, number | string | boolean | null>;
}

function fontNames(families: Array<{ name?: string } | string> = []): string[] {
  return families
    .map((family) => (typeof family === "string" ? family : family.name || ""))
    .filter(Boolean);
}

export function analyzeBrandIdentityAudit(input: AuditInput): BrandAuditResult {
  const colors = input.colors?.all || [];
  const typography = fontNames(input.typography?.families);
  const proofCount = input.messagingArchitecture?.proofModules?.length || 0;
  const strengths: string[] = [];
  const risks: string[] = [];
  const evidence: string[] = [];

  if (input.brandIdentity?.primaryLogo) {
    strengths.push("Primary logo signal is detected.");
    evidence.push(`Logo: ${input.brandIdentity.primaryLogo.label || "present"}`);
  } else {
    risks.push("Primary logo signal is weak or missing.");
  }

  if (input.brandIdentity?.themeColor || input.colors?.primary?.hex) {
    strengths.push("Brand color anchor is present.");
    evidence.push(
      `Theme color: ${input.brandIdentity?.themeColor || input.colors?.primary?.hex || "unknown"}`,
    );
  } else {
    risks.push("Primary brand color is not clearly anchored.");
  }

  if (typography.length >= 1 && typography.length <= 3) {
    strengths.push("Typography system is compact enough for strong brand recall.");
  } else if (typography.length > 4) {
    risks.push("Typography family count may be too broad for a tight brand system.");
  }

  if (input.interactionSignature?.consistency === "high") {
    strengths.push("Interaction behavior appears consistent.");
  } else if (input.interactionSignature?.consistency === "low") {
    risks.push("Interaction signature looks inconsistent.");
  }

  if (input.themeRelationships?.hasDarkMode) {
    strengths.push("Theme system includes dark-mode support.");
  }

  if (proofCount === 0) {
    risks.push("Proof system is light; credibility may rely too much on visuals.");
  }

  evidence.push(`Colors detected: ${colors.length}`);
  evidence.push(`Fonts detected: ${typography.join(", ") || "none"}`);
  evidence.push(
    `Composition: ${input.composition?.heroPattern || "unknown"} / ${input.composition?.pacing || "unknown"}`,
  );

  return {
    summary:
      strengths.length >= risks.length
        ? "Brand identity appears reasonably coherent with visible anchors."
        : "Brand identity shows useful signals but needs stronger consistency anchors.",
    strengths,
    risks,
    evidence,
    metrics: {
      colorCount: colors.length,
      typographyFamilies: typography.length,
      proofModules: proofCount,
      hasDarkMode: Boolean(input.themeRelationships?.hasDarkMode),
      interactionConsistency: input.interactionSignature?.consistency || null,
    },
  };
}

export function analyzeDesignConsistencyAudit(
  input: AuditInput,
): BrandAuditResult {
  const strengths: string[] = [];
  const risks: string[] = [];
  const evidence: string[] = [];
  const themeFamilies = input.themeRelationships?.themeFamilies || [];

  if (themeFamilies.length >= 2) {
    strengths.push("Theme relationships suggest a reusable design system.");
  } else {
    risks.push("Theme family structure looks shallow.");
  }

  if (input.composition?.density === "balanced") {
    strengths.push("Layout density appears controlled.");
  } else if (input.composition?.density === "compact") {
    risks.push("Dense layout may reduce perceived clarity.");
  }

  if (input.messagingArchitecture?.headlineFormula) {
    strengths.push("Messaging has a detectable structural pattern.");
    evidence.push(`Headline formula: ${input.messagingArchitecture.headlineFormula}`);
  }

  if (input.interactionSignature?.hoverTreatment === "static") {
    risks.push("Interaction language may be too quiet to reinforce the brand.");
  }

  evidence.push(`Theme families: ${themeFamilies.join(", ") || "none"}`);
  evidence.push(`Density: ${input.composition?.density || "unknown"}`);
  evidence.push(`Pacing: ${input.composition?.pacing || "unknown"}`);

  return {
    summary:
      risks.length === 0
        ? "Design consistency looks healthy across the extracted visual system."
        : "Design consistency is usable but has visible gaps worth tightening.",
    strengths,
    risks,
    evidence,
    metrics: {
      themeFamilies: themeFamilies.length,
      density: input.composition?.density || null,
      pacing: input.composition?.pacing || null,
      hoverTreatment: input.interactionSignature?.hoverTreatment || null,
    },
  };
}

export function analyzeVisualSystemAudit(input: AuditInput): BrandAuditResult {
  const identity = analyzeBrandIdentityAudit(input);
  const consistency = analyzeDesignConsistencyAudit(input);
  return {
    summary: `${identity.summary} ${consistency.summary}`.trim(),
    strengths: [...identity.strengths, ...consistency.strengths],
    risks: [...identity.risks, ...consistency.risks],
    evidence: [...identity.evidence, ...consistency.evidence],
    metrics: {
      ...identity.metrics,
      ...consistency.metrics,
    },
  };
}
