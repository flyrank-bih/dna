import { describe, expect, it } from "@rstest/core";
import { formatWordPress, formatWordPressTheme } from "../wordpress.formatter";

describe("wordpress formatters", () => {
  it("generates block theme file set", () => {
    const files = formatWordPressTheme(
      {
        semantic: {
          color: {
            surface: { default: { $value: "#ffffff", $type: "color" } },
            text: { body: { $value: "#111111", $type: "color" } },
          },
        },
        primitive: {
          spacing: {
            md: { $value: "16px", $type: "dimension" },
          },
        },
      },
      {
        meta: { url: "https://example.com" },
        typography: { families: [{ name: "Inter" }], scale: [{ size: 16 }] },
        colors: { primary: { hex: "#4f46e5" }, neutrals: [], backgrounds: ["#fff"], text: ["#111"] },
        spacing: { scale: [8, 16] },
      },
    );

    expect(files["theme.json"]).toContain("\"version\": 3");
    expect(files["style.css"]).toContain("Theme Name:");
    expect(files["functions.php"]).toContain("add_theme_support");
  });

  it("generates simplified wordpress theme JSON", () => {
    const json = formatWordPress({
      colors: { primary: { hex: "#4f46e5" }, neutrals: [], backgrounds: ["#fff"], text: ["#111"] },
      typography: { families: [{ name: "Inter" }], scale: [{ size: 16 }], body: { size: 16, lineHeight: "1.5" } },
      spacing: { scale: [8, 16] },
    });

    expect(json).toContain("\"version\": 3");
    expect(json).toContain("\"palette\"");
  });
});
