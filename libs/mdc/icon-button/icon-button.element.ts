import {
  customElement,
  html,
  ifDefined,
  property,
  ref,
  unsafeCSS,
  when,
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

  @property({ type: String }) declare icon: string;
  @property({ type: String }) declare btnClass: string;
  @property({ type: String }) declare href?: string;

  constructor() {
    super();

    this.icon = '';
    this.btnClass = '';
  }

  protected override render() {
    return html`<span class="mdc-touch-target-wrapper">
        ${when(
          this.type === 'link',
          () => html`<a
            class="material-icons mdc-icon-button ${this.btnClass}"
            ?disabled=${this.disabled}
            href=${ifDefined(this.href)}
            ${ref(this.initButton)}
          >
            ${this.renderInnerButton()}
          </a>`,
          () => html`<button
            class="material-icons mdc-icon-button ${this.btnClass}"
            ?disabled=${this.disabled}
            ${ref(this.initButton)}
          >
            ${this.renderInnerButton()}
          </button>`
        )}
      </span>
      <mdc-icons-link></mdc-icons-link>`;
  }

  protected renderInnerButton() {
    return html`<span class="mdc-icon-button__ripple"></span>
      ${this.icon}
      <span class="mdc-icon-button__touch"></span>`;
  }

  protected override initButton(element?: Element) {
    super.initButton(element);

    if (this.ripple) {
      this.ripple.unbounded = true;
    }
  }
}
