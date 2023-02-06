import { Type } from '../type.js';
import {
  contextProvider,
  ContextProviderClassOptions,
  ContextProviderPropOptions,
} from './provider.js';

export function webContextProvider(
  options?: WebContextProviderClassOptions,
): <T extends Type<EventTarget>>(target: T) => void | T;
export function webContextProvider(
  key: unknown,
  propOptions?: WebContextProviderPropOptions,
): (
  target: EventTarget,
  prop?: string | symbol,
  descriptor?: PropertyDescriptor,
) => void;
export function webContextProvider(
  keyOrClassOptions?: unknown | WebContextProviderClassOptions,
  propOptions?: WebContextProviderPropOptions,
) {
  return <T extends Type<EventTarget>>(
    target: EventTarget | T,
    prop?: string | symbol,
    descriptor?: PropertyDescriptor,
  ): void | T => {
    if (typeof target === 'function') {
      return contextProvider({
        ...(keyOrClassOptions as WebContextProviderClassOptions),
        connectOn: 'connectedCallback',
        disconnectOn: 'disconnectedCallback',
      })<T>(target as T);
    }

    return contextProvider(keyOrClassOptions, propOptions)(
      target,
      prop,
      descriptor,
    );
  };
}

export interface WebContextProviderClassOptions
  extends Omit<ContextProviderClassOptions, 'connectOn' | 'disconnectOn'> {}

export interface WebContextProviderPropOptions
  extends ContextProviderPropOptions {}
