import { html } from '@game-companion/lit';
import { PlayerStatsData } from '../player.model.js';
import {
  ConfigurablePlayerStats,
  NameablePlayerStats,
  PlayerStats,
} from './player-stats.js';

export interface NamedPlayerStatsData extends PlayerStatsData {
  name: string;
}

export class NamedPlayerStats
  implements PlayerStats, ConfigurablePlayerStats, NameablePlayerStats
{
  getId(): string {
    throw new Error('Method not implemented.');
  }

  getName(): string {
    throw new Error('Method not implemented.');
  }

  getFinalScore(): number {
    throw new Error('Method not implemented.');
  }

  renderStats(): unknown {
    throw new Error('Method not implemented.');
  }

  renderDisplayName(stats: NamedPlayerStatsData): unknown {
    return html`${stats.name}`;
  }

  renderConfiguration(slot?: unknown): unknown {
    import('@game-companion/core/named-player-stats-configurator');

    return html`<gc-named-player-stats-configurator .playerStats=${this}>
      ${slot}
    </gc-named-player-stats-configurator>`;
  }

  getInputLabel(): string {
    return 'Name';
  }
}
