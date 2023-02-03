import { UpdatePlayerStatsDataEvent } from '@game-companion/core';
import '@game-companion/core/num-input';
import { GcNumInputElement } from '@game-companion/core/num-input';
import {
  customElement,
  html,
  LitElement,
  property,
  state,
} from '@game-companion/lit';
import '@game-companion/mdc/text-field';
import type {
  CardVPsPlayerStats,
  CardVPsPlayerStatsData,
} from '@game-companion/tfm';

@customElement('tfm-card-vps-player-stats-configurator')
export class TfmCardVPsPlayerStatsConfiguratorElement extends LitElement {
  @property() declare playerStats: CardVPsPlayerStats;

  @state() declare data: Omit<CardVPsPlayerStatsData, 'id'>;

  constructor() {
    super();

    this.data = { name: '', scoreCount: 0, vpsRatio: 1 };
  }

  protected override render() {
    return html`<form>
      <p>
        <slot name="name" @gcUpdateData=${this.handleNameUpdate}></slot>
      </p>
      <p>
        <gc-num-input
          label="VP Ratio"
          value=${this.data.vpsRatio}
          min="0.1"
          step="0.1"
          @input=${this.getUpdateHandler((vpsRatio) => ({
            vpsRatio: parseFloat(vpsRatio),
          }))}
        ></gc-num-input>
      </p>
    </form>`;
  }

  private updateData(chunk: Partial<CardVPsPlayerStatsData>) {
    Object.assign(this.data, chunk);

    if (this.data.name === '' || this.data.vpsRatio < 0.1) {
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
        this.updateData(valueFn((e.target as GcNumInputElement).value)),
    };
  }

  private handleNameUpdate(event: UpdatePlayerStatsDataEvent) {
    event.stopImmediatePropagation();

    const data = event.data as CardVPsPlayerStatsData | undefined;

    if (!data) {
      this.updateData({ name: '' });
    } else {
      this.updateData({ name: data.name });
    }
  }
}
