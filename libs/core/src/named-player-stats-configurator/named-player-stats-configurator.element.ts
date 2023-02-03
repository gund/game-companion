import {
  NamedPlayerStats,
  NamedPlayerStatsData,
  UpdatePlayerStatsDataEvent,
} from '@game-companion/core';
import {
  customElement,
  getNodesText,
  html,
  ifDefined,
  LitElement,
  property,
  queryAssignedElements,
  state,
} from '@game-companion/lit';
import { hiddenStyles } from '@game-companion/mdc';
import { MdcTextFieldElement } from '@game-companion/mdc/text-field';

declare global {
  interface HTMLElementTagNameMap {
    [GcNamedPlayerStatsConfiguratorElement.selector]: GcNamedPlayerStatsConfiguratorElement;
  }
}

@customElement(GcNamedPlayerStatsConfiguratorElement.selector)
export class GcNamedPlayerStatsConfiguratorElement extends LitElement {
  static readonly selector = 'gc-named-player-stats-configurator';
  static override styles = [hiddenStyles];

  @property() declare playerStats: NamedPlayerStats;

  @queryAssignedElements({ slot: 'hint' })
  private declare hintSlot: HTMLElement[];

  @state() declare data: Omit<NamedPlayerStatsData, 'id'>;
  @state() private declare hintLabel?: string;

  constructor() {
    super();

    this.data = { name: '' };
  }

  protected override render() {
    return html`
      <form>
        <mdc-text-field
          required
          label=${this.playerStats.getInputLabel()}
          value=${this.data.name}
          hintLabel=${ifDefined(this.hintLabel)}
          @input=${{
            handleEvent: (e: Event) =>
              this.updateData({
                name: (e.target as MdcTextFieldElement).value,
              }),
          }}
        ></mdc-text-field>
      </form>
      <div class="hidden">
        <slot name="hint" slot="hint"></slot>
      </div>
    `;
  }

  protected override updated() {
    this.updateHint();
  }

  private updateData(chunk: Partial<NamedPlayerStatsData>) {
    Object.assign(this.data, chunk);

    if (this.data.name === '') {
      this.dispatchEvent(new UpdatePlayerStatsDataEvent());
    } else {
      this.dispatchEvent(new UpdatePlayerStatsDataEvent(this.data));
    }
  }

  private async updateHint() {
    this.hintLabel = await getNodesText(this.hintSlot);
  }
}
