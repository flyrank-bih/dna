import { describe, expect, it } from "@rstest/core";
import { formatAndroidCompose } from "../jetpack-compose.formatter";

describe("formatAndroidCompose", () => {
  it("returns compose and XML resources", () => {
    const files = formatAndroidCompose({
      semantic: {
        color: {
          action: {
            primary: { $value: "#2255AA", $type: "color" },
          },
        },
      },
      primitive: {
        spacing: {
          md: { $value: "12px", $type: "dimension" },
        },
      },
    });

    expect(Object.keys(files).sort()).toEqual(["Theme.kt", "colors.xml", "dimens.xml"]);
    expect(files["Theme.kt"]).toContain("object FlyRankVisualDnaTokens");
    expect(files["colors.xml"]).toContain("<resources>");
    expect(files["dimens.xml"]).toContain("<dimen");
  });
});
