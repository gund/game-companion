import type { Session } from '@game-companion/core';
import { SessionHelper } from '@game-companion/core';
import {
  customElement,
  html,
  LitElement,
  property,
  repeat,
} from '@game-companion/lit';

declare global {
  interface HTMLElementTagNameMap {
    [GcSessionListElement.selector]: GcSessionListElement;
  }
}

@customElement(GcSessionListElement.selector)
export class GcSessionListElement extends LitElement {
  static readonly selector = 'gc-session-list';

  @property() declare sessions: Session[];

  private sessionHelper = new SessionHelper();

  protected override render() {
    return html`
      <ul>
        ${repeat(
          this.sessions,
          (s) => s.id,
          (s) => html`<li>
            <a href="/session/${s.id}">${this.sessionHelper.getName(s)}</a>
          </li>`
        )}
      </ul>
    `;
  }
}
