import { Router } from '@lit-labs/router';

export class NavigatableRouter extends Router {
  /**
   * Similar to {@link Router.goto()} but changes location history as well.
   *
   * Fixes bug in {@link Router} {@see https://github.com/lit/lit/discussions/3256}
   */
  navigateTo(pathname: string, state: unknown = null) {
    window.history.pushState(state, '', pathname);
    return this.goto(pathname);
  }

  getState(): unknown {
    return window.history.state;
  }
}
