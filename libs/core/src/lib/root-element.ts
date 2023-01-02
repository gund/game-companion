import { Router } from '@lit-labs/router';
import { LitElement } from 'lit';
import type { PlayerStats } from './player-stats/index.js';
import { getRoutes } from './routes.js';

export interface GcRootElement extends LitElement {
  router: Router;
  baseUrl: string;
  playerStats: PlayerStats[];
}

export interface GcRootElementConfig {
  selector: string;
  baseUrl?: string;
  playerStats?: PlayerStats[];
}

export function mixinRootElement({
  selector,
  baseUrl = '/',
  playerStats = [],
}: GcRootElementConfig): new () => GcRootElement {
  rootElementSelector = selector;

  return class GcRootElement extends LitElement {
    baseUrl = baseUrl;
    router = new Router(this, getRoutes(baseUrl));
    playerStats = playerStats;

    protected override render() {
      return this.router.outlet();
    }
  };
}

let rootElement: GcRootElement | undefined;
let rootElementSelector: string | undefined;

export function queryRootElement() {
  if (!rootElement) {
    if (!rootElementSelector) {
      throw new Error('GcRootElement selector has not been provided!');
    }

    const element = document.getElementsByTagName(rootElementSelector).item(0);

    if (!element) {
      throw new Error('GcRootElement has not been mounted!');
    }

    rootElement = element as any;
  }

  return rootElement!;
}
