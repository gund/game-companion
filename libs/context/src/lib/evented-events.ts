export class EventedContextRequestEvent extends Event {
  static readonly eventName = 'evented-context-request';

  contextKey;
  contextRequestee;

  constructor({ key, requestee, ...init }: EventedContextRequestEventInit) {
    super(EventedContextRequestEvent.eventName, {
      composed: true,
      bubbles: true,
      cancelable: false,
      ...init,
    });
    this.contextKey = key;
    this.contextRequestee = new WeakRef(requestee);
  }
}

export interface EventedContextRequestEventInit extends EventInit {
  key: unknown;
  requestee: EventTarget;
}

export class EventedContextProvideEvent extends Event {
  static readonly eventName = 'evented-context-provide';

  contextKey;
  contextValue;
  contextProvider;

  constructor({
    key,
    value,
    provider,
    ...init
  }: EventedContextProvideEventInit) {
    super(EventedContextProvideEvent.eventName, {
      bubbles: false,
      cancelable: false,
      ...init,
    });
    this.contextKey = key;
    this.contextValue = value;
    this.contextProvider = new WeakRef(provider);
  }
}

export interface EventedContextProvideEventInit extends EventInit {
  key: unknown;
  value: unknown;
  provider: EventTarget;
}

export class EventedContextDisconnectEvent extends Event {
  static readonly eventName = 'evented-context-disconnect';

  contextKey?;
  contextRequestee;

  constructor({ key, requestee, ...init }: EventedContextDisconnectEventInit) {
    super(EventedContextDisconnectEvent.eventName, {
      bubbles: false,
      cancelable: false,
      ...init,
    });
    this.contextKey = key;
    this.contextRequestee = new WeakRef(requestee);
  }
}

export interface EventedContextDisconnectEventInit extends EventInit {
  key?: unknown;
  requestee: EventTarget;
}
