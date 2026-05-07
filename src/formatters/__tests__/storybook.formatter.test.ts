import { describe, expect, it } from "@rstest/core";
import { formatStorybook } from "../storybook.formatter";

describe("formatStorybook", () => {
  it("generates storybook project files", () => {
    const files = formatStorybook({
      meta: { title: "Acme", url: "https://example.com" },
      colors: { primary: { hex: "#2563eb" }, backgrounds: ["#fff"], text: ["#111"] },
      typography: { families: [{ name: "Inter" }] },
      borders: { radii: [{ label: "md", value: 8 }] },
      shadows: { values: [{ label: "md", raw: "0 4px 6px rgba(0,0,0,0.1)" }] },
      componentAnatomy: [
        {
          kind: "button",
          props: { variant: ["default"], size: ["md"] },
          totalInstances: 5,
        },
      ],
    });

    expect(files["stories/Button.stories.tsx"]).toContain("title: 'Extracted/Button'");
    expect(files["stories/Tokens.mdx"]).toContain("# Design tokens");
    expect(files[".storybook/main.ts"]).toContain("StorybookConfig");
  });
});
