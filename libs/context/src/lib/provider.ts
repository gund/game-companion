import { InferContext } from './context-map.js';
import { ContextRequestCallback, ContextRequestEvent } from './events.js';

export class ContextProvider {
  protected ctxMap = new Map<unknown, unknown>();
  protected callbackMap = new Map<unknown, Set<ContextRequestCallback>>();
  protected log;

  constructor(
    protected host: EventTarget,
    protected config?: ContextProviderOptions,
  ) {
    this.log = this.config?.debug ? console.debug : () => void 0;
  }

  provide<K extends string | symbol | number>(
    key: K,
    value: InferContext<K>,
  ): () => void;
  provide(key: unknown, value: unknown): () => void;
  provide(key: unknown, value: unknown) {
    this.ctxMap.set(key, value);
    this.sendContextToAll(key);

    return () => this.unProvide(key);
  }

  unProvide(key: unknown) {
    this.ctxMap.delete(key);
  }

  connect() {
    this.log('ContextProvider connected', this.host);

    this.host.addEventListener(
      ContextRequestEvent.eventName,
      this.handleRequest as EventListener,
    );
  }

  disconnect() {
    this.log('ContextProvider disconnected', this.host);

    this.host.removeEventListener(
      ContextRequestEvent.eventName,
      this.handleRequest as EventListener,
    );
    this.ctxMap.clear();
    this.callbackMap.clear();
  }

  protected canHandleRequest(key: unknown) {
    return this.ctxMap.has(key);
  }

  protected sendContextToAll(key: unknown) {
    if (!this.callbackMap.has(key) || !this.ctxMap.has(key)) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.callbackMap
      .get(key)!
      .forEach((callback) => this.sendContextTo(key, callback));
  }

  protected sendContextTo(key: unknown, callback: ContextRequestCallback) {
    if (!this.ctxMap.has(key)) {
      return;
    }

    const context = this.ctxMap.get(key);

    this.log('Sending context', key, context, this.host);

    callback(context, () => {
      this.log('Context disconncted', key);

      this.callbackMap.get(key)?.delete(callback);

      if (this.callbackMap.get(key)?.size === 0) {
        this.callbackMap.delete(key);
      }
    });
  }

  protected handleRequest = (event: ContextRequestEvent) => {
    const key = event.contextKey;

    if (!this.canHandleRequest(key)) {
      return;
    }

    this.log('Handling request', key, this.host);

    event.stopImmediatePropagation();

    if (!this.callbackMap.has(key)) {
      this.callbackMap.set(key, new Set());
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.callbackMap.get(key)!.add(event.contextCallback);

    this.sendContextTo(key, event.contextCallback);
  };
}

export interface ContextProviderOptions {
  debug?: boolean;
}
