import type { Session } from '@game-companion/core';
import { SessionHelper } from '@game-companion/core';
import {
  customElement,
  html,
  LitElement,
  property,
  repeat,
  when,
} from '@game-companion/lit';
import '@game-companion/mdc/list';

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
    return html`${when(
      this.sessions.length,
      () => html`<mdc-list twoline icon="groups">
        ${repeat(
          this.sessions,
          (s) => s.id,
          (s) => html`<mdc-list-item>
            <a href="/session/${s.id}">
              <span class="mdc-list-item__primary-text"
                >${this.sessionHelper.getName(s)}</span
              >
              <span class="mdc-list-item__secondary-text"
                >From ${this.sessionHelper.formatSince(s)}</span
              >
            </a>
          </mdc-list-item>`
        )}
      </mdc-list>`,
      () => html`<h3>No sessions found!</h3>`
    )}`;
  }
}
