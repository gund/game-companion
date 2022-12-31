import {
  classMap,
  css,
  customElement,
  html,
  LitElement,
  property,
  PropertyValues,
  queryAssignedElements,
  ref,
  state,
  unsafeCSS,
  when,
} from '@game-companion/lit';
import { MDCSnackbar } from '@material/snackbar';
import snackbarStyles from '@material/snackbar/dist/mdc.snackbar.min.css?inline';

declare global {
  interface HTMLElementTagNameMap {
    [MdcSnackbarElement.selector]: MdcSnackbarElement;
  }
}

export type MdcSnackbarMode = 'stacked' | 'leading';

@customElement(MdcSnackbarElement.selector)
export class MdcSnackbarElement extends LitElement {
  static readonly selector = 'mdc-snackbar';
  static override styles = [
    unsafeCSS(snackbarStyles),
    css`
      .mdc-snackbar__dismiss,
      .mdc-snackbar__action {
        display: contents;
      }
    `,
  ];

  @property({ type: Boolean, attribute: 'open', reflect: true })
  declare isOpen: boolean;
  @property({ type: Boolean }) declare hasDismiss: boolean;
  @property({ type: Boolean }) declare noCloseOnEscape: boolean;
  @property({ type: String }) declare mode?: MdcSnackbarMode;
  @property({ type: Number }) declare timeoutMs?: number;
  /**
   * Automatically sets mode to `leading` whenever media query matches.
   * By default media query is set to `(min-width: 768px)`.
   */
  @property({ type: String }) declare leadingMedia?: string;

  @queryAssignedElements({ slot: 'actions' })
  declare actionsSlottedElements: HTMLElement[];

  @state() protected declare leadingMatches: boolean;

  protected snackbar?: MDCSnackbar;
  protected leadingMql?: MediaQueryList;

  protected handleLeadingMqlChange = (
    e: MediaQueryListEvent | MediaQueryList
  ) => (this.leadingMatches = e.matches);

  #internals = this.attachInternals();

  constructor() {
    super();

    this.isOpen = false;
    this.hasDismiss = false;
    this.noCloseOnEscape = false;
    this.leadingMatches = false;
    this.leadingMedia = '(min-width: 768px)';

    this.#internals.role = 'status';

    this.syncLeadingMedia();
  }

  open() {
    this.snackbar?.open();
  }

  close(reason?: string) {
    this.snackbar?.close(reason);
  }

  protected override render() {
    return html`<aside
      class="mdc-snackbar ${classMap(this.getClassMap())}"
      @MDCSnackbar:closed=${this.handleClosed}
      ${ref(this.initSnackbar)}
    >
      <div class="mdc-snackbar__surface" aria-relevant="additions">
        <div class="mdc-snackbar__label" aria-atomic="false">
          <slot></slot>
        </div>
        <div class="mdc-snackbar__actions" aria-atomic="true">
          <slot name="actions"></slot>
          ${when(
            this.hasDismiss,
            () => html`<mdc-icon-button
              class="mdc-snackbar__dismiss"
              icon="close"
            ></mdc-icon-button>`
          )}
        </div>
      </div>
    </aside>`;
  }

  protected override firstUpdated() {
    this.initActions();
  }

  protected override willUpdate(
    changedProps: PropertyValues<MdcSnackbarElement>
  ) {
    if (changedProps.has('isOpen')) {
      this.syncOpen();
    }

    if (changedProps.has('timeoutMs')) {
      this.syncTimeout();
    }

    if (changedProps.has('noCloseOnEscape')) {
      this.syncCloseOnEscape();
    }

    if (changedProps.has('leadingMedia')) {
      this.syncLeadingMedia();
    }

    if (changedProps.has('hasDismiss') && this.hasDismiss) {
      import('@game-companion/mdc/icon-button');
    }

    this.initActions();
  }

  protected initSnackbar(element?: Element) {
    if (element) {
      this.snackbar = MDCSnackbar.attachTo(element);
      this.syncOpen();
      this.syncTimeout();
      this.syncCloseOnEscape();
    }
  }

  protected initActions() {
    this.actionsSlottedElements.forEach((element) =>
      element.classList.add('mdc-snackbar__action')
    );
  }

  protected getClassMap() {
    return {
      'mdc-snackbar--stacked': this.mode === 'stacked',
      'mdc-snackbar--leading': this.mode === 'leading' || this.leadingMatches,
    };
  }

  protected syncOpen() {
    if (this.isOpen) {
      this.open();
    } else {
      this.close('dismiss');
    }
  }

  protected syncTimeout() {
    if (this.snackbar && this.timeoutMs !== undefined) {
      this.snackbar.timeoutMs = this.timeoutMs;
    }
  }

  protected syncCloseOnEscape() {
    if (this.snackbar) {
      this.snackbar.closeOnEscape = !this.noCloseOnEscape;
    }
  }

  protected syncLeadingMedia() {
    if (!this.leadingMedia) {
      this.leadingMatches = false;
      this.leadingMql?.removeEventListener(
        'change',
        this.handleLeadingMqlChange
      );
      this.leadingMql = undefined;
      return;
    }

    this.leadingMql = window.matchMedia(this.leadingMedia);
    this.leadingMql.addEventListener('change', this.handleLeadingMqlChange);
    this.handleLeadingMqlChange(this.leadingMql);
  }

  protected handleClosed() {
    this.isOpen = false;
  }
}
