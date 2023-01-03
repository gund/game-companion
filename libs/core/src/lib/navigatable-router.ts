import { Router } from '@lit-labs/router';

export class NavigatableRouter extends Router {
  /**
   * Similar to {@link Routes.goto()} but changes location history as well.
   *
   * Fixes bug in {@link Router} {@see https://github.com/lit/lit/discussions/3256}
   */
  navigateTo(pathname: string) {
    window.history.pushState(null, '', pathname);
    return this.goto(pathname);
  }
}
