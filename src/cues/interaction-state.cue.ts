type StyleSnapshot = Record<string, string | number | undefined>;

interface HoverSample {
  selector?: string;
  before?: StyleSnapshot;
  after?: StyleSnapshot;
}

interface ModalState {
  trigger?: string;
  snapshot?: {
    bg?: string;
    color?: string;
    boxShadow?: string;
    borderRadius?: string;
    width?: number;
    height?: number;
    role?: string;
  };
}

interface InteractionStateInput {
  scrollSettled?: boolean;
  menusOpened?: number;
  accordionsOpened?: number;
  hoverSamples?: HoverSample[];
  modals?: ModalState[];
}

export class InteractionStateExtractor {
  private diffStyles(before?: StyleSnapshot, after?: StyleSnapshot) {
    const diff: Record<string, { from: unknown; to: unknown }> = {};
    if (!before || !after) return diff;
    for (const key of Object.keys(after)) {
      if (before[key] !== after[key]) diff[key] = { from: before[key], to: after[key] };
    }
    return diff;
  }

  extract(interactState?: InteractionStateInput) {
    if (!interactState || typeof interactState !== "object") {
      return {
        scrollSettled: false,
        menusOpened: 0,
        hover: { sampled: 0, changed: 0, deltas: [] as Array<Record<string, unknown>> },
        accordionsOpened: 0,
        modals: [] as Array<Record<string, unknown>>,
      };
    }

    const deltas: Array<{ selector: string; changes: Record<string, unknown> }> = [];
    const samples = Array.isArray(interactState.hoverSamples)
      ? interactState.hoverSamples
      : [];
    for (const sample of samples) {
      const changes = this.diffStyles(sample.before, sample.after);
      if (Object.keys(changes).length > 0) {
        deltas.push({ selector: sample.selector || "", changes });
      }
    }

    const modals = Array.isArray(interactState.modals)
      ? interactState.modals.map((modal) => ({
          trigger: modal.trigger || "",
          bg: modal.snapshot?.bg || "",
          color: modal.snapshot?.color || "",
          boxShadow: modal.snapshot?.boxShadow || "",
          borderRadius: modal.snapshot?.borderRadius || "",
          width: modal.snapshot?.width || 0,
          height: modal.snapshot?.height || 0,
          role: modal.snapshot?.role || "",
        }))
      : [];

    return {
      scrollSettled: !!interactState.scrollSettled,
      menusOpened: interactState.menusOpened || 0,
      hover: {
        sampled: samples.length,
        changed: deltas.length,
        deltas,
      },
      accordionsOpened: interactState.accordionsOpened || 0,
      modals,
    };
  }
}

export function extractInteractionStates(interactState?: InteractionStateInput) {
  return new InteractionStateExtractor().extract(interactState);
}
