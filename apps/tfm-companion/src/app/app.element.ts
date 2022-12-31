import { mixinRootElement } from '@game-companion/core';
import { customElement, html } from '@game-companion/lit';
import '@game-companion/mdc/snackbar';
import { tfmPlayerStats } from '@game-companion/tfm';
import './update-notification.element';

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

  protected override render() {
    return html`${super.render()}
      <gc-update-notification></gc-update-notification>`;
  }
}
