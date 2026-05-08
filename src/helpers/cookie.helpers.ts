import { readFileSync } from "node:fs";

type Cookie = {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  expires?: number;
  url?: string;
};

function parseNetscape(text: string, targetUrl?: string): Cookie[] {
  const cookies: Cookie[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || (line.startsWith("#") && !line.startsWith("#HttpOnly_"))) continue;
    const parts = raw.split("\t");
    if (parts.length < 7) continue;
    const [domain, , path, secure, expires, name, value] = parts;
    if (!name) continue;
    const cookie: Cookie = {
      name,
      value: value ?? "",
      domain: domain.replace(/^#HttpOnly_/i, ""),
      path: path || "/",
      secure: secure === "TRUE",
      httpOnly: /^#HttpOnly_/i.test(domain),
    };
    const exp = Number(expires);
    if (Number.isFinite(exp) && exp > 0) cookie.expires = exp;
    if (!cookie.domain && targetUrl) cookie.url = targetUrl;
    cookies.push(cookie);
  }
  return cookies;
}

function parseJson(text: string): Cookie[] {
  const parsed = JSON.parse(text);
  if (parsed && Array.isArray(parsed.cookies)) return parsed.cookies;
  if (Array.isArray(parsed)) return parsed;
  throw new Error("cookie file: JSON must be a cookie array or Playwright storageState");
}

export function loadCookiesFromFile(filePath: string, targetUrl?: string): Cookie[] {
  const text = readFileSync(filePath, "utf-8");
  const trimmed = text.trimStart();
  return trimmed.startsWith("{") || trimmed.startsWith("[") ? parseJson(text) : parseNetscape(text, targetUrl);
}

export function mergeCookies(cliCookies: (string | Cookie)[] = [], fileCookies: Cookie[] = [], targetUrl?: string): Cookie[] {
  const seen = new Map<string, Cookie>();
  const parseCli = (c: string | Cookie): Cookie =>
    typeof c === "string"
      ? { name: c.split("=")[0], value: c.split("=").slice(1).join("="), url: targetUrl }
      : c;
  for (const c of [...cliCookies.map(parseCli), ...fileCookies]) {
    if (!c?.name) continue;
    seen.set(`${c.name}|${c.domain || c.url || ""}`, c);
  }
  return [...seen.values()];
}
