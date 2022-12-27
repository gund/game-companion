import { html, LitElement, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat, when } from './lit-directives';
import { PlayerStatsRegistry } from './player-stats/registry';
import type { Player } from './player.model';
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
  private playerStatsRegistry = new PlayerStatsRegistry();

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

  private renderSession(session: Session) {
    return html`<h2>Players (${session.players.length})</h2>
      <ul>
        ${repeat(
          session.players,
          (p) => p.name,
          (p) => html`<li>${this.renderPlayer(p)}</li>`
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

  private renderPlayer(player: Player) {
    return html`<h3>
        <a href="/session/${this.sId}/player/${player.id}">${player.name}</a>
      </h3>
      ${when(
        player.stats.length,
        () => html`<table>
          ${repeat(
            player.stats,
            (ps) => ps.id,
            (ps) => html`<tr>
              <td>${this.getPlayerStatsName(ps.id)}</td>
              <td>${this.getPlayerStats(ps.id)?.renderStats(ps)}</td>
            </tr>`
          )}
        </table>`
      )}`;
  }

  protected willUpdate(changedProps: PropertyValueMap<SessionElement>) {
    if (changedProps.has('sId')) {
      this.loadSession();
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

  private getPlayerStats(id: string) {
    return this.playerStatsRegistry
      .getAvailable()
      .find((ps) => ps.getId() === id);
  }

  private getPlayerStatsName(id: string) {
    return this.getPlayerStats(id)?.getName() ?? `Unknown(${id})`;
  }
}
