import {
  customElement,
  html,
  LitElement,
  property,
  repeat,
} from '@game-companion/lit';
import { SessionHelper } from './session.helper';
import type { Session } from './session.model';

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
