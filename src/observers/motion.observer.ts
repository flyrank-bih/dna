export interface MotionTokenObserver {
  format(motion: MotionInput): MotionTokenDocument;
}

export interface MotionInput {
  durations?: Array<{ name: string; css: string; ms: number }>;
  easings?: Array<{ family: string; raw: string }>;
  springs?: Array<{ raw: string }>;
  feel?: string;
  scrollLinked?: { present?: boolean };
}

interface DurationToken {
  $value: string;
  $type: "duration";
  ms: number;
}

interface EasingToken {
  $value: string;
  $type: "cubicBezier";
  family: string;
}

interface SpringToken {
  $value: string;
  $type: "cubicBezier";
  overshoot: boolean;
}

export interface MotionTokenDocument {
  $description: string;
  duration: Record<string, DurationToken>;
  easing: Record<string, EasingToken>;
  spring: Record<string, SpringToken>;
  $meta: {
    feel: string | null;
    scrollLinked?: boolean;
  };
}

const hash = (s: string) =>
  Math.abs(
    String(s || "")
      .split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0),
  ) % 1000;

const nullable = <T>(value: T | undefined): T | null => value ?? null;

export const FlyRankMotionTokensObserver: MotionTokenObserver = {
  format(motion: MotionInput): MotionTokenDocument {
    const duration: Record<string, DurationToken> = {};
    const easing: Record<string, EasingToken> = {};
    const spring: Record<string, SpringToken> = {};

    for (const d of motion?.durations || []) {
      duration[d.name] = {
        $value: d.css,
        $type: "duration",
        ms: d.ms,
      };
    }

    for (const e of motion?.easings || []) {
      const slug =
        e.family + (e.raw?.includes("cubic-bezier") ? `-${hash(e.raw)}` : "");

      easing[slug] = {
        $value: e.raw,
        $type: "cubicBezier",
        family: e.family,
      };
    }

    (motion?.springs || []).forEach((s, i) => {
      spring[`spring-${i + 1}`] = {
        $value: s.raw,
        $type: "cubicBezier",
        overshoot: true,
      };
    });

    return {
      $description: "FlyRank Visual DNA Motion Tokens",
      duration,
      easing,
      spring,
      $meta: {
        feel: nullable(motion?.feel),
        scrollLinked: !!motion?.scrollLinked?.present,
      },
    };
  },
};
