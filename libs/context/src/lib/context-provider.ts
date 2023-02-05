import {
  ContextProvideEvent,
  ContextRequestEvent,
  ContextRequestRemoveEvent,
} from './context-events.js';
import { InferContext } from './context-map.js';

export class ContextProvider {
  protected ctxMap = new Map<unknown, unknown>();
  protected requesteeMap = new Map<unknown, Set<WeakRef<EventTarget>>>();
  protected isConnected = false;
  protected scheduledCleanup?: number;
  protected schedule =
    'requestIdleCallback' in globalThis ? requestIdleCallback : setTimeout;
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
    this.broadcastContext(key, value);

    return () => this.unProvide(key);
  }

  unProvide(key: unknown) {
    this.ctxMap.delete(key);
    this.broadcastContext(key, undefined);
  }

  connect() {
    if (this.isConnected) {
      return;
    }
    this.isConnected = true;
    this.log('ContextProvider: Connected', this.host);

    this.host.addEventListener(
      ContextRequestEvent.EventName,
      this.handleContextRequest as EventListener,
    );

    this.host.addEventListener(
      ContextRequestRemoveEvent.EventName,
      this.cleanup as EventListener,
    );

    if (!this.config?.noBroadcastOnConnect) {
      this.broadcastWholeContext();
    }
  }

  disconnect(isDisposed = false) {
    if (!this.isConnected) {
      return;
    }
    this.isConnected = false;
    this.log('ContextProvider: Disconnected', this.host);

    if (this.config?.disposeOnDisconnect) {
      this.dispose();
    } else if (!isDisposed) {
      this.scheduleCleanup();
    }

    this.host.removeEventListener(
      ContextRequestEvent.EventName,
      this.handleContextRequest as EventListener,
    );

    this.host.removeEventListener(
      ContextRequestRemoveEvent.EventName,
      this.cleanup as EventListener,
    );
  }

  dispose() {
    this.ctxMap.clear();
    this.requesteeMap.clear();
    this.disconnect(true);
  }

  protected broadcastWholeContext() {
    this.ctxMap.forEach((value, key) => this.broadcastContext(key, value));
  }

  protected broadcastContext(key: unknown, value: unknown) {
    if (!this.isConnected) {
      return;
    }

    const event = new ContextProvideEvent({
      ...this.config?.defaultEventInit,
      key: key,
      value: value,
      provider: this.host,
    });

    this.requesteeMap.get(key)?.forEach((target) => {
      target.deref() &&
        this.log(
          'ContextProvider: Broadcasting context',
          event,
          target.deref(),
        );
      target.deref()?.dispatchEvent(event);
    });
  }

  protected handleContextRequest = (event: ContextRequestEvent) => {
    if (!this.requesteeMap.has(event.contextKey)) {
      this.requesteeMap.set(event.contextKey, new Set());
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.requesteeMap.get(event.contextKey)!.add(event.contextRequestee);

    if (!this.ctxMap.has(event.contextKey)) {
      return;
    }

    this.log(
      'ContextProvider: Handling context request',
      event.contextKey,
      this.host,
    );

    event.stopImmediatePropagation();

    this.broadcastContext(event.contextKey, this.ctxMap.get(event.contextKey));

    this.scheduleCleanup();
  };

  protected scheduleCleanup = (event?: ContextRequestRemoveEvent) => {
    if (this.config?.noCleanupWhenIdle) {
      this.cleanup();
      return;
    }

    if (this.scheduledCleanup !== undefined) {
      return;
    }

    this.scheduledCleanup = this.schedule.call(undefined, () =>
      this.cleanup(event),
    );
  };

  protected cleanup = (event?: ContextRequestRemoveEvent) => {
    this.scheduledCleanup = undefined;
    const eventTarget = event?.contextRequestee.deref();
    const eventContextKey = event?.contextKey;
    const totalRefsBefore = Array.from(this.requesteeMap.values()).reduce(
      (count, targets) => count + targets.size,
      0,
    );

    this.log(
      'ContextProvider: Cleaning up',
      this.requesteeMap,
      event,
      this.host,
    );

    this.requesteeMap.forEach((targets, key) => {
      targets.forEach((targetRef) => {
        const target = targetRef.deref();
        if (
          target === undefined ||
          (target === eventTarget &&
            (eventContextKey === undefined || eventContextKey === key))
        ) {
          targets.delete(targetRef);
        }
      });

      if (targets.size === 0) {
        this.requesteeMap.delete(key);
      }
    });

    const totalRefsAfter = Array.from(this.requesteeMap.values()).reduce(
      (count, targets) => count + targets.size,
      0,
    );

    this.log(
      `Cleaned up ${totalRefsBefore - totalRefsAfter} refs!`,
      this.requesteeMap,
    );
  };
}

export interface ContextProviderOptions {
  disposeOnDisconnect?: boolean;
  noBroadcastOnConnect?: boolean;
  noCleanupWhenIdle?: boolean;
  defaultEventInit?: EventInit;
  debug?: boolean;
}
