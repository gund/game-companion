import type { Session } from '@game-companion/core';
import { SessionsService } from '@game-companion/core';
import '@game-companion/core/session-list';
import {
  customElement,
  html,
  LitElement,
  state,
  until,
  when,
} from '@game-companion/lit';

declare global {
  interface HTMLElementTagNameMap {
    [GcSessionsElement.selector]: GcSessionsElement;
  }
}

@customElement(GcSessionsElement.selector)
export class GcSessionsElement extends LitElement {
  static readonly selector = 'gc-sessions';

  private sessionsService = new SessionsService();

  @state()
  private declare sessions: Promise<Session[]>;
  @state()
  private declare inactiveSessions: Promise<Session[]>;
  @state()
  private declare sessionsCount: Promise<number>;

  protected override render() {
    return html`
      <h1>Active Sessions (${until(this.sessionsCount, '...')})</h1>
      ${until(
        this.sessions.then((s) => this.renderSessions(s)),
        'Loading...'
      )}
      <p><a href="/session/new">Create new session</a></p>
      ${until(
        this.inactiveSessions.then((s) => this.renderInactiveSessions(s))
      )}
    `;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.loadSessions();
  }

  private renderSessions(sessions: Session[]) {
    return html`${when(
      sessions.length,
      () => html`<gc-session-list .sessions=${sessions}></gc-session-list>`,
      () => this.renderNoSessions()
    )}`;
  }

  private renderInactiveSessions(sessions: Session[]) {
    return html`${when(
      sessions.length,
      () => html`<h2>Inactive Sessions (${sessions.length})</h2>
        ${this.renderSessions(sessions)}`
    )}`;
  }

  private renderNoSessions() {
    return html`No sessions found!`;
  }

  private loadSessions() {
    this.sessions = this.sessionsService.getActive();
    this.inactiveSessions = this.sessionsService.getInactive();
    this.sessionsCount = this.sessions.then((sesssions) => sesssions.length);
  }
}
