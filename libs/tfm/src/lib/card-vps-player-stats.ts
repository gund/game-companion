import {
  ConfigurablePlayerStats,
  NameablePlayerStats,
  NamedPlayerStats,
  NamedPlayerStatsData,
  PlayerStats,
  ScorePlayerStats,
  ScorePlayerStatsData,
  ScoreRestrictionsPlayerStats,
  UpdatablePlayerStats,
} from '@game-companion/core';
import { html } from '@game-companion/lit';

export interface CardVPsPlayerStatsData
  extends NamedPlayerStatsData,
    ScorePlayerStatsData {
  /** @deprecated Use {@link NamedPlayerStatsData.name} instead */
  cardName?: string;
  vpsRatio: number;
}

export class CardVPsPlayerStats
  implements
    PlayerStats,
    UpdatablePlayerStats,
    ConfigurablePlayerStats,
    NameablePlayerStats
{
  protected namedPlayerStats = new CardVpsNamedPlayerStats();
  protected scorePlayerStats = new CardVpsScorePlayerStats();

  getId(): string {
    return 'card-vps';
  }

  getName(): string {
    return 'Card Victory Points';
  }

  renderStats(stats: CardVPsPlayerStatsData) {
    return html`${stats.scoreCount ?? 0} - ${this.renderVps(stats)}`;
  }

  renderDisplayName(stats: CardVPsPlayerStatsData) {
    // Migrate from cardName to name
    if (stats.name === undefined) {
      stats = {
        ...stats,
        name: stats.cardName ?? '',
      };
      delete stats.cardName;
    }

    return html`Card ${stats.name}`;
  }

  renderVps(stats: CardVPsPlayerStatsData) {
    return html`${this.getFinalScore(stats)}VPs (${stats.vpsRatio}/1 VP)`;
  }

  getFinalScore(stats: CardVPsPlayerStatsData): number {
    return Math.floor((stats.scoreCount ?? 0) / stats.vpsRatio);
  }

  renderUpdateStats(stats: CardVPsPlayerStatsData) {
    return html`${this.scorePlayerStats.renderUpdateStats(stats, this)}`;
  }

  renderConfiguration() {
    import('@game-companion/tfm/card-vps-configurator');

    return html`<tfm-card-vps-player-stats-configurator .playerStats=${this}>
      <span slot="name">${this.namedPlayerStats.renderConfiguration()}</span>
    </tfm-card-vps-player-stats-configurator>`;
  }
}

export class CardVpsNamedPlayerStats extends NamedPlayerStats {
  override getInputLabel(): string {
    return 'Card Name';
  }
}

export class CardVpsScorePlayerStats extends ScorePlayerStats {
  override getScoreRestrictions(): ScoreRestrictionsPlayerStats {
    return { min: 0 };
  }

  override getScoreLabel(): string {
    return 'Card Points';
  }

  override renderUpdateStats(
    stats: CardVPsPlayerStatsData,
    playerStats?: CardVPsPlayerStats
  ) {
    return html`${super.renderUpdateStats(
      stats,
      html`<span slot="hint">${playerStats?.renderVps(stats)}</span>`
    )}`;
  }
}
