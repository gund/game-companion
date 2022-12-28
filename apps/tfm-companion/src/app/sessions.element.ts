import { html, LitElement } from 'lit';
import { customElement, state } from './lit/decorators';
import { until, when } from './lit/directives';
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
      () => html`<tfm-session-list .sessions=${sessions}></tfm-session-list>`,
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
