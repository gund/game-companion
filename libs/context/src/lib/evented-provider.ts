import {
  EventedContextDisconnectEvent,
  EventedContextProvideEvent,
  EventedContextRequestEvent,
} from './evented-events.js';
import {
  ContextRequestDisconnectCallback,
  ContextRequestEvent,
} from './events.js';
import { ContextProvider, ContextProviderOptions } from './provider.js';

export class EventedContextProvider extends ContextProvider {
  protected disconnectMap = new WeakMap<
    EventTarget,
    Set<ContextRequestDisconnectCallback>
  >();

  constructor(
    host: EventTarget,
    protected override config?: EventedContextProviderOptions,
  ) {
    super(host, config);
  }

  override connect() {
    this.host.addEventListener(
      EventedContextRequestEvent.eventName,
      this.handleEventedRequest as EventListener,
    );

    this.host.addEventListener(
      EventedContextDisconnectEvent.eventName,
      this.handleDisconnect as EventListener,
    );

    super.connect();
  }

  override disconnect() {
    this.host.removeEventListener(
      EventedContextRequestEvent.eventName,
      this.handleEventedRequest as EventListener,
    );

    this.host.removeEventListener(
      EventedContextDisconnectEvent.eventName,
      this.handleDisconnect as EventListener,
    );

    super.disconnect();
  }

  protected broadcastContext(
    key: unknown,
    value: unknown,
    requesteeRef: WeakRef<EventTarget>,
  ) {
    const requestee = requesteeRef.deref();

    if (!requestee) {
      return;
    }

    this.log('Broadcasting context', key, value, requestee);

    requestee.dispatchEvent(
      new EventedContextProvideEvent({
        ...this.config?.defaultEventInit,
        key,
        value,
        provider: this.host,
      }),
    );
  }

  protected handleEventedRequest = (event: EventedContextRequestEvent) => {
    if (!this.canHandleRequest(event.contextKey)) {
      return;
    }

    event.stopImmediatePropagation();

    const key = event.contextKey;
    const requesteeRef = event.contextRequestee;

    this.log('Handling evented request', key, this.host);

    const innerEvent = new ContextRequestEvent({
      key,
      callback: (value, disconnectCb) => {
        const requestee = requesteeRef.deref();

        if (disconnectCb && requestee) {
          if (!this.disconnectMap.has(requestee)) {
            this.disconnectMap.set(requestee, new Set());
          }

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.disconnectMap.get(requestee)!.add(disconnectCb);
        }

        this.broadcastContext(key, value, requesteeRef);
      },
    });

    this.handleRequest(innerEvent);
  };

  protected handleDisconnect = (event: EventedContextDisconnectEvent) => {
    const requestee = event.contextRequestee.deref();

    if (requestee === undefined) {
      return;
    }

    const disconnects = this.disconnectMap.get(requestee);

    if (disconnects === undefined) {
      return;
    }

    this.log(
      `Handling ${disconnects.size} disconnect(s)`,
      requestee,
      this.host,
    );

    disconnects.forEach((disconnect) => disconnect());
    this.disconnectMap.delete(requestee);
  };
}

export interface EventedContextProviderOptions extends ContextProviderOptions {
  defaultEventInit?: EventInit;
}
