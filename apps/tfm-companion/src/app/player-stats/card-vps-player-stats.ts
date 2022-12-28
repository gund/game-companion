import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '../num-input.element';
import { PlayerStatsData } from '../player.model';
import {
  ConfigurablePlayerStats,
  PlayerStats,
  UpdatablePlayerStats,
  UpdatePlayerStatsDataEvent,
} from './player-stats';

export interface CardVPsPlayerStatsData extends PlayerStatsData {
  cardName: string;
  scoreCount: number;
  vpsRatio: number;
}

export class CardVPsPlayerStats
  implements
    PlayerStats<CardVPsPlayerStatsData>,
    UpdatablePlayerStats<CardVPsPlayerStatsData>,
    ConfigurablePlayerStats
{
  getId(): string {
    return 'card-vps';
  }

  getName(): string {
    return 'Card Victory Points';
  }

  renderStats(stats: CardVPsPlayerStatsData) {
    return html`[${stats.cardName}:${stats.scoreCount ?? 0}]
    ${Math.floor(stats.scoreCount / stats.vpsRatio)}VPs (${stats.vpsRatio}/1 VP)`;
  }

  renderUpdateStats(stats: CardVPsPlayerStatsData) {
    return html`<tfm-card-vps-player-stats-updater
      .data=${stats}
      .playerStats=${this}
    ></tfm-card-vps-player-stats-updater>`;
  }

  renderConfiguration() {
    return html`<tfm-card-vps-player-stats-configurator></tfm-card-vps-player-stats-configurator>`;
  }
}

@customElement('tfm-card-vps-player-stats-updater')
export class CardVPsPlayerStatsUpdaterElement extends LitElement {
  @property() declare data?: CardVPsPlayerStatsData;
  @property() declare playerStats?: CardVPsPlayerStats;

  render() {
    return html`${this.data?.cardName}
      <tfm-num-input
        .value=${this.data?.scoreCount}
        min="0"
        @input=${{
          handleEvent: (e: Event) =>
            this.updateScoreCount(
              parseInt((e.target as HTMLInputElement).value)
            ),
        }}
      ></tfm-num-input>
      ${this.data && this.playerStats?.renderStats(this.data)}`;
  }

  private updateScoreCount(scoreCount: number) {
    this.dispatchEvent(new UpdatePlayerStatsDataEvent({ scoreCount }));
  }
}

@customElement('tfm-card-vps-player-stats-configurator')
export class CardVPsPlayerStatsConfiguratorElement extends LitElement {
  @state() declare data: Omit<CardVPsPlayerStatsData, 'id'>;

  constructor() {
    super();

    this.data = { cardName: '', scoreCount: 0, vpsRatio: 1 };
  }

  render() {
    return html`<form>
      <p>
        <label>
          Card Name:
          <input
            type="text"
            .value=${this.data.cardName}
            @input=${this.getUpdateHandler((cardName) => ({ cardName }))}
          />
        </label>
      </p>
      <p>
        <label>
          VP Ratio
          <tfm-num-input
            min="1"
            .value=${this.data.vpsRatio}
            @input=${this.getUpdateHandler((vpsRatio) => ({
              vpsRatio: parseInt(vpsRatio),
            }))}
          ></tfm-num-input>
        </label>
      </p>
    </form>`;
  }

  private updateData(chunk: Partial<CardVPsPlayerStatsData>) {
    Object.assign(this.data, chunk);

    if (this.data.cardName === '' || this.data.vpsRatio < 1) {
      this.dispatchEvent(new UpdatePlayerStatsDataEvent());
    } else {
      this.dispatchEvent(new UpdatePlayerStatsDataEvent(this.data));
    }
  }

  private getUpdateHandler(
    valueFn: (value: string) => Partial<CardVPsPlayerStatsData>
  ) {
    return {
      handleEvent: (e: Event) =>
        this.updateData(valueFn((e.target as HTMLInputElement).value)),
    };
  }
}
