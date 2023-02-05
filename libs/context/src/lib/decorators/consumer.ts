/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ContextConsumer,
  ContextConsumerConsumeOptions,
  ContextConsumerOptions,
} from '../context-consumer.js';
import { Type } from '../type.js';
import { collectPropContext, getTargetContextMetadata } from './metadata.js';

export function contextConsumer(
  options?: ContextConsumerClassOptions,
): <T extends Type<EventTarget>>(target: T) => void | T;
export function contextConsumer(
  key: unknown,
  options?: ContextConsumerPropOptions,
): (
  target: EventTarget,
  prop?: string | symbol,
  descriptor?: PropertyDescriptor,
) => void;
export function contextConsumer(
  keyOrClassOptions?: unknown | ContextConsumerClassOptions,
  propOptions?: ContextConsumerPropOptions,
) {
  return <T extends Type<EventTarget>>(
    target: EventTarget | T,
    prop?: string | symbol,
    descriptor?: PropertyDescriptor,
  ): void | T => {
    if (typeof target === 'object' && prop !== undefined) {
      return collectPropContext<ContextTargetMetadataExtras>(
        target.constructor,
        prop,
        keyOrClassOptions,
        descriptor,
        { propOptions },
      );
    }

    if (typeof target === 'function') {
      const metadata =
        getTargetContextMetadata<ContextTargetMetadataExtras>(target);

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
              meta.propOptions,
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

export interface ContextConsumerPropOptions
  extends ContextConsumerConsumeOptions {}

export interface WithContextConsumer {
  getContextConsumer(): ContextConsumer;
}

interface ContextTargetMetadataExtras {
  propOptions?: ContextConsumerPropOptions;
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
