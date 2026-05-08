import { type CueExtractor } from "./cue.protocol";

interface InteractionSignatureInput {
  interactionStates?: {
    hover?: { sampled?: number; changed?: number; deltas?: unknown[] };
    menusOpened?: number;
    accordionsOpened?: number;
    modals?: unknown[];
  };
  motion?: {
    durations?: string[];
    easings?: Array<{ family?: string; count?: number } | string>;
    feel?: string;
  };
}

interface InteractionSignatureResult {
  hoverTreatment:
    | "static"
    | "subtle-change"
    | "animated-emphasis"
    | "navigation-heavy";
  navigationReveal: "minimal" | "menu-driven" | "modal-driven";
  loadingStyle: "unknown";
  consistency: "high" | "medium" | "low";
}

export class InteractionSignatureCueExtractor
  implements CueExtractor<[input: InteractionSignatureInput], InteractionSignatureResult>
{
  extract(input: InteractionSignatureInput = {}): InteractionSignatureResult {
    const hover = input.interactionStates?.hover;
    const menusOpened = input.interactionStates?.menusOpened || 0;
    const modals = input.interactionStates?.modals?.length || 0;
    const easings = input.motion?.easings || [];

    const hoverTreatment: InteractionSignatureResult["hoverTreatment"] =
      (hover?.changed || 0) === 0
        ? "static"
        : (hover?.changed || 0) >= 6
          ? "animated-emphasis"
          : menusOpened > 0
            ? "navigation-heavy"
            : "subtle-change";

    const navigationReveal: InteractionSignatureResult["navigationReveal"] =
      modals > 0 ? "modal-driven" : menusOpened > 0 ? "menu-driven" : "minimal";

    const consistency: InteractionSignatureResult["consistency"] =
      easings.length <= 1 ? "high" : easings.length <= 3 ? "medium" : "low";

    return {
      hoverTreatment,
      navigationReveal,
      loadingStyle: "unknown",
      consistency,
    };
  }
}

export function extractInteractionSignature(
  input: InteractionSignatureInput = {},
): InteractionSignatureResult {
  return new InteractionSignatureCueExtractor().extract(input);
}
