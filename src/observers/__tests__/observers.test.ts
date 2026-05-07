import { describe, expect, it } from "@rstest/core";
import { VisualDNAReportObserver } from "../dtcg.observer";
import { FlyRankMotionTokensObserver } from "../motion.observer";
import { FlyRankVisualDNAPreviewObserver } from "../preview.observer";

describe("observers", () => {
  it("renders report observer outputs", () => {
    const report = VisualDNAReportObserver.format({
      meta: { url: "https://example.com" },
      score: {
        overall: 86,
        grade: "A",
        scores: {
          colorDiscipline: 90,
          typographyConsistency: 84,
          spacingSystem: 79,
        },
        strengths: ["Consistent typography"],
        issues: ["Minor spacing drift"],
      },
    });

    expect(report.html).toContain("Visual DNA Report");
    expect(report.html).toContain("86/100 System Score");
    expect(report.markdown).toContain("FlyRank Visual DNA Report");
    expect(report.markdown).toContain("example.com");
  });

  it("builds motion tokens and preview html", () => {
    const motion = FlyRankMotionTokensObserver.format({
      durations: [{ name: "fast", css: "120ms", ms: 120 }],
      easings: [{ family: "standard", raw: "cubic-bezier(0.2,0,0,1)" }],
      springs: [{ raw: "cubic-bezier(0.34,1.56,0.64,1)" }],
      feel: "snappy",
      scrollLinked: { present: true },
    });

    const preview = FlyRankVisualDNAPreviewObserver.format({
      meta: { title: "<Injected>", url: "https://example.com" },
      colors: { all: ["#112233"] },
      typography: { families: ["Inter"] },
      spacing: { scale: [4, 8, 12] },
      components: { Button: {} },
    });

    expect(motion.duration.fast.$value).toBe("120ms");
    expect(motion.$meta.scrollLinked).toBe(true);
    expect(preview).toContain("&lt;Injected&gt;");
    expect(preview).toContain("Color System");
  });
});
