export type MaybePromise<T> = T | Promise<T>;

export interface ActionHandler<TArgs extends unknown[], TResult> {
  run(...args: TArgs): MaybePromise<TResult>;
}

export interface ActionDefinition<
  TRun extends (...args: unknown[]) => unknown = (...args: unknown[]) => unknown,
> {
  id: string;
  run: TRun;
}

export function defineAction<TRun extends (...args: unknown[]) => unknown>(
  id: string,
  run: TRun,
): ActionDefinition<TRun> {
  return { id, run };
}
