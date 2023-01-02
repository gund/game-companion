import '@game-companion/core/haptic-feedback';
import {
  createRef,
  customElement,
  html,
  ifDefined,
  LitElement,
  live,
  property,
  queryAssignedElements,
  ref,
  state,
} from '@game-companion/lit';
import { hiddenStyles } from '@game-companion/mdc';
import '@game-companion/mdc/text-field';
import { MdcTextFieldElement } from '@game-companion/mdc/text-field';

declare global {
  interface HTMLElementTagNameMap {
    [GcNumInputElement.selector]: GcNumInputElement;
  }
}

@customElement(GcNumInputElement.selector)
export class GcNumInputElement extends LitElement {
  static readonly selector = 'gc-num-input';
  static override styles = [hiddenStyles];

  @property() declare value: string;
  @property() declare label?: string;
  @property() declare min?: string;
  @property() declare max?: string;

  @queryAssignedElements({ slot: 'hint' })
  private declare hintSlot: HTMLElement[];

  @state() private declare hintLabel?: string;

  private textFiledRef = createRef<MdcTextFieldElement>();

  protected override render() {
    return html`<gc-haptic-feedback event="input">
        <mdc-text-field
          type="number"
          value=${live(this.value)}
          label=${ifDefined(this.label)}
          hintLabel=${ifDefined(this.hintLabel)}
          hintPersistent
          min=${ifDefined(this.min)}
          max=${ifDefined(this.max)}
          leadingIcon="remove"
          leadingIconLabel="Decrement"
          trailingIcon="add"
          trailingIconLabel="Increment"
          @mdcTextFieldIconClick:leading=${this.decrement}
          @mdcTextFieldIconClick:trailing=${this.increment}
          @input=${{
            handleEvent: () =>
              (this.value = this.textFiledRef.value?.value ?? ''),
          }}
          ${ref(this.textFiledRef)}
        ></mdc-text-field>
      </gc-haptic-feedback>
      <div class="hidden"><slot name="hint"></slot></div>`;
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
    this.textFiledRef.value?.focus();
  }

  override blur() {
    this.textFiledRef.value?.blur();
  }

  protected override updated() {
    setTimeout(() => this.updateHint());
  }

  private updateValue(value: string) {
    const inputRef = this.textFiledRef.value;

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

  private updateHint() {
    this.hintLabel = this.hintSlot.reduce(
      (txt, hint) => (txt += hint.textContent),
      ''
    );
  }
}
