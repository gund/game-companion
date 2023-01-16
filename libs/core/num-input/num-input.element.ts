import '@game-companion/core/haptic-feedback';
import {
  createRef,
  css,
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
  static override styles = [
    hiddenStyles,
    css`
      :host {
        display: inline-block;
      }

      mdc-text-field {
        width: 100%;
      }
    `,
  ];

  @property() declare value: string;
  @property() declare label?: string;
  @property() declare min?: string;
  @property() declare max?: string;

  @queryAssignedElements({ slot: 'hint' })
  private declare hintSlot: HTMLElement[];

  @state() private declare hintLabel?: string;

  private textFieldRef = createRef<MdcTextFieldElement>();

  constructor() {
    super();

    this.value = '0';
  }

  increment() {
    const newValue = parseInt(this.value || '0') + 1;

    if (this.max && newValue > parseInt(this.max)) {
      return;
    }

    this.updateValue(String(newValue));
  }

  decrement() {
    const newValue = parseInt(this.value || '0') - 1;

    if (this.min && newValue < parseInt(this.min)) {
      return;
    }

    this.updateValue(String(newValue));
  }

  override focus() {
    this.textFieldRef.value?.focus();
  }

  override blur() {
    this.textFieldRef.value?.blur();
  }

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
              this.updateValue(this.textFieldRef.value?.value || '', true),
          }}
          ${ref(this.textFieldRef)}
        ></mdc-text-field>
      </gc-haptic-feedback>
      <div class="hidden"><slot name="hint"></slot></div>`;
  }

  protected override updated() {
    setTimeout(() => this.updateHint());
  }

  private updateValue(value: string, skipEvents = false) {
    if (value === this.value || !this.textFieldRef.value) {
      return;
    }

    this.value = value;
    this.textFieldRef.value.value = value;
    this.textFieldRef.value.focus();

    if (!skipEvents) {
      this.textFieldRef.value?.dispatchEvent(
        new Event('input', {
          bubbles: true,
          cancelable: false,
          composed: true,
        })
      );
      this.textFieldRef.value?.dispatchEvent(
        new Event('change', {
          bubbles: true,
          cancelable: false,
          composed: true,
        })
      );
    }
  }

  private updateHint() {
    this.hintLabel = this.hintSlot.reduce(
      (txt, hint) => (txt += hint.textContent),
      ''
    );
  }
}
