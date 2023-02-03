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
    ['mdc-fab']: MdcFabElement;
  }
}

@customElement(MdcFabElement.selector)
export class MdcFabElement extends MdcCoreButton {
  static readonly selector = 'mdc-fab';
  static override styles = [unsafeCSS(fabStyles)];

  @property({ type: Boolean }) declare mini: boolean;
  @property({ type: Boolean }) declare extended: boolean;
  @property({ type: String }) declare icon?: string;
  @property({ type: String }) declare href?: string;

  constructor() {
    super();

    this.mini = false;
    this.extended = false;
  }

  protected override render() {
    return html`<div class="mdc-touch-target-wrapper">
        ${when(
          this.type === 'link',
          () => html`<a
            class="mdc-fab mdc-fab--touch ${classMap(this.getClassMap())}"
            href=${ifDefined(this.href)}
            ?disabled=${this.disabled}
            ${ref(this.initButton)}
          >
            ${this.renderInnerButton()}
          </a>`,
          () => html`<button
            class="mdc-fab mdc-fab--touch ${classMap(this.getClassMap())}"
            ?disabled=${this.disabled}
            ${ref(this.initButton)}
          >
            ${this.renderInnerButton()}
          </button>`
        )}
      </div>
      <mdc-icons-link></mdc-icons-link>`;
  }

  protected renderInnerButton() {
    return html`<span class="mdc-fab__ripple"></span>
      ${when(
        this.icon,
        () =>
          html`<span class="material-icons mdc-fab__icon">${this.icon}</span>`
      )}
      ${when(
        this.extended,
        () => html`<span class="mdc-fab__label"><slot></slot></span>`
      )}
      <span class="mdc-fab__touch"></span>`;
  }

  protected getClassMap() {
    return {
      'mdc-fab--mini': this.mini,
      'mdc-fab--extended': this.extended,
    };
  }
}
