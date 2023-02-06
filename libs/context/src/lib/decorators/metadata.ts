const ctxKey = Symbol('context-metadata');

export function getTargetContextMetadata<TExtras = object>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target: any,
): ContextTargetMetadata<TExtras> {
  return (
    target[ctxKey] ??
    (target[ctxKey] = { props: Object.create(null) } as ContextTargetMetadata)
  );
}

export function collectPropContext<TExtras = object>(
  target: unknown,
  prop: string | symbol,
  key: unknown,
  descriptor?: PropertyDescriptor,
  extras?: TExtras,
) {
  const metadata = getTargetContextMetadata(target);
  metadata.props[prop] = { ...extras, key, descriptor };
}

export interface ContextTargetMetadata<TExtras = object> {
  props: ContextPropsMetadata<TExtras>;
}

export interface ContextPropsMetadata<TExtras = object> {
  [propName: string | symbol]: ContextPropMetadata & TExtras;
}

export interface ContextPropMetadata {
  key: unknown;
  descriptor?: PropertyDescriptor;
}
