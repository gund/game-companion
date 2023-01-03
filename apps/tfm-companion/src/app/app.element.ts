import { mixinRootElement } from '@game-companion/core';
import '@game-companion/core/update-notification';
import { customElement, html, state } from '@game-companion/lit';
import { tfmPlayerStats } from '@game-companion/tfm';
import { registerSW } from 'virtual:pwa-register';

declare global {
  interface HTMLElementTagNameMap {
    [TfmAppElement.selector]: TfmAppElement;
  }
}

@customElement(TfmAppElement.selector)
export class TfmAppElement extends mixinRootElement({
  selector: 'tfm-companion-root',
  playerStats: [...tfmPlayerStats],
}) {
  static readonly selector = 'tfm-companion-root';

  @state() private declare needRefresh: boolean;
  @state() private declare offlineReady: boolean;

  private updateSw: () => Promise<void>;

  constructor() {
    super();

    this.needRefresh = false;
    this.offlineReady = false;

    this.updateSw = registerSW({
      onNeedRefresh: () => (this.needRefresh = true),
      onOfflineReady: () => (this.offlineReady = true),
    });
  }

  protected override render() {
    return html`${super.render()}
      <gc-update-notification
        .needRefresh=${this.needRefresh}
        .offlineReady=${this.offlineReady}
        @gcUpdateNotificationRefresh=${this.updateSw}
      ></gc-update-notification>`;
  }
}
