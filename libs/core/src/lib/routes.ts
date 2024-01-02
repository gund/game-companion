import { RouteConfig } from '@lit-labs/router';
import { html } from 'lit';

export function getRoutes(baseUrl = '/'): RouteConfig[] {
  return [
    {
      path: `${baseUrl}`,
      render: () => html`<gc-sessions></gc-sessions>`,
      enter: () => import('@game-companion/core/sessions').then(),
    },
    {
      path: `${baseUrl}new-session*`,
      render: () => html`<gc-new-session></gc-new-session>`,
      enter: () => import('@game-companion/core/new-session').then(),
    },
    {
      path: `${baseUrl}session/:sid`,
      render: ({ sid }) => html`<gc-session .sId=${sid}></gc-session>`,
      enter: () => import('@game-companion/core/session').then(),
    },
    {
      path: `${baseUrl}session/:sid/player/:pid`,
      render: ({ sid, pid }) =>
        html`<gc-player .sId=${sid} .pId=${pid}></gc-player>`,
      enter: () => import('@game-companion/core/player').then(),
    },
    {
      path: `${baseUrl}settings`,
      render: () => html`<gc-settings></gc-settings>`,
      enter: () => import('@game-companion/core/settings').then(),
    },
  ];
}
