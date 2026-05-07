import { describe, expect, it } from "@rstest/core";
import { formatIosSwiftUI } from "../swiftui.formatter";

describe("formatIosSwiftUI", () => {
  it("creates SwiftUI extensions for tokens", () => {
    const swift = formatIosSwiftUI({
      semantic: {
        color: {
          action: {
            primary: { $value: "#1D4ED8", $type: "color" },
          },
        },
      },
      primitive: {
        color: {
          brand: { $value: "#0EA5E9", $type: "color" },
        },
        spacing: {
          md: { $value: "16px", $type: "dimension" },
        },
      },
    });

    expect(swift).toContain("import SwiftUI");
    expect(swift).toContain("extension Color {");
    expect(swift).toContain("static let actionPrimary");
  });
});
