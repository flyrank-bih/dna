export interface ExtractOptionsShape {
  pages?: number;
  responsive?: boolean;
  interact?: boolean;
  deepInteract?: boolean;
  screenshot?: boolean;
  screenshots?: boolean;
  outputDir?: string;
  emitFiles?: boolean;
  platforms?: Array<
    "web" | "ios" | "android" | "flutter" | "wordpress" | "all"
  >;
  ignore?: string[];
  mode?:
    | "standard"
    | "overview"
    | "stack"
    | "dna"
    | "voice"
    | "layout"
    | "palette"
    | "fonts"
    | "assets"
    | "identity"
    | "messaging"
    | "composition"
    | "interaction"
    | "recreate"
    | "design-language";
  [key: string]: unknown;
}

export function mergeExtractOptions<TBase extends ExtractOptionsShape>(
  base: TBase,
  options: ExtractOptionsShape = {},
): ExtractOptionsShape {
  const mergedPlatforms = options.platforms ?? base.platforms ?? ["web"];
  return {
    ...base,
    ...options,
    pages:
      typeof options.pages === "number"
        ? options.pages
        : typeof base.pages === "number"
          ? base.pages
          : 0,
    responsive:
      typeof options.responsive === "boolean"
        ? options.responsive
        : Boolean(base.responsive),
    interact:
      typeof options.interact === "boolean"
        ? options.interact
        : typeof options.deepInteract === "boolean"
          ? options.deepInteract
          : Boolean(base.interact ?? base.deepInteract),
    deepInteract:
      typeof options.deepInteract === "boolean"
        ? options.deepInteract
        : typeof options.interact === "boolean"
          ? options.interact
          : Boolean(base.deepInteract ?? base.interact),
    screenshots:
      typeof options.screenshots === "boolean"
        ? options.screenshots
        : typeof options.screenshot === "boolean"
          ? options.screenshot
          : Boolean(base.screenshots ?? base.screenshot),
    screenshot:
      typeof options.screenshot === "boolean"
        ? options.screenshot
        : typeof options.screenshots === "boolean"
          ? options.screenshots
          : Boolean(base.screenshot ?? base.screenshots),
    outputDir:
      typeof options.outputDir === "string"
        ? options.outputDir
        : base.outputDir || ".flydesign",
    emitFiles:
      typeof options.emitFiles === "boolean"
        ? options.emitFiles
        : typeof base.emitFiles === "boolean"
          ? base.emitFiles
          : true,
    platforms: mergedPlatforms,
    ignore: options.ignore ?? base.ignore ?? [],
  };
}
