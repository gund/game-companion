import {
  customElement,
  html,
  ifDefined,
  property,
  ref,
  unsafeCSS,
} from '@game-companion/lit';
import { MdcCoreButton } from '@game-companion/mdc';
import '@game-companion/mdc/icons-link';
import iconButtonStyles from '@material/icon-button/dist/mdc.icon-button.min.css?inline';

declare global {
  interface HTMLElementTagNameMap {
    ['mdc-icon-button']: MdcIconButtonElement;
  }
}

@customElement(MdcIconButtonElement.selector)
export class MdcIconButtonElement extends MdcCoreButton {
  static readonly selector = 'mdc-icon-button';
  static override styles = [unsafeCSS(iconButtonStyles)];

  @property({ type: String }) declare icon?: string;
  @property({ type: String }) declare btnClass?: string;

  constructor() {
    super();

    this.btnClass = '';
  }

  protected override render() {
    return html`<span class="mdc-touch-target-wrapper">
        <button
          class="material-icons mdc-icon-button ${this.btnClass}"
          ?disabled=${this.disabled}
          ${ref(this.buttonRef)}
        >
          <span class="mdc-icon-button__ripple"></span>
          ${this.icon}
          <div class="mdc-icon-button__touch"></div>
        </button>
      </span>
      <mdc-icons-link></mdc-icons-link>`;
  }

  protected override initButton(button?: HTMLButtonElement) {
    super.initButton(button);

    if (this.ripple) {
      this.ripple.unbounded = true;
    }
  }
}
