import { LitElement, property } from '@game-companion/lit';
import { MDCRipple } from '@material/ripple';
import {
  asFormAssociatedInternal,
  formAssociatedMixin,
} from './form-associated';

export class MdcCoreButton extends formAssociatedMixin(LitElement) {
  @property({ type: String }) declare type: string;
  @property({ type: Boolean }) declare disabled: boolean;

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

  protected disabledInterval?: unknown;

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
    this.clearDisabledInterval();
    this.removeEventListener('click', this.handleClick);
    this.ripple?.destroy();
    this.ripple = undefined;
    this.buttonElement = undefined;
  }

  formDisabledCallback(isDisabled: boolean) {
    this.disabled = isDisabled;

    // Start check loop only if the button is not disabled directly
    if (this.disabled && !this.hasAttribute('disabled')) {
      this.disabledInterval = setInterval(
        () => this.checkFormDisabledState(),
        100
      );
    }
  }

  protected initButton(element?: Element) {
    if (element) {
      this.ripple?.destroy();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.buttonElement = element as any;
      this.ripple = MDCRipple.attachTo(element);
    }
  }

  protected checkFormDisabledState() {
    if (!this.disabled || this.hasAttribute('disabled')) {
      this.clearDisabledInterval();
      return;
    }

    const form = asFormAssociatedInternal(this).getInternals().form;

    const closestElement = this.closest('fieldset') ?? form;

    const isDisabled = closestElement?.hasAttribute('disabled') ?? false;

    if (!isDisabled) {
      this.disabled = false;
      this.clearDisabledInterval();
    }
  }

  protected clearDisabledInterval() {
    clearInterval(this.disabledInterval as any);
    this.disabledInterval = undefined;
  }
}
