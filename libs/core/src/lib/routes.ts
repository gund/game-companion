import { RouteConfig } from '@lit-labs/router';
import { html } from 'lit';

export function getRoutes(baseUrl?: string): RouteConfig[] {
  return [
    {
      path: `${baseUrl}`,
      render: () => html`<gc-sessions></gc-sessions>`,
      enter: () => import('../../sessions/sessions.element.js').then(),
    },
    {
      path: `${baseUrl}session/new`,
      render: () => html`<gc-new-session></gc-new-session>`,
      enter: () => import('../../new-session/new-session.element.js').then(),
    },
    {
      path: `${baseUrl}session/:sid`,
      render: ({ sid }) => html`<gc-session .sId=${sid}></gc-session>`,
      enter: () => import('../../session/session.element.js').then(),
    },
    {
      path: `${baseUrl}session/:sid/player/:pid`,
      render: ({ sid, pid }) =>
        html`<gc-player .sId=${sid} .pId=${pid}></gc-player>`,
      enter: () => import('../../player/player.element.js').then(),
    },
  ];
}
