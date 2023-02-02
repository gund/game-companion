declare global {
  interface ContextMap {}
}

export type InferContext<
  TKey,
  TFallback = unknown
> = TKey extends keyof ContextMap ? ContextMap[TKey] : TFallback;
