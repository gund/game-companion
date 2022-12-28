import {
  createRef,
  customElement,
  html,
  ifDefined,
  LitElement,
  property,
  ref,
} from '@game-companion/lit';
import './haptic-feedback.element';

declare global {
  interface HTMLElementTagNameMap {
    [GcNumInputElement.selector]: GcNumInputElement;
  }
}

@customElement(GcNumInputElement.selector)
export class GcNumInputElement extends LitElement {
  static readonly selector = 'gc-num-input';

  @property() declare value: string;
  @property() declare min?: string;
  @property() declare max?: string;

  private inputRef = createRef<HTMLInputElement>();

  protected override render() {
    return html`<gc-haptic-feedback event="input">
        <input
          type="number"
          ${ref(this.inputRef)}
          .value=${this.value}
          .min=${ifDefined(this.min)}
          .max=${ifDefined(this.max)}
          @input=${{
            handleEvent: () => (this.value = this.inputRef.value?.value ?? ''),
          }}
        />
      </gc-haptic-feedback>
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

  override focus() {
    this.inputRef.value?.focus();
  }

  override blur() {
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
