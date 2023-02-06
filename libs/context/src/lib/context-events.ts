export class ContextProvideEvent extends Event {
  static readonly EventName = 'context-provide';

  contextKey;
  contextValue;
  contextProvider;

  constructor({ key, value, provider, ...init }: ContextProvideEventInit) {
    super(ContextProvideEvent.EventName, {
      bubbles: false,
      cancelable: false,
      ...init,
    });

    this.contextKey = key;
    this.contextValue = value;
    this.contextProvider = new WeakRef(provider);
  }
}

export interface ContextProvideEventInit extends EventInit {
  key: unknown;
  value: unknown;
  provider: EventTarget;
}

export class ContextRequestEvent extends Event {
  static readonly EventName = 'context-request';

  contextKey;
  contextRequestee;

  constructor({ key, requestee, ...init }: ContextRequestEventInit) {
    super(ContextRequestEvent.EventName, {
      bubbles: true,
      cancelable: false,
      composed: true,
      ...init,
    });

    this.contextKey = key;
    this.contextRequestee = new WeakRef(requestee);
  }
}

export interface ContextRequestEventInit extends EventInit {
  key: unknown;
  requestee: EventTarget;
}

export class ContextRequestRemoveEvent extends Event {
  static readonly EventName = 'context-request-remove';

  contextKey;
  contextRequestee;

  constructor({ key, requestee, ...init }: ContextRequestRemoveEventInit) {
    super(ContextRequestRemoveEvent.EventName, {
      bubbles: true,
      cancelable: false,
      composed: true,
      ...init,
    });

    this.contextKey = key;
    this.contextRequestee = new WeakRef(requestee);
  }
}

export interface ContextRequestRemoveEventInit extends EventInit {
  key?: unknown;
  requestee: EventTarget;
}

declare global {
  interface HTMLElementEventMap {
    [ContextProvideEvent.EventName]: ContextProvideEvent;
    [ContextRequestEvent.EventName]: ContextRequestEvent;
    [ContextRequestRemoveEvent.EventName]: ContextRequestRemoveEvent;
  }
}
