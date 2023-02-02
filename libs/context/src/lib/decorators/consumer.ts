/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContextConsumer } from '../context-consumer.js';
import { Type } from '../type.js';
import {
  collectPropContext,
  ContextTargetMetadata,
  getTargetContextMetadata,
} from './metadata.js';

export function contextConsumer(
  options?: ContextConsumerClassOptions
): <T extends Type<EventTarget>>(target: T) => void | T;
export function contextConsumer(
  key: unknown
): (
  target: Object,
  prop?: string | symbol,
  descriptor?: PropertyDescriptor
) => void;
export function contextConsumer(
  keyOrClassOptions?: unknown | ContextConsumerClassOptions
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
        return target as T;
      }

      const ctx = preInitContextConsumer(
        target,
        keyOrClassOptions as ContextConsumerClassOptions
      );

      class ContextConsumed extends (target as any) {
        constructor(...args: unknown[]) {
          super(...args);
          initContextConsumer(
            this,
            metadata,
            ctx,
            keyOrClassOptions as ContextConsumerClassOptions
          );
        }
      }

      return ContextConsumed as any as T;
    }
  };
}

export interface ContextConsumerClassOptions {
  connectOn?: string;
  disconnectOn?: string;
}

const consumerKey = Symbol('context-consumer');

export function getConsumerFrom(instance: any): ContextConsumer | undefined {
  return instance[consumerKey];
}

function preInitContextConsumer(
  target: Function,
  options?: ContextConsumerClassOptions
) {
  const connectOn = options?.connectOn;
  const disconnectOn = options?.disconnectOn;

  const ctx = {
    ctxConsumer: undefined! as ContextConsumer,
    targetConnectMethod: (() => void 0) as Function,
    targetDisconnectMethod: (() => void 0) as Function,
  };

  if (connectOn) {
    ctx.targetConnectMethod = target.prototype[connectOn];
    target.prototype[connectOn] = function (...args: unknown[]) {
      ctx.ctxConsumer!.connect();
      return ctx.targetConnectMethod.apply(this, args);
    };
  }

  if (disconnectOn) {
    ctx.targetDisconnectMethod = target.prototype[disconnectOn];
    target.prototype[disconnectOn] = function (...args: unknown[]) {
      ctx.ctxConsumer!.disconnect();
      return ctx.targetDisconnectMethod.apply(this, args);
    };
  }

  return ctx;
}

function initContextConsumer(
  instance: object & Record<string | symbol, any>,
  metadata: ContextTargetMetadata,
  ctx: ReturnType<typeof preInitContextConsumer>,
  options?: ContextConsumerClassOptions
) {
  const connectOn = options?.connectOn;
  const disconnectOn = options?.disconnectOn;
  const propsMetadata = Object.entries(metadata.props);

  const ctxConsumer = new ContextConsumer(instance as any);
  instance[consumerKey] = ctx.ctxConsumer = ctxConsumer;

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
    ctxConsumer.consume(meta.key, (value) => (instance[propName] = value));
  });

  return instance;
}
