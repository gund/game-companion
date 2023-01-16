import {
  mixinRootElement,
  GenericScorePlayerStats,
  IncrementalScorePlayerStats,
} from '@game-companion/core';
import '@game-companion/core/update-notification';
import { customElement, html, state } from '@game-companion/lit';
import { registerSW } from 'virtual:pwa-register';

declare global {
  interface HTMLElementTagNameMap {
    [GameAppElement.selector]: GameAppElement;
  }
}

@customElement(GameAppElement.selector)
export class GameAppElement extends mixinRootElement({
  selector: 'game-companion-root',
  playerStats: [
    new GenericScorePlayerStats(),
    new IncrementalScorePlayerStats(),
  ],
}) {
  static readonly selector = 'game-companion-root';

  @state() private declare needRefresh: boolean;
  @state() private declare offlineReady: boolean;

  private updateSw: () => Promise<void>;

  constructor() {
    super();

    this.needRefresh = false;
    this.offlineReady = false;

    this.updateSw = registerSW({
      immediate: true,
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
