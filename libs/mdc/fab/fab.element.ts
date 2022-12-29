import {
  classMap,
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
import fabStyles from '@material/fab/dist/mdc.fab.min.css?inline';

declare global {
  interface HTMLElementTagNameMap {
    [MdcFabElement.selector]: MdcFabElement;
  }
}

@customElement(MdcFabElement.selector)
export class MdcFabElement extends MdcCoreButton {
  static readonly selector = 'mdc-fab';
  static override styles = [unsafeCSS(fabStyles)];

  @property({ type: Boolean }) declare mini: boolean;
  @property({ type: Boolean }) declare extended: boolean;
  @property({ type: String }) declare icon?: string;

  constructor() {
    super();

    this.mini = false;
    this.extended = false;
  }

  protected override render(): unknown {
    return html`<div class="mdc-touch-target-wrapper">
        <button
          class="mdc-fab mdc-fab--touch ${classMap(this.getClassMap())}"
          ?disabled=${this.disabled}
          aria-label=${ifDefined(this.ariaLabel)}
          ${ref(this.buttonRef)}
        >
          <div class="mdc-fab__ripple"></div>
          ${when(
            this.icon,
            () =>
              html`<span class="material-icons mdc-fab__icon"
                >${this.icon}</span
              >`
          )}
          ${when(
            this.extended,
            () => html`<span class="mdc-fab__label"><slot></slot></span>`
          )}
          <span class="mdc-fab__touch"></span>
        </button>
      </div>
      <mdc-icons-link></mdc-icons-link>`;
  }

  protected getClassMap() {
    return {
      'mdc-fab--mini': this.mini,
      'mdc-fab--extended': this.extended,
    };
  }
}
