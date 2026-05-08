import { type CueExtractor } from "./cue.protocol";

interface AnatomySlot {
  role?: string;
}

interface ComponentCandidate {
  kind?: string;
  variantHint?: string;
  sizeHint?: string;
  disabled?: boolean;
  css?: Record<string, unknown> | null;
  text?: string;
  slots?: AnatomySlot[];
}

interface AnatomyVariant {
  name: string;
  count: number;
  states: {
    default: { count: number; css: Record<string, unknown> | null };
    disabled: { count: number; css: Record<string, unknown> | null };
  };
  sizes: Array<{ name: string; count: number; css?: Record<string, unknown> | null }>;
  sampleText: string[];
}

interface AnatomyResult {
  kind: string;
  totalInstances: number;
  slots: Record<string, unknown>;
  dominantSlotShape: string;
  variants: AnatomyVariant[];
  props: { variant: string[]; size: string[]; disabled: boolean };
}

function slotFingerprint(slots: AnatomySlot[] = []): string {
  return slots.map((s) => s.role).join(">");
}

function inferSlots(
  slots: AnatomySlot[] = [],
  kind: string,
): Record<string, unknown> {
  const roles = new Set(slots.map((s) => s.role));
  if (kind === "button") {
    return {
      label: true,
      icon: roles.has("icon"),
      badge: roles.has("badge"),
    };
  }
  if (kind === "card") {
    return {
      heading: roles.has("heading"),
      description: roles.has("text"),
      media: roles.has("icon"),
      footer: slots.length > 3,
    };
  }
  if (kind === "input") {
    return { leading: roles.has("icon"), trailing: false };
  }
  return {};
}

function dominant(arr: string[]): string {
  const counts: Record<string, number> = {};
  for (const v of arr) counts[v] = (counts[v] || 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

export class ComponentAnatomyCueExtractor
  implements CueExtractor<[candidates: ComponentCandidate[]], AnatomyResult[]>
{
  extract(candidates: ComponentCandidate[] = []): AnatomyResult[] {
    const byKind: Record<string, ComponentCandidate[]> = {};
    for (const candidate of candidates) {
      const kind = candidate.kind || "other";
      (byKind[kind] ||= []).push(candidate);
    }

    const anatomies: AnatomyResult[] = [];
    for (const [kind, items] of Object.entries(byKind)) {
      if (items.length < 2) continue;

      const variantGroups: Record<string, ComponentCandidate[]> = {};
      for (const item of items) {
        const variant = item.variantHint || "default";
        (variantGroups[variant] ||= []).push(item);
      }

      const variants: AnatomyVariant[] = Object.entries(variantGroups)
        .map(([name, variantItems]) => {
          const sizes: Record<string, ComponentCandidate[]> = {};
          for (const item of variantItems) {
            const size = item.sizeHint || "default";
            (sizes[size] ||= []).push(item);
          }

          return {
            name,
            count: variantItems.length,
            states: {
              default: {
                count: variantItems.filter((entry) => !entry.disabled).length,
                css: variantItems.find((entry) => !entry.disabled)?.css || null,
              },
              disabled: {
                count: variantItems.filter((entry) => !!entry.disabled).length,
                css: variantItems.find((entry) => !!entry.disabled)?.css || null,
              },
            },
            sizes: Object.entries(sizes).map(([sizeName, sizeItems]) => ({
              name: sizeName,
              count: sizeItems.length,
              css: sizeItems[0]?.css || null,
            })),
            sampleText: variantItems
              .slice(0, 5)
              .map((entry) => entry.text)
              .filter((value): value is string => !!value),
          };
        })
        .sort((a, b) => b.count - a.count);

      anatomies.push({
        kind,
        totalInstances: items.length,
        slots: inferSlots(items[0]?.slots || [], kind),
        dominantSlotShape: dominant(items.map((item) => slotFingerprint(item.slots))),
        variants,
        props: {
          variant: Object.keys(variantGroups).filter((variant) => variant !== "default"),
          size: [
            ...new Set(
              items
                .map((item) => item.sizeHint)
                .filter((value): value is string => !!value),
            ),
          ],
          disabled: items.some((item) => !!item.disabled),
        },
      });
    }

    return anatomies.sort((a, b) => b.totalInstances - a.totalInstances);
  }
}

interface AnatomyOutput {
  kind: string;
  slots: Record<string, boolean>;
  props: { variant: string[]; size: string[]; disabled: boolean };
}

export class AnatomyStubFormatter
  implements CueExtractor<[anatomies: AnatomyOutput[]], string>
{
  extract(anatomies: AnatomyOutput[] = []): string {
    const lines = ["import * as React from 'react';", ""];
    for (const anatomy of anatomies) {
      const name = anatomy.kind.charAt(0).toUpperCase() + anatomy.kind.slice(1);
      const variantUnion = (
        anatomy.props.variant.length ? anatomy.props.variant : ["default"]
      )
        .map((variant) => `'${variant}'`)
        .join(" | ");
      const sizeUnion = (anatomy.props.size.length ? anatomy.props.size : ["md"])
        .map((size) => `'${size}'`)
        .join(" | ");
      lines.push(`export interface ${name}Props {`);
      lines.push(`  variant?: ${variantUnion};`);
      lines.push(`  size?: ${sizeUnion};`);
      if (anatomy.props.disabled) lines.push("  disabled?: boolean;");
      if (anatomy.slots.icon) lines.push("  leadingIcon?: React.ReactNode;");
      if (anatomy.slots.badge) lines.push("  badge?: React.ReactNode;");
      lines.push("  children?: React.ReactNode;");
      lines.push("}");
      lines.push("");
      lines.push(
        `export function ${name}({ variant = '${anatomy.props.variant[0] || "default"}', size = 'md', ...rest }: ${name}Props) {`,
      );
      lines.push(
        `  return React.createElement('${anatomy.kind === "input" ? "input" : anatomy.kind === "link" ? "a" : anatomy.kind === "card" ? "div" : "button"}', { 'data-variant': variant, 'data-size': size, ...rest });`,
      );
      lines.push("}");
      lines.push("");
    }
    return lines.join("\n");
  }
}

export function extractComponentAnatomy(
  candidates: ComponentCandidate[] = [],
): AnatomyResult[] {
  return new ComponentAnatomyCueExtractor().extract(candidates);
}

export function formatAnatomyStubs(anatomies: AnatomyOutput[] = []): string {
  return new AnatomyStubFormatter().extract(anatomies);
}
