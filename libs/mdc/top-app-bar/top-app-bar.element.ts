import {
  classMap,
  customElement,
  html,
  LitElement,
  property,
  ref,
  unsafeCSS,
} from '@game-companion/lit';
import '@game-companion/mdc/icons-link';
import { MDCTopAppBar } from '@material/top-app-bar';
import topAppBarStyles from '@material/top-app-bar/dist/mdc.top-app-bar.min.css?inline';

declare global {
  interface HTMLElementTagNameMap {
    [MdcTopAppBarElement.selector]: MdcTopAppBarElement;
  }
}

export type TopAppBarAppearance =
  | 'short'
  | 'short-collapsed'
  | 'fixed'
  | 'prominent'
  | 'dense';

@customElement(MdcTopAppBarElement.selector)
export class MdcTopAppBarElement extends LitElement {
  static readonly selector = 'mdc-top-app-bar';
  static override styles = [unsafeCSS(topAppBarStyles)];

  @property({ type: String }) declare appearance?: TopAppBarAppearance;

  protected topBar?: MDCTopAppBar;

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.topBar?.destroy();
    this.topBar = undefined;
  }

  protected override render() {
    return html`<header
        class="mdc-top-app-bar ${classMap(this.getBarClassMap())}"
        ${ref(this.initTopBar)}
      >
        <div class="mdc-top-app-bar__row">
          <section
            class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start"
          >
            <slot name="menu"></slot>
            <span class="mdc-top-app-bar__title">
              <slot name="title"></slot>
            </span>
          </section>
          <section
            class="mdc-top-app-bar__section mdc-top-app-bar__section--align-end"
            role="toolbar"
          >
            <slot name="toolbar"></slot>
          </section>
        </div>
      </header>
      <main class="${this.getContentClass()}">
        <slot></slot>
      </main>
      <mdc-icons-link></mdc-icons-link>`;
  }

  private initTopBar(element?: Element) {
    if (element) {
      this.topBar?.destroy();
      this.topBar = MDCTopAppBar.attachTo(element);
    }
  }

  protected getBarClassMap() {
    return {
      'mdc-top-app-bar--short': this.appearance === 'short',
      'mdc-top-app-bar--short-collapsed': this.appearance === 'short-collapsed',
      'mdc-top-app-bar--fixed': this.appearance === 'fixed',
      'mdc-top-app-bar--prominent': this.appearance === 'prominent',
      'mdc-top-app-bar--dense': this.appearance === 'dense',
    };
  }

  protected getContentClass() {
    if (this.appearance === 'short') {
      return 'mdc-top-app-bar--short-fixed-adjust';
    }

    if (this.appearance === 'prominent') {
      return 'mdc-top-app-bar--prominent-fixed-adjust';
    }

    if (this.appearance === 'dense') {
      return 'mdc-top-app-bar--dense-fixed-adjust';
    }

    return 'mdc-top-app-bar--fixed-adjust';
  }
}
