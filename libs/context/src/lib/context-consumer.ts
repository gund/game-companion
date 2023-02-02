import {
  ContextProvideEvent,
  ContextRequestEvent,
  ContextRequestRemoveEvent,
} from './context-events.js';
import { InferContext } from './context-map.js';

export class ContextConsumer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected ctxCallbacksMap = new Map<unknown, ContextCallback<any>>();
  protected isConnected = false;

  constructor(
    protected host: EventTarget,
    protected config?: ContextConsumerOptions
  ) {}

  consume<T, K extends string | symbol | number = string>(
    key: K,
    callback: ContextCallback<InferContext<K, T>>
  ): () => void;
  consume<T>(key: unknown, callback: ContextCallback<T>): () => void;
  consume<T>(key: unknown, callback: ContextCallback<T>) {
    this.ctxCallbacksMap.set(key, callback);
    this.requestContext(key);

    return () => this.unConsume(key);
  }

  unConsume(key: unknown) {
    this.ctxCallbacksMap.delete(key);
    this.host.dispatchEvent(
      new ContextRequestRemoveEvent({ key, requestee: this.host })
    );
  }

  connect() {
    this.isConnected = true;
    console.debug('ContextConsumer: Connected', this.host);

    this.host.addEventListener(
      ContextProvideEvent.EventName,
      this.handleContextProvide as EventListener
    );

    if (!this.config?.noRequestOnConnect) {
      this.requestWholeContext();
    }
  }

  disconnect() {
    this.isConnected = false;
    console.debug('ContextConsumer: Disconnected', this.host);

    this.host.removeEventListener(
      ContextProvideEvent.EventName,
      this.handleContextProvide as EventListener
    );

    this.host.dispatchEvent(
      new ContextRequestRemoveEvent({ requestee: this.host })
    );
  }

  dispose() {
    this.disconnect();
    this.ctxCallbacksMap.clear();
  }

  protected requestWholeContext() {
    this.ctxCallbacksMap.forEach((_, key) => this.requestContext(key));
  }

  protected requestContext(key: unknown) {
    if (!this.isConnected) {
      return;
    }

    console.debug('ContextConsumer: Requesting context', key);

    this.host.dispatchEvent(
      new ContextRequestEvent({
        ...this.config?.defaultEventInit,
        key,
        requestee: this.host,
      })
    );
  }

  protected handleContextProvide = (event: ContextProvideEvent) => {
    console.debug(
      'ContextConsumer: Received context',
      event.contextKey,
      event.contextValue
    );

    this.ctxCallbacksMap.get(event.contextKey)?.(event.contextValue);
  };
}

export interface ContextConsumerOptions {
  noRequestOnConnect?: boolean;
  defaultEventInit?: EventInit;
}

export interface ContextCallback<T = unknown> extends Function {
  (ctx: T): void;
}
