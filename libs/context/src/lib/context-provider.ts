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

  constructor(
    protected host: EventTarget,
    protected config?: ContextProviderOptions
  ) {}

  provide<K extends string | symbol | number>(
    key: K,
    value: InferContext<K>
  ): void;
  provide(key: unknown, value: unknown): void;
  provide(key: unknown, value: unknown) {
    this.ctxMap.set(key, value);
    this.broadcastContext(key, value);
  }

  connect() {
    this.isConnected = true;
    console.debug('ContextProvider: Connected', this.host);

    this.host.addEventListener(
      ContextRequestEvent.EventName,
      this.handleContextRequest as EventListener
    );

    this.host.addEventListener(
      ContextRequestRemoveEvent.EventName,
      this.cleanup as EventListener
    );

    if (!this.config?.noBroadcastOnConnect) {
      this.broadcastWholeContext();
    }
  }

  disconnect() {
    this.isConnected = false;
    console.debug('ContextProvider: Disconnected', this.host);

    this.host.removeEventListener(
      ContextRequestEvent.EventName,
      this.handleContextRequest as EventListener
    );

    this.host.removeEventListener(
      ContextRequestRemoveEvent.EventName,
      this.cleanup as EventListener
    );

    this.scheduleCleanup();
  }

  dispose() {
    this.disconnect();
    this.ctxMap.clear();
    this.requesteeMap.clear();
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
    });

    this.requesteeMap.get(key)?.forEach((target) => {
      target.deref() &&
        console.debug(
          'ContextProvider: Broadcasting context',
          event,
          target.deref()
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
    console.debug(
      'ContextProvider: Handling context request',
      event.contextKey
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
      this.cleanup(event)
    );
  };

  protected cleanup(event?: ContextRequestRemoveEvent) {
    this.scheduledCleanup = undefined;
    console.debug(
      'ContextProvider: Cleaning up requestees',
      this.requesteeMap,
      event
    );
    const eventTarget = event?.contextRequestee.deref();
    const eventContextKey = event?.contextKey;

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

    console.debug('Cleanup done', this.requesteeMap);
  }
}

export interface ContextProviderOptions {
  noBroadcastOnConnect?: boolean;
  noCleanupWhenIdle?: boolean;
  defaultEventInit?: EventInit;
}
