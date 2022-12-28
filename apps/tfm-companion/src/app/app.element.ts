import { Router } from '@lit-labs/router';
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { routes } from './routes';

declare global {
  interface HTMLElementTagNameMap {
    [TfmAppElement.selector]: TfmAppElement;
  }
}

@customElement(TfmAppElement.selector)
export class TfmAppElement extends LitElement {
  static readonly selector = 'tfm-companion-root';
  private static app?: TfmAppElement;

  static query() {
    if (!this.app) {
      const app = document.getElementsByTagName(TfmAppElement.selector).item(0);

      if (!app) {
        throw new Error('AppElement has not been mounted!');
      }

      this.app = app;
    }

    return this.app;
  }

  router = new Router(this, routes);

  protected render() {
    return this.router.outlet();
  }
}
