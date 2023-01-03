import {
  customElement,
  html,
  LitElement,
  property,
  PropertyValueMap,
} from '@game-companion/lit';

declare global {
  interface HTMLElementTagNameMap {
    [GcUpdateNotificationElement.selector]: GcUpdateNotificationElement;
  }
}

@customElement(GcUpdateNotificationElement.selector)
export class GcUpdateNotificationElement extends LitElement {
  static readonly selector = 'gc-update-notification';

  @property() declare needRefresh: boolean;
  @property() declare offlineReady: boolean;

  constructor() {
    super();

    this.needRefresh = false;
    this.offlineReady = false;
  }

  protected override render() {
    return html`<mdc-snackbar ?open=${this.offlineReady}>
        App is ready for offline!
        <mdc-button slot="actions">Cool!</mdc-button>
      </mdc-snackbar>
      <mdc-snackbar ?open=${this.needRefresh} hasDismiss timeoutMs="-1">
        New update is installed!
        <mdc-button slot="actions" @click=${this.handleReload}
          >Reload</mdc-button
        >
      </mdc-snackbar>`;
  }

  protected override willUpdate(
    changedProps: PropertyValueMap<GcUpdateNotificationElement>
  ) {
    if (changedProps.has('needRefresh') || changedProps.has('offlineReady')) {
      import('@game-companion/mdc/snackbar');
      import('@game-companion/mdc/button');
    }
  }

  private handleReload() {
    this.dispatchEvent(
      new GcUpdateNotificationRefreshEvent({
        bubbles: true,
        cancelable: false,
        composed: true,
      })
    );
  }
}

export class GcUpdateNotificationRefreshEvent extends Event {
  static readonly eventName = 'gcUpdateNotificationRefresh';

  constructor(eventInitDict?: EventInit) {
    super(GcUpdateNotificationRefreshEvent.eventName, eventInitDict);
  }
}
