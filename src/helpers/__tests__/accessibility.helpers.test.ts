import { describe, expect, it } from "@rstest/core";
import { _contrast, remediateFailingPairs } from "../a11y.helpers";
import { extractAccessibility } from "../accessibility.helpers";
import { parseColor, rgbToHex } from "../general.helpers";

describe("accessibility helper stack", () => {
  it("parses modern color and converts back to hex", () => {
    const parsed = parseColor("rgb(17 34 51 / 80%)");
    expect(parsed).toBeTruthy();
    if (!parsed) return;
    expect(rgbToHex(parsed)).toBe("#112233");
    expect(parsed.a).toBe(0.8);
  });

  it("proposes remediation for failing contrast pairs", () => {
    const result = remediateFailingPairs(
      [{ fg: "#777777", bg: "#ffffff", rule: "AA-normal" }],
      ["#333333", "#000000"],
    );
    expect(result[0]?.suggestion?.replace).toBe("fg");
    expect(result[0]?.suggestion?.newRatio).toBeGreaterThanOrEqual(4.5);
  });

  it("extracts accessibility score from computed styles", () => {
    const report = extractAccessibility([
      {
        tag: "p",
        hasText: true,
        color: "#000000",
        backgroundColor: "#ffffff",
        fontSize: "16px",
      },
      {
        tag: "p",
        hasText: true,
        color: "#777777",
        backgroundColor: "#ffffff",
        fontSize: "16px",
      },
    ]);

    expect(report.totalPairs).toBe(2);
    expect(report.failCount).toBeGreaterThan(0);
    expect(report.passCount).toBeGreaterThan(0);
  });

  it("keeps contrast helper stable for public compatibility", () => {
    expect(_contrast("#000000", "#ffffff")).toBeGreaterThanOrEqual(21);
  });
});
