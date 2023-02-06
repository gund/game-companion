import {
  classMap,
  css,
  customElement,
  html,
  LitElement,
  property,
  ref,
  unsafeCSS,
} from '@game-companion/lit';
import '@game-companion/mdc/icons-link';
import { MDCTopAppBar } from '@material/top-app-bar';
import { topAppBarStyles } from './top-app-bar.styles.js';

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
  static override styles = [
    unsafeCSS(topAppBarStyles),
    css`
      :host {
        display: flex;
        height: 100vh;
      }

      .content {
        flex: auto;
        overflow: auto;
        position: relative;
      }

      .main-content {
        overflow: auto;
        height: 100%;
      }

      .mdc-top-app-bar {
        position: absolute;
        z-index: 7;
      }
    `,
  ];

  @property({ type: String }) declare appearance?: TopAppBarAppearance;

  protected topBar?: MDCTopAppBar;
  protected mainContentElem?: Element;

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.topBar?.destroy();
    this.topBar = undefined;
    this.mainContentElem = undefined;
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
      <slot name="nav-drawer"></slot>
      <div class="content ${this.getContentClass()}">
        <main class="main-content" ${ref(this.initMainContent)}>
          <slot></slot>
        </main>
      </div>
      <mdc-icons-link></mdc-icons-link>`;
  }

  protected initTopBar(element?: Element) {
    if (element) {
      this.topBar?.destroy();
      this.topBar = MDCTopAppBar.attachTo(element);
      this.initMainContent();
    }
  }

  protected initMainContent(element = this.mainContentElem) {
    if (element) {
      this.mainContentElem = element;
      this.topBar?.setScrollTarget(element);
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
