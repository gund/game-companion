import { customElement, html, LitElement } from '@game-companion/lit';

declare global {
  interface HTMLElementTagNameMap {
    [MdcIconsLinkElement.selector]: MdcIconsLinkElement;
  }
}

@customElement(MdcIconsLinkElement.selector)
export class MdcIconsLinkElement extends LitElement {
  static readonly selector = 'mdc-icons-link';

  protected override createRenderRoot() {
    return this;
  }

  protected override render(): unknown {
    return html`<link
      rel="stylesheet"
      href="https://fonts.googleapis.com/icon?family=Material+Icons"
      crossorigin="anonymous"
    />`;
  }
}
