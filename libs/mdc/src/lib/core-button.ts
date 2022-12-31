import { createRef, LitElement, property } from '@game-companion/lit';
import { MDCRipple } from '@material/ripple';
import {
  asFormAssociatedInternal,
  formAssociatedMixin,
} from './form-associated';

export class MdcCoreButton extends formAssociatedMixin(LitElement) {
  @property({ type: String }) declare type: string;
  @property({ type: Boolean, reflect: true }) declare disabled: boolean;

  protected buttonRef = createRef<HTMLButtonElement>();
  protected ripple?: MDCRipple;

  protected handleClick = () => {
    switch (this.type) {
      case 'submit':
        asFormAssociatedInternal(this).getInternals().form?.requestSubmit();
        break;
      case 'reset':
        asFormAssociatedInternal(this).getInternals().form?.reset();
        break;
    }
  };

  constructor() {
    super();

    this.type = 'submit';
    this.disabled = false;

    asFormAssociatedInternal(this).getInternals().role = 'button';
  }

  override click(): void {
    this.buttonRef.value?.click();
  }

  override focus(options?: FocusOptions): void {
    this.buttonRef.value?.focus(options);
  }

  override blur(): void {
    this.buttonRef.value?.blur();
  }

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.handleClick);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.handleClick);
  }

  formDisabledCallback(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  protected override firstUpdated() {
    this.initButton(this.buttonRef.value);
  }

  protected initButton(button?: HTMLButtonElement) {
    if (button) {
      this.ripple = MDCRipple.attachTo(button);
    }
  }
}
