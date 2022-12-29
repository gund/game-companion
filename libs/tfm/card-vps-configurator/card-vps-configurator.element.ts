import { UpdatePlayerStatsDataEvent } from '@game-companion/core';
import '@game-companion/core/num-input';
import { customElement, html, LitElement, state } from '@game-companion/lit';
import type { CardVPsPlayerStatsData } from '@game-companion/tfm';

@customElement('tfm-card-vps-player-stats-configurator')
export class TfmCardVPsPlayerStatsConfiguratorElement extends LitElement {
  @state() declare data: Omit<CardVPsPlayerStatsData, 'id'>;

  constructor() {
    super();

    this.data = { cardName: '', scoreCount: 0, vpsRatio: 1 };
  }

  protected override render() {
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
          <gc-num-input
            min="1"
            .value=${this.data.vpsRatio}
            @input=${this.getUpdateHandler((vpsRatio) => ({
              vpsRatio: parseInt(vpsRatio),
            }))}
          ></gc-num-input>
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
