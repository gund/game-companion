import { getRoutes, NavigatableRouter } from '@game-companion/core';
import '@game-companion/core/provider';
import '@game-companion/core/update-notification';
import { customElement, html, LitElement, state } from '@game-companion/lit';
import { tfmPlayerStats } from '@game-companion/tfm';
import { registerSW } from 'virtual:pwa-register';

declare global {
  interface HTMLElementTagNameMap {
    [TfmAppElement.selector]: TfmAppElement;
  }
}

@customElement(TfmAppElement.selector)
export class TfmAppElement extends LitElement {
  static readonly selector = 'tfm-companion-root';

  @state() private declare needRefresh: boolean;
  @state() private declare offlineReady: boolean;

  #router = new NavigatableRouter(this, getRoutes());
  #playerStats = [...tfmPlayerStats];
  #updateSw: () => Promise<void>;

  constructor() {
    super();

    this.needRefresh = false;
    this.offlineReady = false;

    this.#updateSw = registerSW({
      immediate: true,
      onNeedRefresh: () => (this.needRefresh = true),
      onOfflineReady: () => (this.offlineReady = true),
    });
  }

  protected override render() {
    return html`
      <gc-provider .router=${this.#router} .playerStats=${this.#playerStats}>
        ${this.#router.outlet()}

        <gc-update-notification
          .needRefresh=${this.needRefresh}
          .offlineReady=${this.offlineReady}
          @gcUpdateNotificationRefresh=${this.#updateSw}
        ></gc-update-notification>
      </gc-provider>
    `;
  }
}
