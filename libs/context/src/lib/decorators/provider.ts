/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContextProvider } from '../context-provider.js';
import { Type } from '../type.js';
import {
  collectPropContext,
  ContextTargetMetadata,
  getTargetContextMetadata,
} from './metadata.js';

export function contextProvider(
  options?: ContextProviderClassOptions
): <T extends Type<EventTarget>>(target: T) => void | T;
export function contextProvider(
  key: unknown
): (
  target: Object,
  prop?: string | symbol,
  descriptor?: PropertyDescriptor
) => void;
export function contextProvider(
  keyOrClassOptions?: unknown | ContextProviderClassOptions
) {
  return <T extends Type<EventTarget>>(
    target: Object | T,
    prop?: string | symbol,
    descriptor?: PropertyDescriptor
  ): void | T => {
    if (typeof target === 'object' && prop !== undefined) {
      return collectPropContext(
        target.constructor,
        prop,
        keyOrClassOptions,
        descriptor
      );
    }

    if (typeof target === 'function') {
      const metadata = getTargetContextMetadata(target);

      if (Object.keys(metadata.props).length === 0) {
        return target as any as T;
      }

      const ctx = preInitContextProvider(
        target,
        metadata,
        keyOrClassOptions as ContextProviderClassOptions
      );

      class ContextProvided extends (target as any) {
        constructor(...args: unknown[]) {
          super(...args);
          initContextProvider(
            this,
            metadata,
            ctx,
            keyOrClassOptions as ContextProviderClassOptions
          );
        }
      }

      return ContextProvided as any as T;
    }
  };
}

export interface ContextProviderClassOptions {
  connectOn?: string;
  disconnectOn?: string;
}

const providerKey = Symbol('context-provider');

export function getProviderFrom(instance: any): ContextProvider | undefined {
  return instance[providerKey];
}

function preInitContextProvider(
  target: Function,
  metadata: ContextTargetMetadata,
  options?: ContextProviderClassOptions
) {
  const connectOn = options?.connectOn;
  const disconnectOn = options?.disconnectOn;
  const propsMetadata = Object.entries(metadata.props);

  const ctx = {
    ctxProvider: undefined! as ContextProvider,
    targetConnectMethod: (() => void 0) as Function,
    targetDisconnectMethod: (() => void 0) as Function,
  };

  if (connectOn) {
    ctx.targetConnectMethod = target.prototype[connectOn];
    target.prototype[connectOn] = function (...args: unknown[]) {
      ctx.ctxProvider!.connect();
      return ctx.targetConnectMethod.apply(this, args);
    };
  }

  if (disconnectOn) {
    ctx.targetDisconnectMethod = target.prototype[disconnectOn];
    target.prototype[disconnectOn] = function (...args: unknown[]) {
      ctx.ctxProvider!.disconnect();
      return ctx.targetDisconnectMethod.apply(this, args);
    };
  }

  propsMetadata.forEach(([propName, meta]) => {
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
      set(val) {
        set.call(this, val);
        ctx.ctxProvider.provide(meta.key, get.call(this));
      },
    });
  });

  return ctx;
}

function initContextProvider(
  instance: object & Record<string | symbol, any>,
  metadata: ContextTargetMetadata,
  ctx: ReturnType<typeof preInitContextProvider>,
  options?: ContextProviderClassOptions
) {
  const connectOn = options?.connectOn;
  const disconnectOn = options?.disconnectOn;
  const propsMetadata = Object.entries(metadata.props);

  const ctxProvider = new ContextProvider(instance as any);
  instance[providerKey] = ctx.ctxProvider = ctxProvider;

  if (connectOn && Object.prototype.hasOwnProperty.call(instance, connectOn)) {
    ctx.targetConnectMethod = instance[connectOn];
    instance[connectOn] = instance.constructor.prototype[connectOn];
  }

  if (
    disconnectOn &&
    Object.prototype.hasOwnProperty.call(instance, disconnectOn)
  ) {
    ctx.targetDisconnectMethod = instance[disconnectOn];
    instance[disconnectOn] = instance.constructor.prototype[disconnectOn];
  }

  propsMetadata.forEach(([propName, meta]) => {
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
