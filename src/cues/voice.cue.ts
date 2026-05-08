import { type CueExtractor } from "./cue.protocol";

const IMPERATIVE_VERBS = new Set([
  "get",
  "start",
  "try",
  "build",
  "create",
  "ship",
  "deploy",
  "launch",
  "learn",
  "read",
  "buy",
  "shop",
  "explore",
  "discover",
  "join",
  "sign",
  "subscribe",
  "book",
  "download",
  "install",
  "contact",
  "talk",
  "request",
  "view",
  "see",
  "watch",
  "read",
  "meet",
]);

const FRIENDLY_MARKERS =
  /\b(we|our|us|you|your|let's|hey|welcome|thanks|love|yay|awesome)\b/i;
const FORMAL_MARKERS =
  /\b(enterprise|platform|solution|infrastructure|comprehensive|leverage|empower|facilitate|utilize)\b/i;
const TECHNICAL_MARKERS =
  /\b(api|sdk|webhook|latency|throughput|cli|runtime|schema|endpoint|token|typescript|kubernetes)\b/i;
const PLAYFUL_MARKERS =
  /[!?]{1,2}$|\b(magic|wow|boom|zap|rocket|sparkle|fire)\b|[✨🚀🔥⚡💫]/i;

interface VoiceCandidate {
  kind?: string;
  text?: string;
}

interface VoiceSection {
  headings?: string[];
  text?: string;
}

function words(str: string) {
  return (str || "").toLowerCase().match(/[a-z']+/g) || [];
}

function firstVerb(text: string) {
  const w = words(text);
  for (const word of w) {
    if (IMPERATIVE_VERBS.has(word)) return word;
  }
  return w[0] || "";
}

function scoreTone(texts: string[]) {
  const joined = texts.join(" ");
  const countMatches = (pattern: RegExp): number =>
    joined.match(new RegExp(pattern.source, `${pattern.flags.includes("i") ? "i" : ""}g`))
      ?.length || 0;

  return {
    friendly: countMatches(FRIENDLY_MARKERS),
    formal: countMatches(FORMAL_MARKERS),
    technical: countMatches(TECHNICAL_MARKERS),
    playful: countMatches(PLAYFUL_MARKERS),
  };
}

function pickTone(scores: Record<string, number>): string {
  const entries = Object.entries(scores);
  const total = entries.reduce((s, [, n]) => s + n, 0);
  if (total === 0) return "neutral";
  const [top] = entries.sort((a, b) => b[1] - a[1]);
  return top[1] / total > 0.4 ? top[0] : "neutral";
}

function topN(arr: string[], n = 10) {
  const counts: Record<string, number> = {};
  for (const v of arr) if (v) counts[v] = (counts[v] || 0) + 1;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([value, count]) => ({ value, count }));
}

export function extractVoice({
  componentCandidates = [],
  sections = [],
}: {
  componentCandidates?: VoiceCandidate[];
  sections?: VoiceSection[];
} = {}): VoiceExtractionResult {
  return new VoiceCueExtractor().extract({ componentCandidates, sections });
}

type VoiceTone = "friendly" | "formal" | "technical" | "playful" | "neutral";
type PronounStyle = "we→you" | "you-only" | "we-only" | "third-person";
type HeadingStyle = "Title Case" | "Sentence case" | "all-lowercase" | "unknown";
type HeadingLengthClass = "tight" | "balanced" | "verbose";

interface VoiceExtractionResult {
  tone: VoiceTone;
  pronoun: PronounStyle;
  headingStyle: HeadingStyle;
  headingLengthClass: HeadingLengthClass;
  ctaVerbs: Array<{ value: string; count: number }>;
  buttonPatterns: Array<{ value: string; count: number }>;
  sampleHeadings: string[];
  stats: {
    buttons: number;
    headings: number;
  };
}

export class VoiceCueExtractor
  implements
    CueExtractor<
      [{ componentCandidates?: VoiceCandidate[]; sections?: VoiceSection[] }],
      VoiceExtractionResult
    >
{
  extract({
    componentCandidates = [],
    sections = [],
  }: {
    componentCandidates?: VoiceCandidate[];
    sections?: VoiceSection[];
  } = {}): VoiceExtractionResult {
    const buttons = componentCandidates
      .filter((candidate) => candidate.kind === "button" || candidate.kind === "link")
      .map((candidate) => candidate.text)
      .filter((value): value is string => typeof value === "string" && !!value);
    const headings = sections
      .flatMap((section) => section.headings || [])
      .filter((value): value is string => typeof value === "string" && !!value);
    const sectionTexts = sections
      .map((section) => section.text || "")
      .filter((value): value is string => typeof value === "string" && !!value);

    const ctaVerbs = buttons.map(firstVerb).filter(Boolean);
    const buttonPatterns = topN(
      buttons.map((buttonLabel) => buttonLabel.toLowerCase().trim()),
      15,
    );
    const ctaTopVerbs = topN(ctaVerbs, 10);
    const fullText = [...headings, ...sectionTexts].join(" ");
    const tone = pickTone(scoreTone([...buttons, ...headings, ...sectionTexts])) as VoiceTone;

    const personPronoun: PronounStyle = /\byou\b/i.test(fullText)
      ? /\bwe\b/i.test(fullText)
        ? "we→you"
        : "you-only"
      : /\bwe\b/i.test(fullText)
        ? "we-only"
        : "third-person";

    const headingStyle: HeadingStyle = (() => {
      if (!headings.length) return "unknown";
      const titleCase = headings.filter((heading) => /^[A-Z]/.test(heading) && /\s[A-Z]/.test(heading)).length;
      const sentenceCase = headings.filter(
        (heading) => /^[A-Z]/.test(heading) && !/\s[A-Z]/.test(heading),
      ).length;
      const allLower = headings.filter((heading) => heading === heading.toLowerCase()).length;
      if (allLower > headings.length / 2) return "all-lowercase";
      if (titleCase > sentenceCase) return "Title Case";
      return "Sentence case";
    })();

    const avgHeadingWords = headings.length
      ? headings.reduce((sum, heading) => sum + words(heading).length, 0) /
        headings.length
      : 0;
    const headingLengthClass: HeadingLengthClass =
      avgHeadingWords <= 4 ? "tight" : avgHeadingWords <= 8 ? "balanced" : "verbose";

    return {
      tone,
      pronoun: personPronoun,
      headingStyle,
      headingLengthClass,
      ctaVerbs: ctaTopVerbs,
      buttonPatterns,
      sampleHeadings: headings.slice(0, 10),
      stats: {
        buttons: buttons.length,
        headings: headings.length,
      },
    };
  }
}
