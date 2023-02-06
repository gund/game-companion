import { customElement, html, LitElement, property } from '@game-companion/lit';
import '@game-companion/mdc/drawer';
import '@game-companion/mdc/list';
import { topAppBarStyles } from '@game-companion/mdc/top-app-bar';

declare global {
  interface HTMLElementTagNameMap {
    [GcMenuDrawerElement.selector]: GcMenuDrawerElement;
  }
}

@customElement(GcMenuDrawerElement.selector)
export class GcMenuDrawerElement extends LitElement {
  static readonly selector = 'gc-menu-drawer';
  static drawerStyles = [topAppBarStyles];

  @property({ type: Boolean, attribute: 'open', reflect: true })
  declare isOpen: boolean;

  protected override render() {
    return html` <mdc-drawer
      slot="nav-drawer"
      dismissible
      drawerClass="mdc-top-app-bar--fixed-adjust"
      ?open=${this.isOpen}
      .extraStyles=${GcMenuDrawerElement.drawerStyles}
    >
      <mdc-list>
        <mdc-list-item>
          <a href="/">Sessions</a>
        </mdc-list-item>
        <mdc-list-item>
          <a href="/settings">Settings</a>
        </mdc-list-item>
      </mdc-list>
    </mdc-drawer>`;
  }
}
