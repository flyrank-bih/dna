/**
 * @file cue protocol
 * @description Protocol-oriented contracts for design extraction cues.
 */

export type MaybePromise<T> = T | Promise<T>;

export interface CueExtractor<TArgs extends unknown[], TOutput> {
  extract(...args: TArgs): MaybePromise<TOutput>;
}

export interface CueDefinition<
  TExtract extends (...args: unknown[]) => unknown = (...args: unknown[]) => unknown,
> {
  id: string;
  extract: TExtract;
}

export function defineCue<TExtract extends (...args: unknown[]) => unknown>(
  id: string,
  extract: TExtract,
): CueDefinition<TExtract> {
  return { id, extract };
}
