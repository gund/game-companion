import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from './lit-directives';
import { SessionHelper } from './session.helper';
import type { Session } from './session.model';

declare global {
  interface HTMLElementTagNameMap {
    [SessionListElement.selector]: SessionListElement;
  }
}

@customElement(SessionListElement.selector)
export class SessionListElement extends LitElement {
  static readonly selector = 'tfm-session-list';

  @property() declare sessions: Session[];

  private sessionHelper = new SessionHelper();

  protected render() {
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
