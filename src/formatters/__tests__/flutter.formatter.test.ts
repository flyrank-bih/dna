import { describe, expect, it } from "@rstest/core";
import { formatFlutterDart } from "../flutter.formatter";

describe("formatFlutterDart", () => {
  it("generates Dart tokens and theme helper from design tokens", () => {
    const output = formatFlutterDart({
      $metadata: { source: "https://example.com" },
      semantic: {
        color: {
          action: {
            primary: { $value: "#112233", $type: "color" },
          },
        },
      },
      primitive: {
        color: {
          brand: { $value: "#334455", $type: "color" },
        },
        spacing: {
          md: { $value: "16px", $type: "dimension" },
        },
        radius: {
          sm: { $value: "4px", $type: "dimension" },
        },
      },
    });

    expect(output).toContain("class DesignTokens");
    expect(output).toContain("static const Color actionPrimary = Color(0xFF112233);");
    expect(output).toContain("ThemeData buildFlyRankVisualDnaTheme()");
  });
});
