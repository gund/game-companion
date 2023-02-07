export class ContextRequestEvent extends Event {
  static readonly eventName = 'context-request';

  contextKey: unknown;
  contextCallback: ContextRequestCallback;

  constructor({ key, callback, ...init }: ContextRequestEventInit) {
    super(ContextRequestEvent.eventName, {
      bubbles: true,
      composed: true,
      cancelable: false,
      ...init,
    });
    this.contextKey = key;
    this.contextCallback = callback;
  }
}

export interface ContextRequestEventInit extends EventInit {
  key: unknown;
  callback: ContextRequestCallback;
}

export interface ContextRequestCallback extends Function {
  (value: unknown, disconnectCb?: ContextRequestDisconnectCallback): void;
}

export interface ContextRequestDisconnectCallback extends Function {
  (): void;
}
