import { Type } from '../type.js';
import { contextConsumer, ContextConsumerClassOptions } from './consumer.js';

export function webContextConsumer(
  key: unknown
): (
  target: Object,
  prop?: string | symbol,
  descriptor?: PropertyDescriptor
) => void;
export function webContextConsumer(
  options?: WebContextConsumerClassOptions
): <T extends Type<EventTarget>>(target: T) => void | T;
export function webContextConsumer(
  keyOrClassOptions?: unknown | WebContextConsumerClassOptions
) {
  return <T extends Type<EventTarget>>(
    target: Object | T,
    prop?: string | symbol,
    descriptor?: PropertyDescriptor
  ): void | T => {
    if (typeof target === 'function') {
      return contextConsumer({
        ...(keyOrClassOptions as WebContextConsumerClassOptions),
        connectOn: 'connectedCallback',
        disconnectOn: 'disconnectedCallback',
      })<T>(target as T);
    }

    return contextConsumer(keyOrClassOptions)(target, prop, descriptor);
  };
}

export interface WebContextConsumerClassOptions
  extends Omit<ContextConsumerClassOptions, 'connectOn' | 'disconnectOn'> {}
