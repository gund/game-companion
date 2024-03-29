import { webContextConsumer } from '@game-companion/context';
import type { PlayerStatsData, Session } from '@game-companion/core';
import {
  NavigatableRouter,
  Player,
  PlayerStatsRegistry,
  SessionsService,
  isScorePlayerStatsData,
  isShallowEqual,
} from '@game-companion/core';
import '@game-companion/core/add-player-stats';
import { AddPlayerStatsEvent } from '@game-companion/core/add-player-stats';
import {
  LitElement,
  css,
  customElement,
  html,
  ifDefined,
  repeat,
  state,
  when,
} from '@game-companion/lit';
import '@game-companion/mdc/button';
import '@game-companion/mdc/card';
import '@game-companion/mdc/icon-button';
import { layoutStyles } from '@game-companion/mdc/layout';
import '@game-companion/mdc/text-field';
import '@game-companion/mdc/top-app-bar';

declare global {
  interface HTMLElementTagNameMap {
    [GcNewSessionElement.selector]: GcNewSessionElement;
  }
}

@customElement(GcNewSessionElement.selector)
@webContextConsumer()
export class GcNewSessionElement extends LitElement {
  static readonly selector = 'gc-new-session';
  static override styles = [
    layoutStyles,
    css`
      .player-field,
      .global-stats-field {
        display: block;
        margin-bottom: 16px;
      }

      h3 span {
        vertical-align: text-bottom;
      }

      fieldset {
        margin: 0;
        padding: 0;
        border: none;
      }
    `,
  ];

  @state()
  private declare players: Player[];
  @state()
  private declare globalStats: PlayerStatsData[];
  @state()
  private declare currentGlobalStats?: PlayerStatsData;
  @state()
  private declare error?: string;
  @state()
  private declare isSaving: boolean;

  @webContextConsumer(NavigatableRouter)
  private declare router: NavigatableRouter;

  @webContextConsumer(PlayerStatsRegistry)
  private declare playerStatsRegistry: PlayerStatsRegistry;

  @webContextConsumer(SessionsService)
  private declare sessionsService: SessionsService;

  constructor() {
    super();

    this.players = [];
    this.globalStats = [];
    this.isSaving = false;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.prefillSession();
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
          title="Back"
          aria-label="Back"
        ></mdc-icon-button>
        <div class="mdc-layout-grid">
          <div class="mdc-layout-grid__inner">
            <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-12">
              <form @submit=${this.handleSubmit}>
                <fieldset ?disabled=${this.isSaving}>
                  <mdc-card>
                    <div class="mdc-layout-grid">
                      <div class="mdc-layout-grid__inner">
                        <div
                          class="mdc-layout-grid__cell mdc-layout-grid__cell--span-12"
                        >
                          <h3>
                            <span>Players (${this.players.length})</span>
                            <mdc-icon-button
                              type="button"
                              icon="person_add"
                              title="Add player"
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
                                trailingIcon=${ifDefined(
                                  i > 0 ? 'person_remove' : null,
                                )}
                                trailingIconLabel=${ifDefined(
                                  i > 0 ? 'Remove player' : null,
                                )}
                                @mdcTextFieldIconClick:trailing=${{
                                  handleEvent: () => this.removePlayer(p),
                                }}
                              >
                              </mdc-text-field>`,
                          )}
                        </div>
                        <div
                          class="mdc-layout-grid__cell mdc-layout-grid__cell--span-6"
                        >
                          <h3>
                            Global Player Stats (${this.globalStats.length})
                          </h3>
                          ${when(
                            this.globalStats.length,
                            () =>
                              html`${repeat(
                                this.globalStats,
                                (ps) => ps.id,
                                (ps) => html`<mdc-text-field
                                  readonly
                                  class="global-stats-field"
                                  label="Global Player Stats"
                                  value=${this.getPlayerStatsName(ps)}
                                  trailingIcon="delete"
                                  trailingIconLabel="Remove Global Stat"
                                  @mdcTextFieldIconClick:trailing=${{
                                    handleEvent: () =>
                                      this.removeGlobalStats(ps),
                                  }}
                                ></mdc-text-field>`,
                              )}`,
                            () => html`<p>No global stats added!</p>`,
                          )}
                        </div>
                        <div
                          class="mdc-layout-grid__cell mdc-layout-grid__cell--span-6"
                        >
                          <h3>Add Global Player Stats</h3>
                          <gc-add-player-stats
                            @gcAddPlayerStats=${this.updateGlobalStats}
                          ></gc-add-player-stats>
                          <mdc-button
                            slot="actions"
                            type="button"
                            outlined
                            ?disabled=${!this.currentGlobalStats}
                            @click=${{
                              handleEvent: () => this.commitGlobalStats(),
                            }}
                          >
                            Add Stats
                          </mdc-button>
                        </div>
                        <div
                          class="mdc-layout-grid__cell mdc-layout-grid__cell--span-12"
                        >
                          ${when(this.error, () => html`<p>${this.error}</p>`)}
                        </div>
                      </div>
                    </div>
                    <mdc-button slot="actions" type="submit" raised>
                      ${this.isSaving
                        ? 'Creating session...'
                        : 'Create session'}
                    </mdc-button>
                    <mdc-button slot="actions" type="reset">Reset</mdc-button>
                  </mdc-card>
                </fieldset>
              </form>
            </div>
          </div>
        </div>
      </mdc-top-app-bar>
    `;
  }

  addPlayer(
    player: Player = {
      id: this.sessionsService.genId(),
      name: '',
      stats: [],
    },
  ) {
    this.players = [...this.players, player];
    return player;
  }

  removePlayer(player: Player) {
    this.players = this.players.filter((p) => p !== player);
  }

  addGlobalStats(stats: PlayerStatsData) {
    this.commitGlobalStats(stats);
  }

  createSession() {
    this.players.forEach(
      (player) =>
        (player.stats = [
          ...this.globalStats.map((ps) => ({ ...ps })),
          ...player.stats,
        ]),
    );
    return this.sessionsService.createSession({ players: this.players });
  }

  private updateGlobalStats(event: AddPlayerStatsEvent) {
    this.currentGlobalStats = event.data;
  }

  private commitGlobalStats(stats = this.currentGlobalStats) {
    if (!stats) {
      return;
    }

    this.globalStats = [...this.globalStats, stats];
  }

  private removeGlobalStats(data: PlayerStatsData) {
    this.globalStats = this.globalStats.filter((ps) => ps !== data);
  }

  private getPlayerStatsName(data: PlayerStatsData) {
    const playerStats = this.playerStatsRegistry
      .getAvailable()
      .find((ps) => ps.getId() === data.id);

    if (!playerStats) {
      return `Unknown(${data.id})`;
    }

    return playerStats.getName();
  }

  private async handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const data = new FormData(e.target as HTMLFormElement);

    const playerNames = data.getAll('player[]').map(String);

    this.players.forEach((p, i) => (p.name = playerNames[i]));

    try {
      this.error = undefined;
      this.isSaving = true;
      const session = await this.createSession();
      await this.router.navigateTo(`/session/${session.id}`);
    } catch (e) {
      this.error = String(e);
    } finally {
      this.isSaving = false;
    }
  }

  private async prefillSession(): Promise<void> {
    const duplicateSessionId = new URLSearchParams(window.location.search).get(
      'duplicateSession',
    );

    if (!duplicateSessionId) {
      return void this.addPlayer();
    }

    let session: Session;

    // First try to get the session and add the players
    try {
      session = await this.sessionsService.getById(duplicateSessionId);

      session.players
        .map((player) => ({ ...player, stats: [] }))
        .forEach((player) => this.addPlayer(player));
    } catch {
      return void this.addPlayer();
    }

    // Then try to extract the global stats and add them
    try {
      const allStats = session.players
        .map((player) => player.stats)
        .flat()
        .map((stat) => {
          stat = { ...stat };

          if (isScorePlayerStatsData(stat)) {
            delete stat.scoreCount;
          }

          return stat;
        });

      const globalStats: PlayerStatsData[] = [];

      allStats.forEach((stat) => {
        if (
          !globalStats.find((s) => stat.id === s.id && isShallowEqual(stat, s))
        ) {
          globalStats.push(stat);
        }
      });

      globalStats.forEach((stat) => this.addGlobalStats(stat));
    } catch {
      // Do nothing
    }
  }
}
