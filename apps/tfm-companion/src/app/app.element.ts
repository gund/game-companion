import { Router } from '@lit-labs/router';
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { routes } from './routes';

declare global {
  interface HTMLElementTagNameMap {
    [AppElement.selector]: AppElement;
  }
}

@customElement(AppElement.selector)
export class AppElement extends LitElement {
  static readonly selector = 'tfm-companion-root';
  private static app?: AppElement;

  static query() {
    if (!this.app) {
      const app = document.getElementsByTagName(AppElement.selector).item(0);

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
