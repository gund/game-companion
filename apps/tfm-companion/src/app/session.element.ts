import { html, LitElement, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat, when } from './lit-directives';
import type { Session } from './session.model';
import { SessionsService } from './sessions.service';

declare global {
  interface HTMLElementTagNameMap {
    [SessionElement.selector]: SessionElement;
  }
}

@customElement(SessionElement.selector)
export class SessionElement extends LitElement {
  static readonly selector = 'tfm-session';

  @property() declare sId?: string;

  @state() private declare session?: Session;
  @state() private declare isLoading: boolean;

  private sessionsService = new SessionsService();

  constructor() {
    super();

    this.isLoading = false;
  }

  render() {
    return html`<h1>Active Session</h1>
      ${when(
        this.session,
        () => this.renderSession(this.session!),
        () => this.renderFallback()
      )}
      <a href="/">Go back</a>`;
  }

  protected async willUpdate(changedProps: PropertyValueMap<SessionElement>) {
    if (changedProps.has('sId')) {
      await this.loadSession();
    }
  }

  private async loadSession() {
    this.session = undefined;

    if (!this.sId) {
      return;
    }

    try {
      this.isLoading = true;
      this.session = await this.sessionsService.getById(this.sId);
    } finally {
      this.isLoading = false;
    }
  }

  private renderSession(session: Session) {
    return html`<h2>Players (${session.players.length})</h2>
      <ul>
        ${repeat(
          session.players,
          (p) => p.name,
          (p) => html`<li>${p.name}</li>`
        )}
      </ul>`;
  }

  private renderFallback() {
    return html`${when(
      this.isLoading,
      () => html`<p>Loading session data...</p>`,
      () => html`<p>Invalid session!</p>`
    )}`;
  }
}
