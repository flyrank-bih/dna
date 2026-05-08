import { type CueExtractor } from "./cue.protocol";

interface AnimationStyleInput {
  transition?: string;
  animation?: string;
}

interface KeyframeStep {
  offset: string;
  style: string;
}

interface KeyframeInput {
  name: string;
  steps: KeyframeStep[];
}

interface AnimationExtractionResult {
  transitions: string[];
  easings: Array<{ value: string; pattern: string }>;
  durations: string[];
  keyframes: Array<{
    name: string;
    steps: KeyframeStep[];
    propertiesAnimated: string[];
    isUsed: boolean;
    isBounce: boolean;
  }>;
  transitionProperties: Array<{ property: string; count: number }>;
  animationNames: string[];
}

export class AnimationCueExtractor
  implements
    CueExtractor<
      [computedStyles: AnimationStyleInput[], keyframes?: KeyframeInput[]],
      AnimationExtractionResult
    >
{
  extract(
    computedStyles: AnimationStyleInput[] = [],
    keyframes: KeyframeInput[] = [],
  ): AnimationExtractionResult {
    const transitionSet = new Set<string>();
    const easingSet = new Set<string>();
    const durationSet = new Set<string>();
    const animationNames = new Set<string>();
    const transitionProperties: Record<string, number> = {};

    for (const el of computedStyles) {
    if (
      el.transition &&
      el.transition !== "all 0s ease 0s" &&
      el.transition !== "none"
    ) {
      transitionSet.add(el.transition);

      const dMatch = el.transition.match(/(?<![(\d])(\d+\.?\d*m?s)(?![)\w])/g);
      if (dMatch) dMatch.forEach((d) => durationSet.add(d));

      const eMatch = el.transition.match(
        /(ease|ease-in|ease-out|ease-in-out|linear|cubic-bezier\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*\))/g,
      );
      if (eMatch) eMatch.forEach((e) => easingSet.add(e));

      const parts = el.transition.split(",").map((s) => s.trim());
      for (const part of parts) {
        const prop = part.split(/\s+/)[0];
        if (prop && prop !== "all") {
          transitionProperties[prop] = (transitionProperties[prop] || 0) + 1;
        }
      }
    }

    if (
      el.animation &&
      el.animation !== "none 0s ease 0s 1 normal none running" &&
      el.animation !== "none"
    ) {
      const nameMatch = el.animation.match(/^([\w-]+)/);
      if (nameMatch && nameMatch[1] !== "none")
        animationNames.add(nameMatch[1]);

      const delayMatch = el.animation.match(
        /(?<!\d)(\d+\.?\d*m?s)\s+(\d+\.?\d*m?s)/,
      );
      if (delayMatch) durationSet.add(delayMatch[1]);
    }
  }

    const enhancedKeyframes = keyframes.map((kf) => {
    const propertiesAnimated = new Set<string>();
    for (const step of kf.steps) {
      const props = step.style
        .split(";")
        .map((s) => s.split(":")[0].trim())
        .filter(Boolean);
      props.forEach((p) => propertiesAnimated.add(p));
    }
    return {
      name: kf.name,
      steps: kf.steps,
      propertiesAnimated: [...propertiesAnimated],
      isUsed: animationNames.has(kf.name),
      isBounce: false,
    };
  });

    const sortedProps = Object.entries(transitionProperties)
      .sort((a, b) => b[1] - a[1])
      .map(([prop, count]) => ({ property: prop, count }));

    const classifiedEasings = [...easingSet].map((e) => {
      let pattern = "custom";
      if (e === "linear") pattern = "linear";
      else if (e === "ease-in") pattern = "ease-in";
      else if (e === "ease-out") pattern = "ease-out";
      else if (e === "ease-in-out" || e === "ease") pattern = "ease-in-out";
      else {
        const cbMatch = e.match(
          /cubic-bezier\(\s*([\d.]+)\s*,\s*([-\d.]+)\s*,\s*([\d.]+)\s*,\s*([-\d.]+)\s*\)/,
        );
        if (cbMatch) {
          const [, , y1, , y2] = cbMatch.map(Number);
          if (y1 > 1 || y1 < 0 || y2 > 1 || y2 < 0) pattern = "spring-like";
        }
      }
      return { value: e, pattern };
    });

    for (const kf of enhancedKeyframes) {
      const firstStep = kf.steps.find(
        (s) => s.offset === "0%" || s.offset === "from",
      );
      const lastStep = kf.steps.find(
        (s) => s.offset === "100%" || s.offset === "to",
      );
      kf.isBounce = !!(
        firstStep &&
        lastStep &&
        firstStep.style === lastStep.style &&
        kf.steps.length > 2
      );
    }

    return {
      transitions: [...transitionSet],
      easings: classifiedEasings,
      durations: [...durationSet],
      keyframes: enhancedKeyframes,
      transitionProperties: sortedProps,
      animationNames: [...animationNames],
    };
  }
}

export function extractAnimations(
  computedStyles: AnimationStyleInput[] = [],
  keyframes: KeyframeInput[] = [],
): AnimationExtractionResult {
  return new AnimationCueExtractor().extract(computedStyles, keyframes);
}
