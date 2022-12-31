import {
  customElement,
  html,
  LitElement,
  PropertyValueMap,
  state,
} from '@game-companion/lit';
import { registerSW } from 'virtual:pwa-register';

declare global {
  interface HTMLElementTagNameMap {
    [TfmUpdateNotificationElement.selector]: TfmUpdateNotificationElement;
  }
}

@customElement(TfmUpdateNotificationElement.selector)
export class TfmUpdateNotificationElement extends LitElement {
  static readonly selector = 'tfm-update-notification';

  @state() declare updateInstalled: boolean;
  @state() declare offlineReady: boolean;

  constructor() {
    super();

    this.updateInstalled = false;
    this.offlineReady = false;

    registerSW({
      onNeedRefresh: () => (this.updateInstalled = true),
      onOfflineReady: () => (this.offlineReady = true),
    });
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
    changedProps: PropertyValueMap<TfmUpdateNotificationElement>
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
