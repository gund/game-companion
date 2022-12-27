import { html, LitElement, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat, when } from './lit-directives';
import {
  isUpdatablePlayerStats,
  UpdatePlayerStatsDataEvent,
} from './player-stats/player-stats';
import { PlayerStatsRegistry } from './player-stats/registry';
import type { Player, PlayerStatsData } from './player.model';
import type { Session } from './session.model';
import { SessionsService } from './sessions.service';

declare global {
  interface HTMLElementTagNameMap {
    [PlayerElement.selector]: PlayerElement;
  }
}

@customElement(PlayerElement.selector)
export class PlayerElement extends LitElement {
  static readonly selector = 'tfm-player';

  @property() declare sId: string;
  @property() declare pId: string;

  @state() private declare session?: Session;
  @state() private declare player?: Player;
  @state() private declare isLoading: boolean;

  private sessionsService = new SessionsService();
  private playerStatsRegistry = new PlayerStatsRegistry();

  render() {
    return html`${when(
        this.player,
        () => this.renderPlayer(this.player!),
        () => this.renderFallback()
      )}<a href="/session/${this.sId}">Back to session</a>`;
  }

  private renderPlayer(player: Player) {
    return html`<h1>Player ${player.name}</h1>
      ${when(
        player.stats.length,
        () => html`<table>
          ${repeat(
            player.stats,
            (ps) => ps.id,
            (ps) => html`<tr>
              <td>${this.getPlayerStatsName(ps.id)}</td>
              <td
                @tfmUpdateData=${{
                  handleEvent: (e: UpdatePlayerStatsDataEvent) =>
                    this.updatePlayerStats(ps, e.data),
                }}
              >
                ${this.renderPlayerStats(ps)}
              </td>
            </tr>`
          )}
        </table>`
      )}`;
  }

  private renderPlayerStats(data: PlayerStatsData) {
    const playerStats = this.getPlayerStats(data.id);

    if (!playerStats) {
      return;
    }

    if (isUpdatablePlayerStats(playerStats)) {
      return playerStats.renderUpdateStats(data);
    } else {
      return playerStats.renderStats(data);
    }
  }

  private renderFallback() {
    return html`${when(
      this.isLoading,
      () => html`Loading Player...`,
      () => html`Invalid Player!`
    )}`;
  }

  protected willUpdate(changedProps: PropertyValueMap<PlayerElement>) {
    if (changedProps.has('sId')) {
      this.loadSession();
    }
    if (changedProps.has('pId')) {
      this.updatePlayer();
    }
  }

  private async loadSession() {
    this.session = undefined;

    if (!this.sId) {
      return;
    }

    try {
      this.isLoading = true;
      this.session = await this.sessionsService.getById(this.sId);
      this.updatePlayer();
    } finally {
      this.isLoading = false;
    }
  }

  private updatePlayer() {
    this.player = this.session?.players.find((p) => p.id === this.pId);
  }

  private getPlayerStats(id: string) {
    return this.playerStatsRegistry
      .getAvailable()
      .find((ps) => ps.getId() === id);
  }

  private getPlayerStatsName(id: string) {
    return this.getPlayerStats(id)?.getName() ?? `Unknown(${id})`;
  }

  private async updatePlayerStats(
    playerStats: PlayerStatsData,
    data?: unknown
  ) {
    if (!this.player) {
      return;
    }

    Object.assign(playerStats, data);

    await this.sessionsService.updatePlayer(this.sId, this.player);
  }
}
