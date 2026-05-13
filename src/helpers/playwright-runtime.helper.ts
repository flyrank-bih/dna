import chromium from "@sparticuz/chromium";
import { chromium as playwrightChromium } from "playwright-core";

interface LaunchChromiumOptions {
  headless?: boolean;
  executablePath?: string;
  args?: string[];
  channel?: string;
  maxLaunchAttempts?: number;
}

interface LaunchParams {
  executablePath?: string;
  channel?: string;
  args: string[];
}

let executablePathMemo: Promise<string | undefined> | null = null;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableSpawnError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message || "";
  return (
    msg.includes("spawn ETXTBSY") ||
    msg.includes("spawn EBUSY") ||
    msg.includes("spawn ENOENT") ||
    msg.includes("spawn ENOEXEC")
  );
}

function isBinaryUnusableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message || "";
  return (
    // macOS / Windows running a Linux binary
    msg.includes("spawn ENOEXEC") ||
    // Missing shared library (e.g. libnspr4.so on non-AL2 Linux)
    msg.includes("cannot open shared object file") ||
    msg.includes("error while loading shared libraries") ||
    msg.includes("exitCode=127, signal=null") ||
    msg.includes("process did exit: exitCode=127")
  );
}

function getFallbackChannel(explicitChannel?: string): string | undefined {
  if (explicitChannel) return explicitChannel;
  if (process.env.PLAYWRIGHT_CHROMIUM_CHANNEL) {
    return process.env.PLAYWRIGHT_CHROMIUM_CHANNEL;
  }
  if (process.platform === "darwin" || process.platform === "win32") {
    return "chrome";
  }
  return undefined;
}

async function resolveExecutablePath(
  explicitExecutablePath?: string,
): Promise<string | undefined> {
  if (explicitExecutablePath) return explicitExecutablePath;
  if (executablePathMemo) return executablePathMemo;
  executablePathMemo = (async () => {
    try {
      return await chromium.executablePath();
    } catch {
      return undefined;
    }
  })();
  try {
    return await executablePathMemo;
  } catch {
    return undefined;
  } finally {
    executablePathMemo = null;
  }
}

export async function launchChromium(
  options: LaunchChromiumOptions = {},
) {
  const maxRetriesPerStrategy = Math.max(1, options.maxLaunchAttempts ?? 4);
  const explicitExecutablePath =
    options.executablePath || process.env.CHROME_EXECUTABLE_PATH;
  const executablePath = await resolveExecutablePath(explicitExecutablePath);
  const baseArgs = Array.isArray(chromium.args) ? chromium.args : [];
  const userArgs = options.args || [];
  const fallbackChannel = getFallbackChannel(options.channel);

  // Strategy cascade: Sparticuz binary → Playwright native → system channel
  const strategies: LaunchParams[] = [];
  if (executablePath) {
    strategies.push({ executablePath, args: [...baseArgs, ...userArgs] });
  }
  // Playwright's own downloaded Chromium (works after `playwright install chromium`
  // or in environments that pre-install Playwright browsers in the image).
  strategies.push({ args: userArgs });
  if (fallbackChannel) {
    strategies.push({ channel: fallbackChannel, args: userArgs });
  }

  let lastError: unknown;

  for (const strategy of strategies) {
    for (let attempt = 1; attempt <= maxRetriesPerStrategy; attempt++) {
      try {
        return await playwrightChromium.launch({
          headless: options.headless ?? true,
          ...strategy,
        });
      } catch (error) {
        lastError = error;

        if (isBinaryUnusableError(error)) {
          // This binary can't run on this host — skip to the next strategy immediately.
          break;
        }

        if (isRetryableSpawnError(error) && attempt < maxRetriesPerStrategy) {
          // /tmp/chromium can be briefly busy in concurrent serverless launches.
          await sleep(150 * attempt);
          continue;
        }

        // Non-retryable, non-binary error (e.g. Playwright browser not installed for
        // the native strategy) — fall through to the next strategy.
        break;
      }
    }
  }

  throw lastError;
}

export { playwrightChromium };
