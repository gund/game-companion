import {
  customElement,
  html,
  LitElement,
  PropertyValueMap,
  state,
} from '@game-companion/lit';

declare global {
  interface HTMLElementTagNameMap {
    [GcUpdateNotificationElement.selector]: GcUpdateNotificationElement;
  }
}

@customElement(GcUpdateNotificationElement.selector)
export class GcUpdateNotificationElement extends LitElement {
  static readonly selector = 'gc-update-notification';

  @state() declare updateFound: boolean;

  private cleanupStateChange?: () => void;

  private handleUpdateFound = async () => {
    this.cleanupStateChange?.();
    this.cleanupStateChange = undefined;

    const sw = await window.navigator.serviceWorker.ready;
    const newSw = sw.installing;

    if (!newSw) {
      return;
    }

    if (newSw.state === 'activated') {
      this.updateFound = true;
    } else {
      const handleStateChange = () => {
        console.log(newSw.state);
        if (newSw.state === 'activated') {
          this.updateFound = true;
        }
      };

      newSw.addEventListener('statechange', handleStateChange);

      this.cleanupStateChange = () =>
        newSw.removeEventListener('statechange', handleStateChange);
    }
  };

  constructor() {
    super();

    this.updateFound = false;
  }

  override async connectedCallback() {
    super.connectedCallback();

    const sw = await window.navigator.serviceWorker.ready;

    sw.addEventListener('updatefound', this.handleUpdateFound);
  }

  override async disconnectedCallback() {
    super.disconnectedCallback();

    this.cleanupStateChange?.();
    this.cleanupStateChange = undefined;

    const sw = await window.navigator.serviceWorker.ready;

    sw.removeEventListener('updatefound', this.handleUpdateFound);
  }

  protected override render() {
    return html`<mdc-snackbar
      ?open=${this.updateFound}
      hasDismiss
      timeoutMs="-1"
    >
      New update is available!
      <mdc-button slot="actions" @click=${this.handleReload}>Reload</mdc-button>
    </mdc-snackbar>`;
  }

  protected override willUpdate(
    changedProps: PropertyValueMap<GcUpdateNotificationElement>
  ) {
    if (changedProps.has('updateFound')) {
      import('@game-companion/mdc/snackbar');
    }
  }

  private handleReload() {
    window.location.reload();
  }
}
