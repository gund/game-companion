import { mixinRootElement } from '@game-companion/core';
import { customElement } from '@game-companion/lit';
import { tfmPlayerStats } from '@game-companion/tfm';

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
}
