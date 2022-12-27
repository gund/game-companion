import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { until, when } from './lit-directives';
import './session-list.element';
import type { Session } from './session.model';
import { SessionsService } from './sessions.service';

declare global {
  interface HTMLElementTagNameMap {
    [SessionsElement.selector]: SessionsElement;
  }
}

@customElement(SessionsElement.selector)
export class SessionsElement extends LitElement {
  static readonly selector = 'tfm-sessions';

  private sessionsService = new SessionsService();

  private sessions = this.sessionsService.getAllActive();
  private sessionsCount = this.sessions.then((sesssions) => sesssions.length);

  render() {
    return html`
      <h1>Active Sessions (${until(this.sessionsCount, '...')})</h1>
      ${until(
        this.sessions.then((s) => this.renderSessions(s)),
        'Loading...'
      )}
    `;
  }

  renderSessions(sessions: Session[]) {
    return html`${when(
        sessions.length,
        () => html`<tfm-session-list .sessions=${sessions}></tfm-session-list>`,
        () => this.renderNoSessions()
      )}
      <p><a href="/session/new">Create new session</a></p>`;
  }

  renderNoSessions() {
    return html`No sessions found!`;
  }
}
