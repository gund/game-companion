/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { SpyInstance } from 'vitest';
import { ContextConsumer } from '../context-consumer.js';
import { contextConsumer, getConsumerFrom } from './consumer.js';

vi.mock('../context-consumer.js');

class EventTargetStub implements EventTarget {
  addEventListener = vi.fn();
  dispatchEvent = vi.fn();
  removeEventListener = vi.fn();
}

describe('@contextConsumer()', () => {
  const consumeSpy: SpyInstance = ContextConsumer.prototype.consume as any;
  const connectSpy: SpyInstance = ContextConsumer.prototype.connect as any;
  const disconnectSpy: SpyInstance = ContextConsumer.prototype
    .disconnect as any;

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return original constructor without context', () => {
    @contextConsumer()
    class Test extends EventTargetStub {}

    expect(Test.name).toBe('Test');
  });

  it('should return decorated constructor with context', () => {
    @contextConsumer()
    class Test extends EventTargetStub {
      @contextConsumer('key') prop = 'value';
    }

    expect(Test.name).not.toBe('Test');
  });

  it('should call constructor with context', () => {
    const ctorSpy = vi.fn();

    @contextConsumer()
    class Test extends EventTargetStub {
      @contextConsumer('key') prop = 'value';
      constructor(...args: unknown[]) {
        ctorSpy(...args);
        super();
      }
    }

    new Test('arg1', 'arg2');

    expect(ctorSpy).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should preserve class prototype with context', () => {
    @contextConsumer()
    class Test extends EventTargetStub {
      @contextConsumer('key1') prop1 = 'value1';
      @contextConsumer('key2') prop2 = 'value2';
      someMethod() {}
    }

    const instance = new Test();

    expect(Test.prototype).toEqual(
      expect.objectContaining({ someMethod: expect.any(Function) }),
    );
    expect(instance).toBeInstanceOf(Test);
  });

  it('should consume context', () => {
    @contextConsumer()
    class Test extends EventTargetStub {
      @contextConsumer('key1', 'options1' as any) prop1 = 'value1';
      @contextConsumer('key2', 'options2' as any) prop2 = 'value2';
    }

    const instance = new Test();

    expect(instance.prop1).toBe('value1');
    expect(instance.prop2).toBe('value2');
    expect(consumeSpy).toHaveBeenCalledTimes(2);
    expect(consumeSpy).toHaveBeenCalledWith(
      'key1',
      expect.any(Function),
      'options1',
    );
    expect(consumeSpy).toHaveBeenCalledWith(
      'key2',
      expect.any(Function),
      'options2',
    );
  });

  it('should allow update context in prop', () => {
    @contextConsumer()
    class Test extends EventTargetStub {
      @contextConsumer('key1') prop1 = 'initial-value1';
      @contextConsumer('key2') prop2 = 'initial-value2';
    }

    const instance = new Test();

    expect(instance.prop1).toBe('initial-value1');
    expect(instance.prop2).toBe('initial-value2');

    const updateCb1 = consumeSpy.mock.calls[0][1];
    const updateCb2 = consumeSpy.mock.calls[1][1];

    updateCb1('updated-value1');
    updateCb2('updated-value2');

    expect(instance.prop1).toBe('updated-value1');
    expect(instance.prop2).toBe('updated-value2');
  });

  it('should allow update context in getter/setter', () => {
    @contextConsumer()
    class Test extends EventTargetStub {
      private _prop = 'initial-value';

      @contextConsumer('key')
      get prop() {
        return this._prop;
      }
      set prop(val) {
        this._prop = val;
      }
    }

    const instance = new Test();

    expect(instance.prop).toBe('initial-value');

    const updateCb1 = consumeSpy.mock.calls[0][1];

    updateCb1('updated-value');

    expect(instance.prop).toBe('updated-value');
  });

  describe('connect hook', () => {
    it('should not call ContextConsumer.connect() by default', () => {
      @contextConsumer()
      class Test extends EventTargetStub {
        @contextConsumer('key') prop = 'value';
        connectedCallback() {}
      }

      const instance = new Test();
      instance.connectedCallback();

      expect(connectSpy).not.toHaveBeenCalled();
    });

    it('should call ContextConsumer.connect() on connectOn prop', () => {
      @contextConsumer({ connectOn: 'doConnect' })
      class Test extends EventTargetStub {
        @contextConsumer('key') prop = 'value';
        doConnect = () => {};
      }

      const instance = new Test();

      expect(connectSpy).not.toHaveBeenCalled();

      instance.doConnect();

      expect(connectSpy).toHaveBeenCalledTimes(1);
    });

    it('should call ContextConsumer.connect() on connectOn method', () => {
      @contextConsumer({ connectOn: 'doConnect' })
      class Test extends EventTargetStub {
        @contextConsumer('key') prop = 'value';
        doConnect() {}
      }

      const instance = new Test();

      expect(connectSpy).not.toHaveBeenCalled();

      instance.doConnect();

      expect(connectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('disconnect hook', () => {
    it('should not call ContextConsumer.disconnect() by default', () => {
      @contextConsumer()
      class Test extends EventTargetStub {
        @contextConsumer('key') prop = 'value';
        disconnectedCallback() {}
      }

      const instance = new Test();
      instance.disconnectedCallback();

      expect(disconnectSpy).not.toHaveBeenCalled();
    });

    it('should call ContextConsumer.disconnect() on disconnectOn prop', () => {
      @contextConsumer({ disconnectOn: 'doDisconnect' })
      class Test extends EventTargetStub {
        @contextConsumer('key') prop = 'value';
        doDisconnect = () => {};
      }

      const instance = new Test();

      expect(disconnectSpy).not.toHaveBeenCalled();

      instance.doDisconnect();

      expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });

    it('should call ContextConsumer.disconnect() on disconnectOn method', () => {
      @contextConsumer({ disconnectOn: 'doDisconnect' })
      class Test extends EventTargetStub {
        @contextConsumer('key') prop = 'value';
        doDisconnect() {}
      }

      const instance = new Test();

      expect(disconnectSpy).not.toHaveBeenCalled();

      instance.doDisconnect();

      expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });
  });
});

describe('getConsumerFrom()', () => {
  it('should return ContextConsumer from decorated instance with context', () => {
    @contextConsumer()
    class Test extends EventTargetStub {
      @contextConsumer('key') prop = 'value';
    }

    const ctxProvider = getConsumerFrom(new Test());

    expect(ctxProvider).toBeInstanceOf(ContextConsumer);
  });

  it('should return undefined from decorated instance without context', () => {
    @contextConsumer()
    class Test extends EventTargetStub {}

    const ctxProvider = getConsumerFrom(new Test());

    expect(ctxProvider).toBeUndefined();
  });

  it('should return undefined from undecorated instance', () => {
    class Test extends EventTargetStub {}

    const ctxProvider = getConsumerFrom(new Test());

    expect(ctxProvider).toBeUndefined();
  });
});
