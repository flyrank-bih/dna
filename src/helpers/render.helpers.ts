/**
 * @file render helpers
 * @description Shared rendering and formatting helpers for observers and generators.
 */

export function escapeHtml(value: unknown): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return String(value ?? "").replace(/[&<>"']/g, (char) => map[char] ?? char);
}

export function safeHost(url?: string): string {
  try {
    return url ? new URL(url).hostname : "unknown";
  } catch {
    return String(url ?? "unknown");
  }
}

export function take<T>(value: T[] | undefined | null, count: number): T[] {
  return (value || []).slice(0, count);
}

export function stringOrEmpty(value: unknown): string {
  return typeof value === "string" ? value : "";
}
