import { describe, expect, it } from "@rstest/core";
import {
  mapComponentScreenshotAssets,
  mapResponsiveScreenshotAssets,
} from "../screenshots/screenshot-extraction";

describe("screenshot extraction", () => {
  it("maps component screenshot captures into reusable SDK assets", () => {
    const result = mapComponentScreenshotAssets([
      {
        cluster: "button--primary",
        variant: 0,
        path: "screenshots/button--primary-0.png",
        bounds: { w: 160, h: 48 },
        retina: true,
        fallback: false,
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe("component");
    expect(result[0].cluster).toBe("button--primary");
    expect(result[0].viewport?.width).toBe(160);
  });

  it("maps responsive screenshot captures into labeled breakpoint assets", () => {
    const result = mapResponsiveScreenshotAssets([
      {
        breakpoint: "desktop",
        scheme: "dark",
        width: 1280,
        path: "screenshots/responsive/desktop-dark.png",
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe("responsive");
    expect(result[0].label).toBe("desktop dark");
    expect(result[0].viewport?.breakpoint).toBe("desktop");
  });
});
