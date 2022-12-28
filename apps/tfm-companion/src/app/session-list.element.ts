import { html, LitElement } from 'lit';
import { customElement, property } from './lit/decorators';
import { repeat } from './lit/directives';
import { SessionHelper } from './session.helper';
import type { Session } from './session.model';

declare global {
  interface HTMLElementTagNameMap {
    [TfmSessionListElement.selector]: TfmSessionListElement;
  }
}

@customElement(TfmSessionListElement.selector)
export class TfmSessionListElement extends LitElement {
  static readonly selector = 'tfm-session-list';

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
