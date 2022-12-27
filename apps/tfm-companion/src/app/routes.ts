import { RouteConfig } from '@lit-labs/router';
import { html } from 'lit';

export const routes: RouteConfig[] = [
  {
    path: '/',
    render: () => html`<tfm-sessions></tfm-sessions>`,
    enter: () => import('./sessions.element').then(),
  },
  {
    path: '/session/new',
    render: () => html`<tfm-new-session></tfm-new-session>`,
    enter: () => import('./new-session.element').then(),
  },
  {
    path: '/session/:sid',
    render: ({ sid }) => html`<tfm-session .sId=${sid}></tfm-session>`,
    enter: () => import('./session.element').then(),
  },
  {
    path: '**',
    render: () =>
      html`<h1>Not Found!</h1>
        <a href="/">Back to home</a>`,
  },
];
