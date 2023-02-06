import { Type } from '../type.js';
import {
  contextConsumer,
  ContextConsumerClassOptions,
  ContextConsumerPropOptions,
} from './consumer.js';

export function webContextConsumer(
  options?: WebContextConsumerClassOptions,
): <T extends Type<EventTarget>>(target: T) => void | T;
export function webContextConsumer(
  key: unknown,
  options?: ContextConsumerPropOptions,
): (
  target: EventTarget,
  prop?: string | symbol,
  descriptor?: PropertyDescriptor,
) => void;
export function webContextConsumer(
  keyOrClassOptions?: unknown | WebContextConsumerClassOptions,
  propOptions?: ContextConsumerPropOptions,
) {
  return <T extends Type<EventTarget>>(
    target: EventTarget | T,
    prop?: string | symbol,
    descriptor?: PropertyDescriptor,
  ): void | T => {
    if (typeof target === 'function') {
      return contextConsumer({
        ...(keyOrClassOptions as WebContextConsumerClassOptions),
        connectOn: 'connectedCallback',
        disconnectOn: 'disconnectedCallback',
      })<T>(target as T);
    }

    return contextConsumer(keyOrClassOptions, propOptions)(
      target,
      prop,
      descriptor,
    );
  };
}

export interface WebContextConsumerClassOptions
  extends Omit<ContextConsumerClassOptions, 'connectOn' | 'disconnectOn'> {}
