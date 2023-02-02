/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SpyInstance } from 'vitest';
import { contextConsumer } from './consumer.js';
import { webContextConsumer } from './web-consumer.js';

vi.mock('./consumer.js');

class EventTargetStub implements EventTarget {
  addEventListener = vi.fn();
  dispatchEvent = vi.fn();
  removeEventListener = vi.fn();
}

describe('@webContextConsumer()', () => {
  const innerConsumerSpy = vi.fn();
  const contextConsumerSpy: SpyInstance = contextConsumer as any;

  beforeEach(() => {
    contextConsumerSpy.mockReturnValue(innerConsumerSpy);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('as class decorator', () => {
    it('should call contextConsumer() with connectedCallback/disconnectedCallback config', () => {
      @webContextConsumer()
      class Test extends EventTargetStub {}

      expect(contextConsumerSpy).toHaveBeenCalledWith({
        connectOn: 'connectedCallback',
        disconnectOn: 'disconnectedCallback',
      });
    });

    it('should call contextConsumer() with passed extra config', () => {
      @webContextConsumer({ extra: true } as any)
      class Test extends EventTargetStub {}

      expect(contextConsumerSpy).toHaveBeenCalledWith({
        extra: true,
        connectOn: 'connectedCallback',
        disconnectOn: 'disconnectedCallback',
      });
    });
  });

  describe('as prop decorator', () => {
    it('should call contextProvider() with original args', () => {
      class Test {
        @webContextConsumer('key') prop = 'value';
      }

      expect(contextConsumerSpy).toHaveBeenCalledWith('key');
      expect(innerConsumerSpy).toHaveBeenCalledWith(
        Test.prototype,
        'prop',
        undefined
      );
    });
  });

  describe('as getter/setter decorator', () => {
    it('should call contextProvider() with original args', () => {
      class Test {
        @webContextConsumer('key')
        get prop() {
          return 'value';
        }
        set prop(_) {
          // Noop
        }
      }

      expect(contextConsumerSpy).toHaveBeenCalledWith('key');
      expect(innerConsumerSpy).toHaveBeenCalledWith(
        Test.prototype,
        'prop',
        expect.objectContaining({
          get: expect.any(Function),
          set: expect.any(Function),
        })
      );
    });
  });
});
