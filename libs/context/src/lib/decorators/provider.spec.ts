/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { SpyInstance } from 'vitest';
import { ContextProvider } from '../context-provider.js';
import { contextProvider, getProviderFrom } from './provider.js';

vi.mock('../context-provider.js');

class EventTargetStub implements EventTarget {
  addEventListener = vi.fn();
  dispatchEvent = vi.fn();
  removeEventListener = vi.fn();
}

describe('@contextProvider()', () => {
  const provideSpy: SpyInstance = ContextProvider.prototype.provide as any;
  const connectSpy: SpyInstance = ContextProvider.prototype.connect as any;
  const disconnectSpy: SpyInstance = ContextProvider.prototype
    .disconnect as any;

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return original constructor without context', () => {
    @contextProvider()
    class Test extends EventTargetStub {}

    expect(Test.name).toBe('Test');
  });

  it('should return decorated constructor with context', () => {
    @contextProvider()
    class Test extends EventTargetStub {
      @contextProvider('key') prop = 'value';
    }

    expect(Test.name).not.toBe('Test');
  });

  it('should call constructor with context', () => {
    const ctorSpy = vi.fn();

    @contextProvider()
    class Test extends EventTargetStub {
      @contextProvider('key') prop = 'value';
      constructor(...args: unknown[]) {
        ctorSpy(...args);
        super();
      }
    }

    new Test('arg1', 'arg2');

    expect(ctorSpy).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should preserve class prototype with context', () => {
    @contextProvider()
    class Test extends EventTargetStub {
      @contextProvider('key1') prop1 = 'value1';
      @contextProvider('key2') prop2 = 'value2';
      someMethod() {}
    }

    const instance = new Test();

    expect(Test.prototype).toEqual(
      expect.objectContaining({ someMethod: expect.any(Function) }),
    );
    expect(instance).toBeInstanceOf(Test);
  });

  it('should provide context with initial value', () => {
    @contextProvider()
    class Test extends EventTargetStub {
      @contextProvider('key1') prop1 = 'initial-value1';
      @contextProvider('key2') prop2 = 'initial-value2';
    }

    const instance = new Test();

    expect(instance.prop1).toBe('initial-value1');
    expect(instance.prop2).toBe('initial-value2');
    expect(provideSpy).toHaveBeenCalledTimes(2);
    expect(provideSpy).toHaveBeenCalledWith('key1', 'initial-value1');
    expect(provideSpy).toHaveBeenCalledWith('key2', 'initial-value2');
  });

  it('should make context props enumerable on prototype', () => {
    @contextProvider()
    class Test extends EventTargetStub {
      @contextProvider('key1') prop1 = 'initial-value1';
      @contextProvider('key2') prop2 = 'initial-value2';
    }

    const instance = new Test();

    expect(
      Object.keys(Object.getPrototypeOf(Object.getPrototypeOf(instance))),
    ).toEqual(expect.arrayContaining(['prop1', 'prop2']));
  });

  it('should make context props configurable', () => {
    @contextProvider()
    class Test extends EventTargetStub {
      @contextProvider('key1') prop1 = 'initial-value1';
      @contextProvider('key2') prop2 = 'initial-value2';
    }

    const instance = new Test();

    instance.prop1 = 'value1';
    instance.prop2 = 'value2';

    expect(instance.prop1).toBe('value1');
    expect(instance.prop2).toBe('value2');
  });

  it('should provide context with updated values', () => {
    @contextProvider()
    class Test extends EventTargetStub {
      @contextProvider('key') prop = 'initial-value';
    }

    const instance = new Test();

    instance.prop = 'updated-value';

    expect(instance.prop).toBe('updated-value');
    expect(provideSpy).toHaveBeenCalledTimes(2);
    expect(provideSpy).toHaveBeenCalledWith('key', 'updated-value');
  });

  describe('with getter/setter', () => {
    it('should provide context with initial value', () => {
      @contextProvider()
      class Test extends EventTargetStub {
        @contextProvider('key') get prop() {
          return 'initial-value';
        }
      }

      const instance = new Test();

      expect(instance.prop).toBe('initial-value');
      expect(provideSpy).toHaveBeenCalledTimes(1);
      expect(provideSpy).toHaveBeenCalledWith('key', 'initial-value');
    });

    it('should provide context with updated values', () => {
      @contextProvider()
      class Test extends EventTargetStub {
        private _prop = 'initial-value';

        @contextProvider('key')
        get prop() {
          return this._prop;
        }
        set prop(val) {
          this._prop = val;
        }
      }

      const instance = new Test();

      instance.prop = 'updated-value';

      expect(instance.prop).toBe('updated-value');
      expect(provideSpy).toHaveBeenCalledTimes(2);
      expect(provideSpy).toHaveBeenCalledWith('key', 'updated-value');
    });

    it('should update context with custom setter value', () => {
      @contextProvider()
      class Test extends EventTargetStub {
        private _prop = 'initial-value';

        @contextProvider('key')
        get prop() {
          return this._prop;
        }
        set prop(val) {
          this._prop = val + '-custom';
        }
      }

      const instance = new Test();

      expect(instance.prop).toBe('initial-value');

      instance.prop = 'updated-value';

      expect(instance.prop).toBe('updated-value-custom');
      expect(provideSpy).toHaveBeenCalledTimes(2);
      expect(provideSpy).toHaveBeenCalledWith('key', 'updated-value-custom');
    });

    it('should not update context if setter discards new value', () => {
      @contextProvider()
      class Test extends EventTargetStub {
        @contextProvider('key')
        get prop() {
          return 'initial-value';
        }
        set prop(_) {
          // Noop
        }
      }

      const instance = new Test();

      instance.prop = 'updated-value';

      expect(instance.prop).toBe('initial-value');
      expect(provideSpy).toHaveBeenCalledTimes(1);
      expect(provideSpy).toHaveBeenCalledWith('key', 'initial-value');
      expect(provideSpy).not.toHaveBeenCalledWith('key', 'updated-value');
    });
  });

  describe('connect hook', () => {
    it('should not call ContextProvider.connect() by default', () => {
      @contextProvider()
      class Test extends EventTargetStub {
        @contextProvider('key') prop = 'value';
        connectedCallback() {}
      }

      const instance = new Test();
      instance.connectedCallback();

      expect(connectSpy).not.toHaveBeenCalled();
    });

    it('should call ContextProvider.connect() on connectOn method', () => {
      @contextProvider({ connectOn: 'doConnect' })
      class Test extends EventTargetStub {
        @contextProvider('key') prop = 'value';
        doConnect() {}
      }

      const instance = new Test();

      expect(connectSpy).not.toHaveBeenCalled();

      instance.doConnect();

      expect(connectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('disconnect hook', () => {
    it('should not call ContextProvider.disconnect() by default', () => {
      @contextProvider()
      class Test extends EventTargetStub {
        @contextProvider('key') prop = 'value';
        disconnectedCallback() {}
      }

      const instance = new Test();
      instance.disconnectedCallback();

      expect(disconnectSpy).not.toHaveBeenCalled();
    });

    it('should call ContextProvider.disconnect() on disconnectOn method', () => {
      @contextProvider({ disconnectOn: 'doDisconnect' })
      class Test extends EventTargetStub {
        @contextProvider('key') prop = 'value';
        doDisconnect() {}
      }

      const instance = new Test();

      expect(disconnectSpy).not.toHaveBeenCalled();

      instance.doDisconnect();

      expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });
  });
});

describe('getProviderFrom()', () => {
  it('should return ContextProvider from decorated instance with context', () => {
    @contextProvider()
    class Test extends EventTargetStub {
      @contextProvider('key') prop = 'value';
    }

    const ctxProvider = getProviderFrom(new Test());

    expect(ctxProvider).toBeInstanceOf(ContextProvider);
  });

  it('should return undefined from decorated instance without context', () => {
    @contextProvider()
    class Test extends EventTargetStub {}

    const ctxProvider = getProviderFrom(new Test());

    expect(ctxProvider).toBeUndefined();
  });

  it('should return undefined from undecorated instance', () => {
    class Test extends EventTargetStub {}

    const ctxProvider = getProviderFrom(new Test());

    expect(ctxProvider).toBeUndefined();
  });
});
