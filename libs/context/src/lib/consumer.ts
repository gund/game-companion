import { InferContext } from './context-map.js';
import {
  ContextRequestDisconnectCallback,
  ContextRequestEvent,
} from './events.js';

export class ContextConsumer {
  protected isConnected = false;
  protected ctxCallbackMap = new Map<unknown, ContextConsumeCallback>();
  protected ctxDisconnectMap = new Map<
    unknown,
    ContextRequestDisconnectCallback
  >();
  protected pendingRequests = new Set<unknown>();
  protected log;

  constructor(
    protected host: EventTarget,
    protected config?: ContextConsumerOptions,
  ) {
    this.log = this.config?.debug ? console.debug : () => void 0;
  }

  consume<T, K extends string | symbol | number = string>(
    key: K,
    callback: ContextConsumeCallback<InferContext<K, T>>,
  ): () => void;
  consume<T>(key: unknown, callback: ContextConsumeCallback<T>): () => void;
  consume(key: unknown, callback: ContextConsumeCallback) {
    this.ctxCallbackMap.set(key, callback);
    this.requestContext(key);

    return () => this.unConsume(key);
  }

  unConsume(key: unknown) {
    this.ctxCallbackMap.delete(key);

    const disconnectCb = this.ctxDisconnectMap.get(key);

    if (disconnectCb) {
      disconnectCb();
      this.ctxDisconnectMap.delete(key);
    }
  }

  connect() {
    this.log('ContextProvider connected', this.host);

    this.isConnected = true;
    this.requestPendingContext();
  }

  disconnect() {
    this.log('ContextProvider disconnected', this.host);

    this.isConnected = false;

    this.ctxCallbackMap.clear();
    this.pendingRequests.clear();
    this.ctxDisconnectMap.forEach((disconnectCb) => disconnectCb());
    this.ctxDisconnectMap.clear();
  }

  protected requestPendingContext() {
    this.pendingRequests.forEach((key) => this.requestContext(key));
    this.pendingRequests.clear();
  }

  protected canRequestContext(key: unknown) {
    if (!this.ctxCallbackMap.has(key)) {
      return false;
    }

    if (!this.isConnected) {
      this.pendingRequests.add(key);
      return false;
    }

    return true;
  }

  protected requestContext(key: unknown) {
    if (!this.canRequestContext(key)) {
      return;
    }

    this.host.dispatchEvent(
      new ContextRequestEvent({
        ...this.config?.defaultEventInit,
        key,
        callback: (value, disconnectCb) =>
          this.handleContext(key, value, disconnectCb),
      }),
    );
  }

  protected handleContext(
    key: unknown,
    value: unknown,
    disconnectCb?: ContextRequestDisconnectCallback,
  ) {
    const callback = this.ctxCallbackMap.get(key);

    if (!callback) {
      return disconnectCb?.();
    }

    if (disconnectCb) {
      this.ctxDisconnectMap.set(key, disconnectCb);
    }

    this.log('Received context', key, value, this.host);

    callback(value);
  }
}

export interface ContextConsumerOptions {
  debug?: boolean;
  defaultEventInit?: EventInit;
}

export interface ContextConsumeCallback<T = unknown> extends Function {
  (value: T): void;
}
