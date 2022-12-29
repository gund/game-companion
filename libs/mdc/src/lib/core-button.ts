import {
  createRef,
  html,
  LitElement,
  property,
  ref,
} from '@game-companion/lit';
import { MDCRipple } from '@material/ripple';

export abstract class MdcCoreButton extends LitElement {
  @property({ type: Boolean }) declare disabled: boolean;

  protected buttonRef = createRef<HTMLButtonElement>();
  protected ripple?: MDCRipple;

  constructor() {
    super();

    this.disabled = false;
  }

  override focus(options?: FocusOptions): void {
    this.buttonRef.value?.focus(options);
  }

  override blur(): void {
    this.buttonRef.value?.blur();
  }

  override click(): void {
    this.buttonRef.value?.click();
  }

  protected override updated() {
    this.initButton(this.buttonRef.value);
  }

  protected initButton(button?: HTMLButtonElement) {
    if (button) {
      this.ripple = MDCRipple.attachTo(button);
    }
  }
}
