import { LitElement, property } from '@game-companion/lit';
import { MDCRipple } from '@material/ripple';
import {
  asFormAssociatedInternal,
  formAssociatedMixin,
} from './form-associated';

export class MdcCoreButton extends formAssociatedMixin(LitElement) {
  @property({ type: String }) declare type: string;
  @property({ type: Boolean, reflect: true }) declare disabled: boolean;

  protected buttonElement?: HTMLElement;
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
    this.buttonElement?.click();
  }

  override focus(options?: FocusOptions): void {
    this.buttonElement?.focus(options);
  }

  override blur(): void {
    this.buttonElement?.blur();
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

  protected initButton(element?: Element) {
    if (element) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.buttonElement = element as any;
      this.ripple = MDCRipple.attachTo(element);
    }
  }
}
