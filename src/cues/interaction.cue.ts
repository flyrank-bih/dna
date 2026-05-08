import { chromium, type ElementHandle, type Page } from "playwright";

interface InteractionCaptureOptions {
  width?: number;
  height?: number;
  wait?: number;
}

interface StyleDiff {
  from: string;
  to: string;
}

interface ElementState {
  text: string;
  display: string;
  styles: Record<string, string>;
}

interface StateDiffResult {
  hasChanges: boolean;
  hover: Record<string, StyleDiff>;
  focus: Record<string, StyleDiff>;
}

interface InteractionCaptureResult {
  buttons: Array<{ text: string; base: Record<string, string> } & StateDiffResult>;
  links: Array<{ text: string; base: Record<string, string> } & StateDiffResult>;
  inputs: Array<{ base: Record<string, string> } & StateDiffResult>;
}

export class InteractionCueCapture {
  private async getStyles(
    element: ElementHandle,
  ): Promise<ElementState | null> {
    return element.evaluate((el) => {
      const target = el as Element;
      const cs = getComputedStyle(target);
      if (cs.display === "none" || cs.visibility === "hidden") return null;
      return {
        text: target.textContent?.trim().slice(0, 30) || "",
        display: cs.display,
        styles: {
          color: cs.color,
          backgroundColor: cs.backgroundColor,
          borderColor: cs.borderColor,
          boxShadow: cs.boxShadow,
          transform: cs.transform,
          opacity: cs.opacity,
          outline: cs.outline,
          textDecoration: cs.textDecoration,
          scale: cs.scale,
        },
      };
    });
  }

  private diffStates(
    base: ElementState,
    hover: ElementState | null,
    focus: ElementState | null,
  ): StateDiffResult {
    const result: StateDiffResult = { hasChanges: false, hover: {}, focus: {} };
    const applyDiff = (
      target: Record<string, StyleDiff>,
      current: ElementState | null,
    ): void => {
      if (!current) return;
      for (const [prop, value] of Object.entries(current.styles)) {
        if (value !== base.styles[prop] && value !== "none" && value !== "auto") {
          target[prop] = { from: base.styles[prop], to: value };
          result.hasChanges = true;
        }
      }
    };

    applyDiff(result.hover, hover);
    applyDiff(result.focus, focus);
    return result;
  }

  async capture(
    url: string,
    options: InteractionCaptureOptions = {},
  ): Promise<InteractionCaptureResult> {
    const { width = 1280, height = 800, wait = 0 } = options;
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();

    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForLoadState("networkidle").catch(() => undefined);
      if (wait > 0) await page.waitForTimeout(wait);
      await page.evaluate(() => document.fonts.ready).catch(() => undefined);

      const results: InteractionCaptureResult = { buttons: [], links: [], inputs: [] };
      await this.captureButtons(page, results);
      await this.captureLinks(page, results);
      await this.captureInputs(page, results);
      return results;
    } finally {
      await browser.close();
    }
  }

  private async captureButtons(page: Page, results: InteractionCaptureResult) {
    const buttons = await page.$$('button, [role="button"], a[class*="btn"]');
    for (const button of buttons.slice(0, 10)) {
      try {
        const base = await this.getStyles(button);
        if (!base || base.display === "none") continue;
        await button.hover();
        await page.waitForTimeout(100);
        const hover = await this.getStyles(button);
        await button.focus();
        await page.waitForTimeout(100);
        const focus = await this.getStyles(button);
        const diffs = this.diffStates(base, hover, focus);
        if (diffs.hasChanges) {
          results.buttons.push({ text: base.text, base: base.styles, ...diffs });
        }
      } catch {
        continue;
      }
    }
  }

  private async captureLinks(page: Page, results: InteractionCaptureResult) {
    const links = await page.$$('a:not([role="button"]):not([class*="btn"])');
    for (const link of links.slice(0, 10)) {
      try {
        const base = await this.getStyles(link);
        if (!base || base.display === "none") continue;
        await link.hover();
        await page.waitForTimeout(100);
        const hover = await this.getStyles(link);
        const diffs = this.diffStates(base, hover, null);
        if (diffs.hasChanges) {
          results.links.push({ text: base.text, base: base.styles, ...diffs });
          break;
        }
      } catch {
        continue;
      }
    }
  }

  private async captureInputs(page: Page, results: InteractionCaptureResult) {
    const inputs = await page.$$(
      'input[type="text"], input[type="email"], input[type="search"], textarea',
    );
    for (const input of inputs.slice(0, 5)) {
      try {
        const base = await this.getStyles(input);
        if (!base || base.display === "none") continue;
        await input.focus();
        await page.waitForTimeout(100);
        const focus = await this.getStyles(input);
        const diffs = this.diffStates(base, null, focus);
        if (diffs.hasChanges) {
          results.inputs.push({ base: base.styles, ...diffs });
          break;
        }
      } catch {
        continue;
      }
    }
  }
}

export async function captureInteractions(
  url: string,
  options: InteractionCaptureOptions = {},
) {
  return new InteractionCueCapture().capture(url, options);
}
