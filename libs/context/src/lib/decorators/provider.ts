/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ContextProvider,
  ContextProviderOptions,
} from '../context-provider.js';
import { Type } from '../type.js';
import {
  collectPropContext,
  ContextTargetMetadata,
  getTargetContextMetadata,
} from './metadata.js';

export function contextProvider(
  options?: ContextProviderClassOptions,
): <T extends Type<EventTarget>>(target: T) => void | T;
export function contextProvider(
  key: unknown,
  options?: ContextProviderPropOptions,
): (
  target: EventTarget,
  prop?: string | symbol,
  descriptor?: PropertyDescriptor,
) => void;
export function contextProvider(
  keyOrClassOptions?: unknown | ContextProviderClassOptions,
  propOptions?: ContextProviderPropOptions,
) {
  return <T extends Type<EventTarget>>(
    target: EventTarget | T,
    prop?: string | symbol,
    descriptor?: PropertyDescriptor,
  ): void | T => {
    if (typeof target === 'object' && prop !== undefined) {
      return collectPropContext(
        target.constructor,
        prop,
        keyOrClassOptions,
        descriptor,
      );
    }

    if (typeof target === 'function') {
      const metadata = getTargetContextMetadata(target);

      if (Object.keys(metadata.props).length === 0) {
        return target as any as T;
      }

      const classOptions = keyOrClassOptions as
        | ContextProviderClassOptions
        | undefined;
      const connectOn = classOptions?.connectOn ?? '';
      const disconnectOn = classOptions?.disconnectOn ?? '';

      staticInitContextProvider(target, metadata, propOptions);

      class ContextProvided extends target implements WithContextProvider {
        #ctxProvider = new ContextProvider(this, classOptions);

        constructor(...args: any[]) {
          super(...args);
          initContextProvider(this, metadata, this.#ctxProvider);
        }

        getContextProvider(): ContextProvider {
          return this.#ctxProvider;
        }

        [connectOn]() {
          this.#ctxProvider.connect();
          (super[connectOn as keyof EventTarget] as any)();
        }

        [disconnectOn]() {
          this.#ctxProvider.disconnect();
          (super[disconnectOn as keyof EventTarget] as any)();
        }
      }

      return ContextProvided as any as T;
    }
  };
}

export interface ContextProviderClassOptions extends ContextProviderOptions {
  connectOn?: string;
  disconnectOn?: string;
}

export interface ContextProviderPropOptions {
  shouldUpdate?(value: unknown, oldValue?: unknown): boolean;
}

export interface WithContextProvider {
  getContextProvider(): ContextProvider;
}

export function isWithContextProvider<T>(
  obj: T,
): obj is T & WithContextProvider {
  return typeof (obj as WithContextProvider).getContextProvider === 'function';
}

export function getProviderFrom(obj: unknown): ContextProvider | undefined {
  if (!isWithContextProvider(obj)) {
    return;
  }

  return obj.getContextProvider();
}

function staticInitContextProvider(
  target: Type<EventTarget>,
  metadata: ContextTargetMetadata,
  propOptions?: ContextProviderPropOptions,
) {
  const shouldUpdate =
    propOptions?.shouldUpdate ?? ((value, oldValue) => value !== oldValue);

  Object.entries(metadata.props).forEach(([propName, meta]) => {
    const propKey = Symbol.for(propName);

    const get =
      meta.descriptor?.get ??
      function (this: any) {
        return this[propKey];
      };
    const set =
      meta.descriptor?.set ??
      function (this: any, value: any) {
        this[propKey] = value;
      };

    Object.defineProperty(target.prototype, propName, {
      configurable: meta.descriptor?.configurable ?? true,
      enumerable: meta.descriptor?.enumerable ?? true,
      get,
      set(this: WithContextProvider, incomingValue) {
        const oldValue = get.call(this);
        set.call(this, incomingValue);
        const value = get.call(this);

        if (shouldUpdate(value, oldValue)) {
          this.getContextProvider().provide(meta.key, value);
        }
      },
    });
  });
}

function initContextProvider(
  instance: EventTarget & Record<string | symbol, any>,
  metadata: ContextTargetMetadata,
  ctxProvider: ContextProvider,
) {
  Object.entries(metadata.props).forEach(([propName, meta]) => {
    const value: unknown = instance[propName];

    if (!meta.descriptor) {
      // Delete shadowing prop
      delete instance[propName];
      // Reset initial value
      instance[propName] = value;
    } else {
      // Set initial context value
      ctxProvider.provide(meta.key, value);
    }
  });

  return instance;
}
