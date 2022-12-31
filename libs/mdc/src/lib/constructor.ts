// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Constructor<T, TArgs extends any[] = any[]>
  extends AbstractConstructor<T> {
  new (...args: TArgs): T;
}

export interface AbstractConstructor<T> extends Function, Function {
  prototype: T;
}
