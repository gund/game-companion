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
import btnStyles from '@material/button/dist/mdc.button.min.css?inline';

declare global {
  interface HTMLElementTagNameMap {
    'mdc-button': MdcButtonElement;
  }
}

@customElement(MdcButtonElement.selector)
export class MdcButtonElement extends MdcCoreButton {
  static readonly selector = 'mdc-button';
  static override styles = [unsafeCSS(btnStyles)];

  @property({ type: Boolean }) declare outlined: boolean;
  @property({ type: Boolean }) declare raised: boolean;
  @property({ type: String }) declare icon?: string;
  @property({ type: String }) declare href?: string;

  constructor() {
    super();

    this.outlined = false;
    this.raised = false;
  }

  protected override render() {
    return html`<div class="mdc-touch-target-wrapper">
        ${when(
          this.type === 'link',
          () => html`<a
            href=${ifDefined(this.href)}
            class="mdc-button mdc-button--touch ${classMap(this.getClassMap())}"
            ?disabled=${this.disabled}
            ${ref(this.initButton)}
          >
            ${this.renderInnerButton()}
          </a>`,
          () => html`<button
            class="mdc-button mdc-button--touch ${classMap(this.getClassMap())}"
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
    return html`<span class="mdc-button__ripple"></span>
      <span class="mdc-button__touch"></span>
      ${when(
        this.icon,
        () => html`<i class="material-icons mdc-button__icon">${this.icon}</i>`
      )}
      <span class="mdc-button__label"><slot></slot></span>`;
  }

  protected getClassMap() {
    return {
      'mdc-button--outlined': this.outlined,
      'mdc-button--raised': this.raised,
    };
  }
}
