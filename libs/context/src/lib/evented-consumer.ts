import { ContextConsumer, ContextConsumerOptions } from './consumer.js';
import {
  EventedContextDisconnectEvent,
  EventedContextProvideEvent,
  EventedContextRequestEvent,
} from './evented-events.js';

export class EventedContextConsumer extends ContextConsumer {
  constructor(
    host: EventTarget,
    protected override config?: EventedContextConsumerOptions,
  ) {
    super(host, config);
  }

  override connect() {
    this.host.addEventListener(
      EventedContextProvideEvent.eventName,
      this.handleProvideEvent as EventListener,
    );

    super.connect();
  }

  override disconnect() {
    this.host.removeEventListener(
      EventedContextProvideEvent.eventName,
      this.handleProvideEvent as EventListener,
    );

    super.disconnect();
  }

  protected override requestContext(key: unknown) {
    if (!this.canRequestContext(key)) {
      return;
    }

    this.log('Requesting context', key, this.host);

    this.host.dispatchEvent(
      new EventedContextRequestEvent({
        ...this.config?.defaultEventInit,
        key,
        requestee: this.host,
      }),
    );
  }

  protected handleProvideEvent = (event: EventedContextProvideEvent) => {
    const key = event.contextKey;
    const value = event.contextValue;
    const providerRef = event.contextProvider;

    this.log('Received evented context', key, value, this.host);

    this.handleContext(key, value, () => {
      providerRef.deref()?.dispatchEvent(
        new EventedContextDisconnectEvent({
          ...this.config?.defaultEventInit,
          key,
          requestee: this.host,
        }),
      );
    });
  };
}

export interface EventedContextConsumerOptions extends ContextConsumerOptions {}
