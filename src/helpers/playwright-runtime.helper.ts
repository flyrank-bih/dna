import chromium from "@sparticuz/chromium";
import { chromium as playwrightChromium } from "playwright-core";

interface LaunchChromiumOptions {
  headless?: boolean;
  executablePath?: string;
  args?: string[];
  channel?: string;
  maxLaunchAttempts?: number;
}

let executablePathMemo: Promise<string | undefined> | null = null;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableSpawnError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message || "";
  return (
    message.includes("spawn ETXTBSY") ||
    message.includes("spawn EBUSY") ||
    message.includes("spawn ENOENT") ||
    message.includes("spawn ENOEXEC")
  );
}

function isExecFormatError(error: unknown): boolean {
  return error instanceof Error && (error.message || "").includes("spawn ENOEXEC");
}

function getFallbackChannel(explicitChannel?: string): string | undefined {
  if (explicitChannel) return explicitChannel;
  if (process.env.PLAYWRIGHT_CHROMIUM_CHANNEL) {
    return process.env.PLAYWRIGHT_CHROMIUM_CHANNEL;
  }
  // Helpful default for local macOS/Windows dev where Sparticuz binary is not usable.
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
  const maxLaunchAttempts = Math.max(1, options.maxLaunchAttempts ?? 4);
  const explicitExecutablePath =
    options.executablePath || process.env.CHROME_EXECUTABLE_PATH;
  const executablePath = await resolveExecutablePath(explicitExecutablePath);
  const baseArgs = Array.isArray(chromium.args) ? chromium.args : [];
  const userArgs = options.args || [];
  const fallbackChannel = getFallbackChannel(options.channel);
  let lastError: unknown = null;
  let useSparticuzBinary = true;

  for (let attempt = 1; attempt <= maxLaunchAttempts; attempt++) {
    try {
      const launchWithSparticuz = useSparticuzBinary && Boolean(executablePath);
      const args = launchWithSparticuz ? [...baseArgs, ...userArgs] : userArgs;
      return await playwrightChromium.launch({
        headless: options.headless ?? true,
        args,
        ...(launchWithSparticuz ? { executablePath } : {}),
        ...(!launchWithSparticuz && fallbackChannel ? { channel: fallbackChannel } : {}),
      });
    } catch (error) {
      lastError = error;
      if (isExecFormatError(error)) {
        // Binary format mismatch (e.g. local dev on macOS). Fallback to channel launch.
        useSparticuzBinary = false;
      }
      if (!isRetryableSpawnError(error) || attempt >= maxLaunchAttempts) {
        throw error;
      }
      // /tmp/chromium can be briefly busy in concurrent serverless launches.
      await sleep(150 * attempt);
    }
  }

  throw lastError;
}

export { playwrightChromium };
