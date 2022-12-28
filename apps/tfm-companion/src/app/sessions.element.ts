import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { until, when } from './lit-directives';
import './session-list.element';
import type { Session } from './session.model';
import { SessionsService } from './sessions.service';

declare global {
  interface HTMLElementTagNameMap {
    [TfmSessionsElement.selector]: TfmSessionsElement;
  }
}

@customElement(TfmSessionsElement.selector)
export class TfmSessionsElement extends LitElement {
  static readonly selector = 'tfm-sessions';

  private sessionsService = new SessionsService();

  private sessions = this.sessionsService.getActive();
  private inactiveSessions = this.sessionsService.getInactive();
  private sessionsCount = this.sessions.then((sesssions) => sesssions.length);

  protected render() {
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

  renderSessions(sessions: Session[]) {
    return html`${when(
      sessions.length,
      () => html`<tfm-session-list .sessions=${sessions}></tfm-session-list>`,
      () => this.renderNoSessions()
    )}`;
  }

  renderInactiveSessions(sessions: Session[]) {
    return html`${when(
      sessions.length,
      () => html`<h2>Inactive Sessions (${sessions.length})</h2>
        ${this.renderSessions(sessions)}`
    )}`;
  }

  renderNoSessions() {
    return html`No sessions found!`;
  }
}
