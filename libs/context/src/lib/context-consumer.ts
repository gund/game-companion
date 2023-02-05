import {
  ContextProvideEvent,
  ContextRequestEvent,
  ContextRequestRemoveEvent,
} from './context-events.js';
import { InferContext } from './context-map.js';

export class ContextConsumer {
  protected ctxCallbacksMap = new Map<unknown, ContextCallback>();
  protected ctxProvidersMap = new Map<unknown, WeakRef<EventTarget>>();
  protected isConnected = false;
  protected log;

  constructor(
    protected host: EventTarget,
    protected config?: ContextConsumerOptions,
  ) {
    this.log = this.config?.debug ? console.debug : () => void 0;
  }

  consume<T, K extends string | symbol | number = string>(
    key: K,
    callback: ContextCallback<InferContext<K, T>>,
    options?: ContextConsumerConsumeOptions,
  ): () => void;
  consume<T>(
    key: unknown,
    callback: ContextCallback<T>,
    options?: ContextConsumerConsumeOptions,
  ): () => void;
  consume(
    key: unknown,
    callback: ContextCallback,
    options?: ContextConsumerConsumeOptions,
  ) {
    const unConsume = () => this.unConsume(key);
    const shouldSpyOnCtx = options?.timeout === 0 || options?.once === true;

    let contextReceived = false;
    function ctxSpy(this: unknown, ...args: unknown[]) {
      contextReceived = true;
      if (options?.once) {
        unConsume();
      }
      return callback.apply(this, args);
    }
    const ctxCallback = shouldSpyOnCtx ? ctxSpy : callback;

    this.ctxCallbacksMap.set(key, ctxCallback);
    this.requestContext(key);

    const checkCtx = () => {
      if (!contextReceived) {
        unConsume();
        throw new Error(
          `ContextConsumer: Context ${String(key)} is not provided!`,
        );
      }
    };

    if (options?.timeout === 0) {
      checkCtx();
    } else if (options?.timeout && options?.timeout > 0) {
      setTimeout(checkCtx, options.timeout);
    }

    return unConsume;
  }

  unConsume(key: unknown) {
    this.ctxCallbacksMap.delete(key);

    this.host.dispatchEvent(
      new ContextRequestRemoveEvent({ key, requestee: this.host }),
    );
  }

  connect() {
    if (this.isConnected) {
      return;
    }
    this.isConnected = true;
    this.log('ContextConsumer: Connected', this.host);

    this.host.addEventListener(
      ContextProvideEvent.EventName,
      this.handleContextProvide as EventListener,
    );

    if (!this.config?.noRequestOnConnect) {
      this.requestWholeContext();
    }
  }

  disconnect() {
    if (!this.isConnected) {
      return;
    }
    this.isConnected = false;
    this.log('ContextConsumer: Disconnected', this.host);

    if (this.config?.disposeOnDisconnect) {
      this.dispose();
    }

    this.host.removeEventListener(
      ContextProvideEvent.EventName,
      this.handleContextProvide as EventListener,
    );

    const ctxRemoveEvent = new ContextRequestRemoveEvent({
      requestee: this.host,
    });
    this.host.dispatchEvent(ctxRemoveEvent);
    this.ctxProvidersMap.forEach((provider) =>
      provider.deref()?.dispatchEvent(ctxRemoveEvent),
    );
    this.ctxProvidersMap.clear();
  }

  dispose() {
    this.ctxCallbacksMap.clear();
    this.disconnect();
  }

  protected requestWholeContext() {
    this.ctxCallbacksMap.forEach((_, key) => this.requestContext(key));
  }

  protected requestContext(key: unknown) {
    if (!this.isConnected) {
      return;
    }

    this.log('ContextConsumer: Requesting context', key, this.host);

    this.host.dispatchEvent(
      new ContextRequestEvent({
        ...this.config?.defaultEventInit,
        key,
        requestee: this.host,
      }),
    );
  }

  protected handleContextProvide = (event: ContextProvideEvent) => {
    this.log(
      'ContextConsumer: Received context',
      event.contextKey,
      event.contextValue,
      this.host,
    );

    this.ctxCallbacksMap.get(event.contextKey)?.(event.contextValue);
    this.ctxProvidersMap.set(event.contextKey, event.contextProvider);
  };
}

export interface ContextConsumerOptions {
  disposeOnDisconnect?: boolean;
  noRequestOnConnect?: boolean;
  defaultEventInit?: EventInit;
  debug?: boolean;
}

export interface ContextCallback<T = unknown> extends Function {
  (ctx: T): void;
}

export interface ContextConsumerConsumeOptions {
  once?: boolean;
  timeout?: number;
}
