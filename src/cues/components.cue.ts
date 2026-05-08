export interface ComponentStyleSnapshot {
  tag?: string;
  role?: string;
  classList?: string;
  area?: number;
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  borderRadius?: string;
  boxShadow?: string;
  borderColor?: string;
  maxWidth?: string;
  position?: string;
}

type StyleValue = string | undefined;
type StyleMap = Record<string, string>;

interface ComponentRecord {
  count: number;
  baseStyle: StyleMap | Record<string, unknown>;
  variants?: Array<Record<string, unknown>>;
  cellCount?: number;
  css?: string;
}

type ComponentCatalog = Record<string, ComponentRecord>;

const CSS_PROP_MAP: Record<string, string> = {
  backgroundColor: "background-color",
  color: "color",
  fontSize: "font-size",
  fontWeight: "font-weight",
  paddingTop: "padding-top",
  paddingRight: "padding-right",
  paddingBottom: "padding-bottom",
  paddingLeft: "padding-left",
  borderRadius: "border-radius",
  boxShadow: "box-shadow",
  borderColor: "border-color",
  maxWidth: "max-width",
  position: "position",
};

export class ComponentCueExtractor {
  private mostCommonStyle(
    elements: ComponentStyleSnapshot[],
    properties: string[],
  ): StyleMap {
    const style: StyleMap = {};
    for (const prop of properties) {
      const counts = new Map<string, number>();
      for (const element of elements) {
        const value = element[prop as keyof ComponentStyleSnapshot] as StyleValue;
        if (
          value &&
          value !== "none" &&
          value !== "auto" &&
          value !== "normal" &&
          value !== "rgba(0, 0, 0, 0)"
        ) {
          counts.set(value, (counts.get(value) || 0) + 1);
        }
      }
      const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
      if (top) style[prop] = top[0];
    }
    return style;
  }

  private styleToCss(selector: string, style: Record<string, unknown>): string {
    const lines = Object.entries(style)
      .filter(([, value]) => !!value && typeof value !== "object")
      .map(
        ([key, value]) =>
          `  ${CSS_PROP_MAP[key] || key}: ${String(value)};`,
      );
    return `${selector} {\n${lines.join("\n")}\n}`;
  }

  extract(computedStyles: ComponentStyleSnapshot[]): ComponentCatalog {
    const components: ComponentCatalog = {};
    const styles = computedStyles || [];

    const buttons = styles.filter(
      (el) =>
        el.tag === "button" ||
        el.role === "button" ||
        (el.tag === "a" && /btn|button/i.test(el.classList || "")),
    );
    if (buttons.length > 0) {
      const bgGroups = new Map<string, ComponentStyleSnapshot[]>();
      for (const button of buttons) {
        const background = button.backgroundColor || "transparent";
        if (!bgGroups.has(background)) bgGroups.set(background, []);
        bgGroups.get(background)?.push(button);
      }

      const variants = [...bgGroups.entries()]
        .sort((a, b) => b[1].length - a[1].length)
        .map(([background, group], index) => {
          const variant =
            background === "rgba(0, 0, 0, 0)" || background === "transparent"
              ? "ghost"
              : index === 0
                ? "primary"
                : index === 1
                  ? "secondary"
                  : `variant-${index + 1}`;
          return {
            variant,
            backgroundColor: background,
            count: group.length,
            style: this.mostCommonStyle(group, [
              "color",
              "fontSize",
              "fontWeight",
              "paddingTop",
              "paddingRight",
              "borderRadius",
            ]),
          };
        });

      components.buttons = {
        count: buttons.length,
        baseStyle: this.mostCommonStyle(buttons, [
          "backgroundColor",
          "color",
          "fontSize",
          "fontWeight",
          "paddingTop",
          "paddingRight",
          "borderRadius",
        ]),
        variants,
      };
    }

    const cards = styles.filter(
      (el) =>
        /card/i.test(el.classList || "") ||
        (el.tag === "div" &&
          el.boxShadow !== "none" &&
          el.borderRadius !== "0px" &&
          el.backgroundColor !== "rgba(0, 0, 0, 0)"),
    );
    if (cards.length > 0) {
      components.cards = {
        count: cards.length,
        baseStyle: this.mostCommonStyle(cards, [
          "backgroundColor",
          "borderRadius",
          "boxShadow",
          "paddingTop",
          "paddingRight",
        ]),
      };
    }

    const simpleGroups: Array<{
      key: string;
      list: ComponentStyleSnapshot[];
      props: string[];
      minCount?: number;
      extra?: (list: ComponentStyleSnapshot[]) => Partial<ComponentRecord>;
    }> = [
      {
        key: "inputs",
        list: styles.filter((el) => ["input", "textarea", "select"].includes(el.tag || "")),
        props: ["backgroundColor", "color", "borderColor", "borderRadius", "fontSize", "paddingTop", "paddingRight"],
      },
      {
        key: "links",
        list: styles.filter((el) => el.tag === "a"),
        props: ["color", "fontSize", "fontWeight"],
      },
      {
        key: "navigation",
        list: styles.filter(
          (el) =>
            el.tag === "nav" ||
            el.role === "navigation" ||
            /nav|navbar|header/i.test(el.classList || ""),
        ),
        props: ["backgroundColor", "color", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "position", "boxShadow"],
      },
      {
        key: "footer",
        list: styles.filter(
          (el) =>
            el.tag === "footer" ||
            el.role === "contentinfo" ||
            /footer/i.test(el.classList || ""),
        ),
        props: ["backgroundColor", "color", "paddingTop", "paddingBottom", "fontSize"],
      },
      {
        key: "modals",
        list: styles.filter(
          (el) =>
            el.tag === "dialog" ||
            el.role === "dialog" ||
            el.role === "alertdialog" ||
            /modal|dialog|overlay|popup/i.test(el.classList || ""),
        ),
        props: ["backgroundColor", "borderRadius", "boxShadow", "paddingTop", "paddingRight", "maxWidth"],
      },
      {
        key: "dropdowns",
        list: styles.filter(
          (el) =>
            el.role === "menu" ||
            el.role === "listbox" ||
            /dropdown|menu|popover|combobox/i.test(el.classList || ""),
        ),
        props: ["backgroundColor", "borderRadius", "boxShadow", "borderColor", "paddingTop"],
      },
      {
        key: "tabs",
        list: styles.filter(
          (el) => el.role === "tab" || /\btab\b/i.test(el.classList || ""),
        ),
        props: ["backgroundColor", "color", "fontSize", "fontWeight", "paddingTop", "paddingRight", "borderColor", "borderRadius"],
      },
      {
        key: "accordions",
        list: styles.filter(
          (el) =>
            /accordion/i.test(el.classList || "") ||
            el.tag === "summary" ||
            el.tag === "details",
        ),
        props: ["backgroundColor", "color", "fontSize", "paddingTop", "paddingRight", "borderColor"],
      },
      {
        key: "tooltips",
        list: styles.filter(
          (el) => el.role === "tooltip" || /tooltip/i.test(el.classList || ""),
        ),
        props: ["backgroundColor", "color", "fontSize", "borderRadius", "paddingTop", "paddingRight", "boxShadow"],
      },
      {
        key: "progressBars",
        list: styles.filter(
          (el) =>
            el.tag === "progress" ||
            el.role === "progressbar" ||
            /progress/i.test(el.classList || ""),
        ),
        props: ["backgroundColor", "color", "borderRadius", "fontSize"],
      },
      {
        key: "switches",
        list: styles.filter(
          (el) => el.role === "switch" || /switch|toggle/i.test(el.classList || ""),
        ),
        props: ["backgroundColor", "borderRadius", "borderColor"],
      },
      {
        key: "badges",
        list: styles.filter(
          (el) =>
            /badge|tag|pill|chip|label/i.test(el.classList || "") &&
            (el.area || 0) < 5000 &&
            (el.area || 0) > 100,
        ),
        props: ["backgroundColor", "color", "fontSize", "fontWeight", "paddingTop", "paddingRight", "borderRadius"],
      },
      {
        key: "avatars",
        list: styles.filter(
          (el) =>
            /avatar/i.test(el.classList || "") ||
            (el.tag === "img" &&
              el.borderRadius === "9999px" &&
              (el.area || 0) < 10000 &&
              (el.area || 0) > 400),
        ),
        props: ["borderRadius", "backgroundColor"],
      },
    ];

    const tables = styles.filter((el) => el.tag === "table" || el.role === "table");
    const tableCells = styles.filter((el) => ["td", "th"].includes(el.tag || ""));
    if (tables.length > 0 || tableCells.length > 10) {
      components.tables = {
        count: tables.length,
        cellCount: tableCells.length,
        baseStyle: {
          ...this.mostCommonStyle(tables, ["borderColor", "backgroundColor"]),
          cellStyle: this.mostCommonStyle(tableCells, [
            "paddingTop",
            "paddingRight",
            "borderColor",
            "fontSize",
          ]),
        },
      };
    }

    for (const group of simpleGroups) {
      if (!group.list.length) continue;
      components[group.key] = {
        count: group.list.length,
        baseStyle: this.mostCommonStyle(group.list, group.props),
      };
    }

    for (const [type, data] of Object.entries(components)) {
      if (!data.baseStyle || typeof data.baseStyle !== "object") continue;
      const style = { ...(data.baseStyle as Record<string, unknown>) };
      delete style.cellStyle;
      data.css = this.styleToCss(`.${type.replace(/s$/, "")}`, style);
    }

    return components;
  }
}

export function extractComponents(
  computedStyles: ComponentStyleSnapshot[],
): ComponentCatalog {
  return new ComponentCueExtractor().extract(computedStyles);
}
