import {
  customElement,
  html,
  LitElement,
  property,
  PropertyValueMap,
  repeat,
  state,
  when,
} from '@game-companion/lit';
import { PlayerStatsRegistry } from './player-stats/registry';
import type { Player } from './player.model';
import type { Session } from './session.model';
import { SessionsService } from './sessions.service';

declare global {
  interface HTMLElementTagNameMap {
    [TfmSessionElement.selector]: TfmSessionElement;
  }
}

@customElement(TfmSessionElement.selector)
export class TfmSessionElement extends LitElement {
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

  protected override render() {
    return html` ${when(
        this.session,
        () => this.renderSession(this.session!),
        () => this.renderFallback()
      )}
      <a href="/">Go back</a>`;
  }

  private renderSession(session: Session) {
    return html`<h1>${session.isActive ? 'Active' : 'Inactive'} Session</h1>
      <h2>Players (${session.players.length})</h2>
      <ul>
        ${repeat(
          session.players,
          (p) => p.name,
          (p) => html`<li>${this.renderPlayer(p)}</li>`
        )}
      </ul>
      ${when(
        session.isActive,
        () =>
          html`<p>
            <button @click=${this.finishSession}>Finish session</button>
          </p>`
      )}`;
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
        ${when(
          this.session?.isActive,
          () =>
            html`<a href="/session/${this.sId}/player/${player.id}"
              >${player.name}</a
            >`,
          () => html`${player.name} - ${this.getFinalPlayerScore(player)}`
        )}
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

  protected override willUpdate(
    changedProps: PropertyValueMap<TfmSessionElement>
  ) {
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

  private async finishSession() {
    if (!confirm('Are you sure you want to finish this session?')) {
      return;
    }

    this.session = await this.sessionsService.finishSesssion(this.sId!);
  }

  private getFinalPlayerScore(player: Player) {
    return player.stats.reduce(
      (score, ps) =>
        score + (this.getPlayerStats(ps.id)?.getFinalScore(ps) ?? 0),
      0
    );
  }
}
