import { Session, SessionsService } from '@game-companion/core';
import '@game-companion/core/session-list';
import {
  css,
  customElement,
  html,
  LitElement,
  state,
  until,
  when,
} from '@game-companion/lit';
import '@game-companion/mdc/fab';
import '@game-companion/mdc/top-app-bar';

declare global {
  interface HTMLElementTagNameMap {
    [GcSessionsElement.selector]: GcSessionsElement;
  }
}

@customElement(GcSessionsElement.selector)
export class GcSessionsElement extends LitElement {
  static readonly selector = 'gc-sessions';
  static override styles = [
    css`
      mdc-fab {
        position: fixed;
        right: 24px;
        bottom: 24px;
      }
    `,
  ];

  private sessionsService = new SessionsService();

  @state()
  private declare sessions: Promise<Session[]>;
  @state()
  private declare inactiveSessions: Promise<Session[]>;

  protected override render() {
    return html`
      <mdc-top-app-bar appearance="fixed">
        <span slot="title">Sessions</span>
        ${until(
          this.sessions.then((s) => this.renderSessions(s)),
          `Loading...`
        )}
        ${until(
          this.inactiveSessions.then((s) => this.renderInactiveSessions(s))
        )}
      </mdc-top-app-bar>
      <mdc-fab
        type="link"
        href="/session/new"
        icon="group_add"
        aria-label="Create new session"
      ></mdc-fab>
    `;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.loadSessions();
  }

  private renderSessions(sessions: Session[]) {
    return html`<gc-session-list .sessions=${sessions}></gc-session-list>`;
  }

  private renderInactiveSessions(sessions: Session[]) {
    return html`${when(
      sessions.length,
      () => html`<h3>Inactive Sessions</h3>
        ${this.renderSessions(sessions)}`
    )}`;
  }

  private loadSessions() {
    this.sessions = this.sessionsService.getActive();
    this.inactiveSessions = this.sessionsService.getInactive();
  }
}
