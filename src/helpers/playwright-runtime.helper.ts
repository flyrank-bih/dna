import chromium from "@sparticuz/chromium";
import { chromium as playwrightChromium } from "playwright-core";

interface LaunchChromiumOptions {
  headless?: boolean;
  executablePath?: string;
  args?: string[];
  channel?: string;
}

async function resolveExecutablePath(
  explicitExecutablePath?: string,
): Promise<string | undefined> {
  if (explicitExecutablePath) return explicitExecutablePath;
  try {
    return await chromium.executablePath();
  } catch {
    return undefined;
  }
}

export async function launchChromium(
  options: LaunchChromiumOptions = {},
) {
  const executablePath = await resolveExecutablePath(options.executablePath);
  const baseArgs = Array.isArray(chromium.args) ? chromium.args : [];
  return playwrightChromium.launch({
    headless: options.headless ?? true,
    args: [...baseArgs, ...(options.args || [])],
    ...(executablePath ? { executablePath } : {}),
    ...(options.channel ? { channel: options.channel } : {}),
  });
}

export { playwrightChromium };
