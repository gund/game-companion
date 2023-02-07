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
import { EventedContextConsumer as ContextConsumer } from './evented-consumer.js';
import { EventedContextProvider as ContextProvider } from './evented-provider.js';

describe('Context API', () => {
  afterEach(() => fixtureCleanup());

  it('should allow to provide and consume context', async () => {
    @customElement('x-test')
    class TestElement extends LitElement {
      @property() declare ctx1?: string;
      @property() declare ctx2?: string;

      ctxProvider = new ContextProvider(this);

      override connectedCallback(): void {
        super.connectedCallback();
        this.ctxProvider.connect();
      }

      override disconnectedCallback(): void {
        super.disconnectedCallback();
        this.ctxProvider.disconnect();
      }

      protected override render(): unknown {
        return html`<x-test-parent></x-test-parent>`;
      }

      protected override willUpdate(
        changedProps: PropertyValueMap<TestElement>,
      ): void {
        if (changedProps.has('ctx1')) {
          this.ctxProvider.provide('ctx1', this.ctx1);
        }

        if (changedProps.has('ctx2')) {
          this.ctxProvider.provide('ctx2', this.ctx2);
        }
      }
    }

    @customElement('x-test-parent')
    class TestParentElement extends LitElement {
      protected override render(): unknown {
        return html`<x-test-child></x-test-child>`;
      }
    }

    @customElement('x-test-child')
    class TestChildElement extends LitElement {
      declare ctx1: string;
      declare ctx2: string;

      ctxConsumer = new ContextConsumer(this);

      constructor() {
        super();

        this.ctxConsumer.consume<string>(
          'ctx1',
          (value) => (this.ctx1 = value),
        );
        this.ctxConsumer.consume<string>(
          'ctx2',
          (value) => (this.ctx2 = value),
        );
      }

      override connectedCallback(): void {
        super.connectedCallback();
        this.ctxConsumer.connect();
      }

      override disconnectedCallback(): void {
        super.disconnectedCallback();
        this.ctxConsumer.disconnect();
      }

      protected override render(): unknown {
        return html`child`;
      }
    }

    const elem = await fixture<TestElement>(
      html`<x-test ctx1="value1" ctx2="value2"></x-test>`,
    );

    const parentElem =
      elem.shadowRoot!.querySelector<TestParentElement>('x-test-parent')!;

    const childElem =
      parentElem.shadowRoot!.querySelector<TestChildElement>('x-test-child')!;

    expect(childElem.ctx1).toBe('value1');
    expect(childElem.ctx2).toBe('value2');

    elem.ctxProvider.provide('ctx1', 'updated-value1');

    expect(childElem.ctx1).toBe('updated-value1');
    expect(childElem.ctx2).toBe('value2');
  });
});
