export class ContextProvideEvent extends Event {
  static readonly EventName = 'context-provide';

  contextKey;
  contextValue;

  constructor(init: ContextProvideEventInit) {
    super(ContextProvideEvent.EventName, {
      bubbles: false,
      cancelable: false,
      ...init,
    });

    this.contextKey = init.key;
    this.contextValue = init.value;
  }
}

export interface ContextProvideEventInit extends EventInit {
  key: unknown;
  value: unknown;
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
