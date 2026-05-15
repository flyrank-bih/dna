import chromium from "@sparticuz/chromium-min";
import { chromium as playwrightChromium } from "playwright-core";

// Override via CHROMIUM_PACK_URL env var to use a self-hosted or CDN-cached binary.
const CHROMIUM_PACK_URL =
  process.env.CHROMIUM_PACK_URL ??
  "https://github.com/Sparticuz/chromium/releases/download/v148.0.0/chromium-v148.0.0-pack.tar";

interface LaunchChromiumOptions {
  headless?: boolean;
  args?: string[];
  maxLaunchAttempts?: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableSpawnError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message || "";
  return msg.includes("spawn ETXTBSY") || msg.includes("spawn EBUSY");
}

export async function launchChromium(options: LaunchChromiumOptions = {}) {
  const maxAttempts = Math.max(1, options.maxLaunchAttempts ?? 3);
  const executablePath = await chromium.executablePath(CHROMIUM_PACK_URL);
  const args = [...(Array.isArray(chromium.args) ? chromium.args : []), ...(options.args ?? [])];

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await playwrightChromium.launch({
        headless: options.headless ?? true,
        executablePath,
        args,
      });
    } catch (error) {
      lastError = error;
      if (isRetryableSpawnError(error) && attempt < maxAttempts) {
        await sleep(150 * attempt);
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}

export { playwrightChromium };
