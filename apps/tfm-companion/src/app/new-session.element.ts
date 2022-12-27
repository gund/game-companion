import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AppElement } from './app.element';
import { live, repeat, when } from './lit-directives';
import type {
  ConfigurablePlayerStats,
  PlayerStats,
  UpdatePlayerStatsDataEvent,
} from './player-stats/player-stats';
import { isConfigurablePlayerStats } from './player-stats/player-stats';
import { PlayerStatsRegistry } from './player-stats/registry';
import type { Player, PlayerStatsData } from './player.model';
import { SessionsService } from './sessions.service';

declare global {
  interface HTMLElementTagNameMap {
    [NewSessionElement.selector]: NewSessionElement;
  }
}

@customElement(NewSessionElement.selector)
export class NewSessionElement extends LitElement {
  static readonly selector = 'tfm-new-session';

  @state()
  private declare players: Player[];
  @state()
  private declare globalStats: PlayerStatsData[];
  @state()
  private declare selectedGlobalStats?: PlayerStats;
  @state()
  private declare selectedGlobalStatsData?: PlayerStatsData;
  @state()
  private declare error?: string;
  @state()
  private declare isSaving: boolean;

  private sessionsService = new SessionsService();
  private playerStatsRegistry = new PlayerStatsRegistry();

  constructor() {
    super();

    this.players = [];
    this.globalStats = [];
    this.isSaving = false;
  }

  render() {
    return html`
      <h1>Create New Session</h1>
      <form @submit=${this.handleSubmit}>
      <fieldset ?disabled=${this.isSaving}>
        <p>
          <fieldset>
          <h3>Players (${this.players.length})</h3>
          <ul>
          ${repeat(
            this.players,
            (p) =>
              html`<li>
                <input
                  placeholder="Player name"
                  required
                  .value=${live(p.name)}
                  @change=${(e: Event) =>
                    (p.name = (e.target as HTMLInputElement).value)}
                />
                <button
                  type="button"
                  @click=${{ handleEvent: () => this.removePlayer(p) }}
                >
                  Remove
                </button>
              </li>`
          )}
          </ul>
          <button type="button" @click=${{
            handleEvent: () => this.addPlayer(),
          }}>Add a player</button>
          </fieldset>
        </p>
        <p>
          <fieldset>
          <h3>Global Player Stats (${this.globalStats.length})</h3>
          <ul>
          ${repeat(
            this.globalStats,
            (ps) => ps.id,
            (ps) => html`<li>
              ${this.getPlayerStatsName(ps.id)}
              <button
                type="button"
                @click=${{ handleEvent: () => this.removeGlobalStats(ps) }}
              >
                Remove
              </button>
            </li>`
          )}
          </ul>
          <select @change=${this.selectGlobalStats}>
            <option disabled ?selected=${!this.selectedGlobalStats}>
              -- Select stats --
            </option>
            ${repeat(
              this.playerStatsRegistry.getAvailable(),
              (ps) => ps.getId(),
              (ps) =>
                html`<option
                  .value=${ps.getId()}
                  ?selected=${ps === this.selectedGlobalStats}
                >
                  ${ps.getName()}
                </option>`
            )}
          </select>
          ${when(
            this.selectedGlobalStats &&
              isConfigurablePlayerStats(this.selectedGlobalStats),
            () => html`<p
              @tfmUpdateData=${{
                handleEvent: (e: UpdatePlayerStatsDataEvent) =>
                  this.updateGlobalStatsData(e.data),
              }}
            >
              ${(
                this.selectedGlobalStats as PlayerStats &
                  ConfigurablePlayerStats
              ).renderConfiguration()}
            </p>`
          )}
          <button type="button"
            ?disabled=${!this.selectedGlobalStatsData}
            @click=${this.addGlobalStats}>
            Add
          </button>
          </fieldset>
        </p>
        ${when(this.error, () => html`<p>${this.error}</p>`)}
        <p>
          <button type="submit">${
            this.isSaving ? 'Creating session...' : 'Create session'
          }</button>
        </p>
      </fieldset>
      </form>
      <p><a href="/">Go back</a></p>
    `;
  }

  addPlayer(player: Player = { name: '', stats: [] }) {
    this.players = [...this.players, player];
    return player;
  }

  removePlayer(player: Player) {
    this.players = this.players.filter((p) => p !== player);
  }

  createSession() {
    this.players.forEach(
      (player) => (player.stats = [...this.globalStats, ...player.stats])
    );
    return this.sessionsService.createSession({ players: this.players });
  }

  private addGlobalStats() {
    if (!this.selectedGlobalStatsData) {
      return;
    }

    this.globalStats = [...this.globalStats, this.selectedGlobalStatsData];
    this.selectedGlobalStats = undefined;
    this.selectedGlobalStatsData = undefined;
  }

  private removeGlobalStats(data: PlayerStatsData) {
    this.globalStats = this.globalStats.filter((ps) => ps !== data);
  }

  private selectGlobalStats(e: Event) {
    const selectedId = (e.target as HTMLSelectElement).value;
    this.selectedGlobalStats = this.playerStatsRegistry
      .getAvailable()
      .find((ps) => ps.getId() === selectedId);

    if (
      !this.selectedGlobalStats ||
      isConfigurablePlayerStats(this.selectedGlobalStats)
    ) {
      return;
    }

    this.updateGlobalStatsData({});
  }

  private updateGlobalStatsData(data?: unknown) {
    if (!this.selectedGlobalStats) {
      return;
    }

    this.selectedGlobalStatsData = data
      ? { ...data, id: this.selectedGlobalStats.getId() }
      : undefined;
  }

  private getPlayerStatsName(id: string) {
    return (
      this.playerStatsRegistry
        .getAvailable()
        .find((ps) => ps.getId() === id)
        ?.getName() ?? `Unknown(${id})`
    );
  }

  private async handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    try {
      this.error = undefined;
      this.isSaving = true;
      const session = await this.createSession();
      await AppElement.query().router.goto(`/session/${session.id}`);
    } catch (e) {
      this.error = String(e);
    } finally {
      this.isSaving = false;
    }
  }
}
