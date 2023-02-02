const ctxKey = Symbol('context-metadata');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTargetContextMetadata(target: any): ContextTargetMetadata {
  return (
    target[ctxKey] ??
    (target[ctxKey] = { props: Object.create(null) } as ContextTargetMetadata)
  );
}

export function collectPropContext(
  target: unknown,
  prop: string | symbol,
  key: unknown,
  descriptor?: PropertyDescriptor
) {
  const metadata = getTargetContextMetadata(target);
  metadata.props[prop] = { key, descriptor };
}

export interface ContextTargetMetadata {
  props: ContextPropsMetadata;
}

export interface ContextPropsMetadata {
  [propName: string | symbol]: ContextPropMetadata;
}

export interface ContextPropMetadata {
  key: unknown;
  descriptor?: PropertyDescriptor;
}
