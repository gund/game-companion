import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, ifDefined, ref } from './lit-directives';

declare global {
  interface HTMLElementTagNameMap {
    [NumInputElement.selector]: NumInputElement;
  }
}

@customElement(NumInputElement.selector)
export class NumInputElement extends LitElement {
  static readonly selector = 'tfm-num-input';

  @property() declare value: string;
  @property() declare min?: string;
  @property() declare max?: string;

  private inputRef = createRef<HTMLInputElement>();

  protected render() {
    return html`<input
        type="number"
        ${ref(this.inputRef)}
        .value=${this.value}
        .min=${ifDefined(this.min)}
        .max=${ifDefined(this.max)}
        @input=${{
          handleEvent: () => (this.value = this.inputRef.value?.value ?? ''),
        }}
      />
      <button type="button" @click=${this.decrement}>-</button>
      <button type="button" @click=${this.increment}>+</button>`;
  }

  increment() {
    const currValue = parseInt(this.value);

    if (this.max && currValue >= parseInt(this.max)) {
      return;
    }

    this.updateValue(String(currValue + 1));
  }

  decrement() {
    const currValue = parseInt(this.value);

    if (this.min && currValue <= parseInt(this.min)) {
      return;
    }

    this.updateValue(String(currValue - 1));
  }

  focus() {
    this.inputRef.value?.focus();
  }

  blur() {
    this.inputRef.value?.blur();
  }

  private updateValue(value: string) {
    const inputRef = this.inputRef.value;

    if (!inputRef) {
      return;
    }

    inputRef.value = value;

    inputRef.dispatchEvent(
      new Event('input', { bubbles: true, cancelable: true, composed: true })
    );
    inputRef.dispatchEvent(
      new Event('change', { bubbles: true, cancelable: true, composed: true })
    );
  }
}
