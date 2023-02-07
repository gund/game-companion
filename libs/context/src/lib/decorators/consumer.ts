/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  EventedContextConsumer as ContextConsumer,
  EventedContextConsumerOptions as ContextConsumerOptions,
} from '../evented-consumer.js';
import { Type } from '../type.js';
import { collectPropContext, getTargetContextMetadata } from './metadata.js';

export function contextConsumer(
  options?: ContextConsumerClassOptions,
): <T extends Type<EventTarget>>(target: T) => void | T;
export function contextConsumer(
  key: unknown,
): (
  target: EventTarget,
  prop?: string | symbol,
  descriptor?: PropertyDescriptor,
) => void;
export function contextConsumer(
  keyOrClassOptions?: unknown | ContextConsumerClassOptions,
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
        return target as T;
      }

      const classOptions = keyOrClassOptions as
        | ContextConsumerClassOptions
        | undefined;
      const connectOn = classOptions?.connectOn ?? '';
      const disconnectOn = classOptions?.disconnectOn ?? '';

      class ContextConsumed
        extends (target as Type<FlexibleEventTarget>)
        implements WithContextConsumer
      {
        #ctxConsumer = new ContextConsumer(this, classOptions);

        constructor(...args: any[]) {
          super(...args);

          Object.entries(metadata.props).forEach(([propName, meta]) => {
            this.#ctxConsumer.consume(
              meta.key,
              (value) => (this[propName] = value),
            );
          });
        }

        getContextConsumer() {
          return this.#ctxConsumer;
        }

        [connectOn]() {
          this.#ctxConsumer.connect();
          (super[connectOn as keyof EventTarget] as any)();
        }

        [disconnectOn]() {
          this.#ctxConsumer.disconnect();
          (super[disconnectOn as keyof EventTarget] as any)();
        }
      }

      return ContextConsumed as any as T;
    }
  };
}

export interface ContextConsumerClassOptions extends ContextConsumerOptions {
  connectOn?: string;
  disconnectOn?: string;
}

export interface WithContextConsumer {
  getContextConsumer(): ContextConsumer;
}

interface FlexibleEventTarget
  extends EventTarget,
    Record<string | symbol, any> {}

export function isWithContextConsumer<T>(
  obj: T,
): obj is T & WithContextConsumer {
  return typeof (obj as WithContextConsumer).getContextConsumer === 'function';
}

export function getConsumerFrom(obj: unknown): ContextConsumer | undefined {
  if (!isWithContextConsumer(obj)) {
    return;
  }

  return obj.getContextConsumer();
}
