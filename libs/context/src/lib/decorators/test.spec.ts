/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  customElement,
  html,
  LitElement,
  property,
  PropertyValueMap,
} from '@game-companion/lit';
import { fixture, fixtureCleanup } from '@open-wc/testing';
import { webContextConsumer } from './web-consumer.js';
import { webContextProvider } from './web-provider.js';

describe('Decorator Context API', () => {
  afterEach(() => fixtureCleanup());

  it('should allow to provide and consume context', async () => {
    @customElement('x-test')
    @webContextProvider()
    class TestElement extends LitElement {
      @property()
      @webContextProvider('ctx1')
      declare ctx1?: string;

      @property()
      @webContextProvider('ctx2')
      declare ctx2?: string;

      protected override render(): unknown {
        return html`<x-test-parent></x-test-parent>`;
      }
    }

    @customElement('x-test-parent')
    class TestParentElement extends LitElement {
      protected override render(): unknown {
        return html`<x-test-child></x-test-child>`;
      }
    }

    @customElement('x-test-child')
    @webContextConsumer()
    class TestChildElement extends LitElement {
      @webContextConsumer('ctx1') ctx1 = 'initial-value1';
      @webContextConsumer('ctx2') ctx2 = 'initial-value2';

      protected override render(): unknown {
        return html`child`;
      }
    }

    const elem = await fixture<TestElement>(
      html`<x-test ctx1="value1" ctx2="value2"></x-test>`
    );

    const parentElem =
      elem.shadowRoot!.querySelector<TestParentElement>('x-test-parent')!;

    const childElem =
      parentElem.shadowRoot!.querySelector<TestChildElement>('x-test-child')!;

    expect(childElem.ctx1).toBe('value1');
    expect(childElem.ctx2).toBe('value2');

    elem.ctx1 = 'updated-value1';

    expect(childElem.ctx1).toBe('updated-value1');
    expect(childElem.ctx2).toBe('value2');
  });
});
