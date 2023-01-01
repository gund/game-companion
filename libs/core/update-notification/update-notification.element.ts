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

  @property() declare updateInstalled: boolean;
  @property() declare offlineReady: boolean;

  constructor() {
    super();

    this.updateInstalled = false;
    this.offlineReady = false;
  }

  protected override render() {
    return html`<mdc-snackbar ?open=${this.offlineReady}>
        App is ready for offline!
        <mdc-button slot="actions">Cool!</mdc-button>
      </mdc-snackbar>
      <mdc-snackbar ?open=${this.updateInstalled} hasDismiss timeoutMs="-1">
        New update is installed!
        <mdc-button slot="actions" @click=${this.handleReload}
          >Reload</mdc-button
        >
      </mdc-snackbar>`;
  }

  protected override willUpdate(
    changedProps: PropertyValueMap<GcUpdateNotificationElement>
  ) {
    if (
      changedProps.has('updateInstalled') ||
      changedProps.has('offlineReady')
    ) {
      import('@game-companion/mdc/snackbar');
      import('@game-companion/mdc/button');
    }
  }

  private async handleReload() {
    window.location.reload();
  }
}
