import { Type } from '../type.js';
import { contextProvider, ContextProviderClassOptions } from './provider.js';

export function webContextProvider(
  key: unknown
): (
  target: Object,
  prop?: string | symbol,
  descriptor?: PropertyDescriptor
) => void;
export function webContextProvider(
  options?: WebContextProviderClassOptions
): <T extends Type<EventTarget>>(target: T) => void | T;
export function webContextProvider(
  keyOrClassOptions?: unknown | WebContextProviderClassOptions
) {
  return <T extends Type<EventTarget>>(
    target: Object | T,
    prop?: string | symbol,
    descriptor?: PropertyDescriptor
  ): void | T => {
    if (typeof target === 'function') {
      return contextProvider({
        ...(keyOrClassOptions as WebContextProviderClassOptions),
        connectOn: 'connectedCallback',
        disconnectOn: 'disconnectedCallback',
      })<T>(target as T);
    }

    return contextProvider(keyOrClassOptions)(target, prop, descriptor);
  };
}

export interface WebContextProviderClassOptions
  extends Omit<ContextProviderClassOptions, 'connectOn' | 'disconnectOn'> {}
