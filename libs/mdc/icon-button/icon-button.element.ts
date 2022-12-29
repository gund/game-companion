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
    [MdcIconButtonElement.selector]: MdcIconButtonElement;
  }
}

@customElement(MdcIconButtonElement.selector)
export class MdcIconButtonElement extends MdcCoreButton {
  static readonly selector = 'mdc-icon-button';
  static override styles = [unsafeCSS(iconButtonStyles)];

  @property({ type: String }) declare icon?: string;
  @property({ type: String }) declare btnClass?: string;

  protected override render() {
    return html`<button
        class="material-icons mdc-icon-button ${ifDefined(this.btnClass)}"
        ?disabled=${this.disabled}
        aria-label=${ifDefined(this.ariaLabel)}
        ${ref(this.buttonRef)}
      >
        <span class="mdc-icon-button__ripple"></span>
        ${this.icon}
      </button>
      <mdc-icons-link></mdc-icons-link>`;
  }
}
