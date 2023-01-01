import type { Player, PlayerStatsData } from '@game-companion/core';
import {
  PlayerStatsRegistry,
  queryRootElement,
  SessionsService,
} from '@game-companion/core';
import '@game-companion/core/add-player-stats';
import { AddPlayerStatsEvent } from '@game-companion/core/add-player-stats';
import {
  css,
  customElement,
  html,
  ifDefined,
  LitElement,
  repeat,
  state,
  when,
} from '@game-companion/lit';
import '@game-companion/mdc/button';
import '@game-companion/mdc/icon-button';
import '@game-companion/mdc/text-field';
import '@game-companion/mdc/top-app-bar';

declare global {
  interface HTMLElementTagNameMap {
    [GcNewSessionElement.selector]: GcNewSessionElement;
  }
}

@customElement(GcNewSessionElement.selector)
export class GcNewSessionElement extends LitElement {
  static readonly selector = 'gc-new-session';
  static override styles = [
    css`
      .player-field {
        display: block;
        margin-bottom: 8px;
      }
    `,
  ];

  @state()
  private declare players: Player[];
  @state()
  private declare globalStats: PlayerStatsData[];
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

    this.addPlayer();
  }

  protected override render() {
    return html`
      <mdc-top-app-bar appearance="fixed">
        <span slot="title">New Session</span>
        <mdc-icon-button
          slot="menu"
          type="link"
          href="/"
          class="mdc-top-app-bar__navigation-icon"
          icon="arrow_back"
          aria-label="Back"
        ></mdc-icon-button>
      <form @submit=${this.handleSubmit}>
      <fieldset ?disabled=${this.isSaving}>
        <p>
          <h3>
            Players (${this.players.length})
            <mdc-icon-button
              type="button"
              icon="person_add"
              aria-label="Add player"
              @click=${{ handleEvent: () => this.addPlayer() }}
            ></mdc-icon-button>
          </h3>
          ${repeat(
            this.players,
            (p, i) =>
              html`<mdc-text-field
                required
                class="player-field"
                name="player[]"
                label="Player name"
                value=${p.name}
                leadingIcon="person"
                trailingIcon=${ifDefined(i > 0 ? 'person_remove' : null)}
                trailingIconLabel=${ifDefined(i > 0 ? 'Remove player' : null)}
                @mdcTextFieldIconClick:trailing=${{
                  handleEvent: () => this.removePlayer(p),
                }}
              >
              </mdc-text-field>`
          )}
        </p>
        <p>
          <h3>Global Player Stats (${this.globalStats.length})</h3>
          <ul>
          ${repeat(
            this.globalStats,
            (ps) => ps.id,
            (ps) => html`<li>
              ${this.getPlayerStatsName(ps.id)}
              <mdc-icon-button
                type="button"
                icon="delete"
                aria-label="Remove global stat"
                @click=${{ handleEvent: () => this.removeGlobalStats(ps) }}
              ></mdc-icon-button>
            </li>`
          )}
          </ul>
          <gc-add-player-stats @gcAddPlayerStats=${
            this.addGlobalStats
          }></gc-add-player-stats>
        </p>
        ${when(this.error, () => html`<p>${this.error}</p>`)}
        <p>
          <mdc-button type="submit" raised>
            ${this.isSaving ? 'Creating session...' : 'Create session'}
          </mdc-button>
          <mdc-button type="reset">Reset</mdc-button>
        </p>
      </fieldset>
      </form>
      </mdc-top-app-bar>
    `;
  }

  addPlayer(
    player: Player = {
      id: this.sessionsService.genId(),
      name: '',
      stats: [],
    }
  ) {
    this.players = [...this.players, player];
    return player;
  }

  removePlayer(player: Player) {
    this.players = this.players.filter((p) => p !== player);
  }

  createSession() {
    this.players.forEach(
      (player) =>
        (player.stats = [
          ...this.globalStats.map((ps) => ({ ...ps })),
          ...player.stats,
        ])
    );
    return this.sessionsService.createSession({ players: this.players });
  }

  private addGlobalStats(event: AddPlayerStatsEvent) {
    this.globalStats = [...this.globalStats, event.data];
  }

  private removeGlobalStats(data: PlayerStatsData) {
    this.globalStats = this.globalStats.filter((ps) => ps !== data);
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

    const data = new FormData(e.target as any);

    const playerNames = data.getAll('player[]').map(String);

    this.players.forEach((p, i) => (p.name = playerNames[i]));

    try {
      this.error = undefined;
      this.isSaving = true;
      const session = await this.createSession();
      await queryRootElement().router.goto(`/session/${session.id}`);
    } catch (e) {
      this.error = String(e);
    } finally {
      this.isSaving = false;
    }
  }
}
