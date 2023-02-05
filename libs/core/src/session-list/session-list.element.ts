import { webContextConsumer } from '@game-companion/context';
import type { Session } from '@game-companion/core';
import { SessionHelper } from '@game-companion/core';
import {
  css,
  customElement,
  html,
  LitElement,
  property,
  repeat,
  when,
} from '@game-companion/lit';
import { layoutStyles } from '@game-companion/mdc/layout';
import '@game-companion/mdc/list';

declare global {
  interface HTMLElementTagNameMap {
    [GcSessionListElement.selector]: GcSessionListElement;
  }
}

@customElement(GcSessionListElement.selector)
@webContextConsumer()
export class GcSessionListElement extends LitElement {
  static readonly selector = 'gc-session-list';
  static override styles = [
    layoutStyles,
    css`
      .no-sessions {
        padding-top: 0;
        padding-bottom: 0;
      }
    `,
  ];

  @property() declare sessions: Session[];

  @webContextConsumer(SessionHelper)
  private declare sessionHelper: SessionHelper;

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
      () => html`<div class="mdc-layout-grid no-sessions">
        <div class="mdc-layout-grid__inner">
          <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-12">
            <h3>No sessions found!</h3>
          </div>
        </div>
      </div>`
    )}`;
  }
}
