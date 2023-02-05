/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SpyInstance } from 'vitest';
import { contextProvider } from './provider.js';
import { webContextProvider } from './web-provider.js';

vi.mock('./provider.js');

class EventTargetStub implements EventTarget {
  addEventListener = vi.fn();
  dispatchEvent = vi.fn();
  removeEventListener = vi.fn();
}

describe('@webContextProvider()', () => {
  const innerProviderSpy = vi.fn();
  const contextProviderSpy: SpyInstance = contextProvider as any;

  beforeEach(() => {
    contextProviderSpy.mockReturnValue(innerProviderSpy);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('as class decorator', () => {
    it('should call contextProvider() with connectedCallback/disconnectedCallback config', () => {
      @webContextProvider()
      class Test extends EventTargetStub {}

      expect(contextProviderSpy).toHaveBeenCalledWith({
        connectOn: 'connectedCallback',
        disconnectOn: 'disconnectedCallback',
      });
      expect(innerProviderSpy).toHaveBeenCalledWith(Test);
    });

    it('should call contextProvider() with passed extra config', () => {
      @webContextProvider({ extra: true } as any)
      class Test extends EventTargetStub {}

      expect(contextProviderSpy).toHaveBeenCalledWith({
        extra: true,
        connectOn: 'connectedCallback',
        disconnectOn: 'disconnectedCallback',
      });
      expect(innerProviderSpy).toHaveBeenCalledWith(Test);
    });
  });

  describe('as prop decorator', () => {
    it('should call contextProvider() with original args', () => {
      class Test {
        @webContextProvider('key', 'prop-options' as any) prop = 'value';
      }

      expect(contextProviderSpy).toHaveBeenCalledWith('key', 'prop-options');
      expect(innerProviderSpy).toHaveBeenCalledWith(
        Test.prototype,
        'prop',
        undefined,
      );
    });
  });

  describe('as getter/setter decorator', () => {
    it('should call contextProvider() with original args', () => {
      class Test {
        @webContextProvider('key', 'prop-options' as any)
        get prop() {
          return 'value';
        }
        set prop(_) {
          // Noop
        }
      }

      expect(contextProviderSpy).toHaveBeenCalledWith('key', 'prop-options');
      expect(innerProviderSpy).toHaveBeenCalledWith(
        Test.prototype,
        'prop',
        expect.objectContaining({
          get: expect.any(Function),
          set: expect.any(Function),
        }),
      );
    });
  });
});
