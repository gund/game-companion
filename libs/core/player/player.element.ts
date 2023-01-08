import {
  Player,
  PlayerStatsData,
  queryRootElement,
  Session,
} from '@game-companion/core';
import {
  isUpdatablePlayerStats,
  PlayerStatsRegistry,
  SessionsService,
  UpdatePlayerStatsDataEvent,
} from '@game-companion/core';
import '@game-companion/core/add-player-stats';
import { AddPlayerStatsEvent } from '@game-companion/core/add-player-stats';
import {
  createRef,
  css,
  customElement,
  html,
  LitElement,
  property,
  PropertyValueMap,
  ref,
  repeat,
  state,
  when,
} from '@game-companion/lit';
import '@game-companion/mdc/button';
import '@game-companion/mdc/card';
import '@game-companion/mdc/dialog';
import { MdcDialogElement } from '@game-companion/mdc/dialog';
import '@game-companion/mdc/icon-button';
import { layoutStyles } from '@game-companion/mdc/layout';
import '@game-companion/mdc/top-app-bar';

declare global {
  interface HTMLElementTagNameMap {
    [GcPlayerElement.selector]: GcPlayerElement;
  }
}

@customElement(GcPlayerElement.selector)
export class GcPlayerElement extends LitElement {
  static readonly selector = 'gc-player';
  static override styles = [
    layoutStyles,
    css`
      .player {
        display: flex;
        align-items: center;
      }

      .content {
        width: 100%;
      }

      .controls {
      }

      gc-add-player-stats {
        display: block;
        min-height: 150px;
      }
    `,
  ];

  @property() declare sId: string;
  @property() declare pId: string;

  @state() private declare session?: Session;
  @state() private declare player?: Player;
  @state() private declare isLoading: boolean;
  @state() private declare loadingError?: string;
  @state() private declare currentPlayerStats?: PlayerStatsData;

  private playerStatsDialogRef = createRef<MdcDialogElement>();

  private sessionsService = new SessionsService();
  private playerStatsRegistry = new PlayerStatsRegistry();

  constructor() {
    super();

    this.isLoading = false;
  }

  protected override render() {
    return html`<mdc-top-app-bar appearance="fixed">
        <span slot="title">Player ${this.player?.name}</span>
        <mdc-icon-button
          slot="menu"
          type="link"
          href="/session/${this.sId}"
          class="mdc-top-app-bar__navigation-icon"
          icon="arrow_back"
          aria-label="Back to session"
        ></mdc-icon-button>
        <mdc-icon-button
          slot="toolbar"
          type="button"
          icon="navigate_before"
          aria-label="Previous player"
          @click=${this.prevPlayer}
        ></mdc-icon-button>
        <mdc-icon-button
          slot="toolbar"
          type="button"
          icon="navigate_next"
          aria-label="Next player"
          @click=${this.nextPlayer}
        ></mdc-icon-button>
        <mdc-icon-button
          slot="toolbar"
          type="button"
          icon="add_circle"
          aria-label="Add Player Stats"
          @click=${{
            handleEvent: () => this.playerStatsDialogRef.value?.open(),
          }}
        ></mdc-icon-button>
        <div class="mdc-layout-grid">
          <div class="mdc-layout-grid__inner">
            ${when(
              this.player,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              () => this.renderPlayer(this.player!),
              () => this.renderFallback()
            )}
          </div>
        </div>
      </mdc-top-app-bar>
      <mdc-dialog fullscreen ${ref(this.playerStatsDialogRef)}>
        <span slot="title">Add Player Stats</span>
        <gc-add-player-stats
          @gcAddPlayerStats=${this.setCurrentPlayerStats}
        ></gc-add-player-stats>
        <mdc-button
          slot="actions"
          data-mdc-dialog-action="close"
          data-mdc-dialog-button-default
        >
          Close
        </mdc-button>
        <mdc-button
          slot="actions"
          raised
          data-mdc-dialog-action="add"
          ?disabled=${!this.currentPlayerStats}
          @click=${this.addPlayerStats}
        >
          Add
        </mdc-button>
      </mdc-dialog>`;
  }

  private renderPlayer(player: Player) {
    return html`${when(
      player.stats.length,
      () =>
        html`${repeat(
          player.stats,
          (ps) => ps.id,
          (ps) => html`<div
            class="mdc-layout-grid__cell mdc-layout-grid__cell--span-6"
          >
            <mdc-card
              @gcUpdateData=${{
                handleEvent: (e: UpdatePlayerStatsDataEvent) =>
                  this.updatePlayerStats(ps, e.data as object),
              }}
            >
              <h3>${this.getPlayerStatsName(ps.id)}</h3>
              <div>${this.renderPlayerStats(ps)}</div>
              <mdc-button
                slot="actions"
                type="button"
                icon="delete"
                outlined
                @click=${{
                  handleEvent: () => this.removePlayerStats(ps),
                }}
              >
                Remove Stats
              </mdc-button>
            </mdc-card>
          </div>`
        )}`
    )}`;
  }

  private renderPlayerStats(data: PlayerStatsData) {
    const playerStats = this.getPlayerStats(data.id);

    if (!playerStats) {
      return;
    }

    if (isUpdatablePlayerStats(playerStats)) {
      return playerStats.renderUpdateStats(data);
    } else {
      return playerStats.renderStats(data);
    }
  }

  private renderFallback() {
    return html`<div
      class="mdc-layout-grid__cell mdc-layout-grid__cell--span-12"
    >
      ${when(
        this.isLoading,
        () => html`Loading Player...`,
        () => html`<b>Invalid Player!</b> ${this.loadingError}`
      )}
    </div>`;
  }

  protected override willUpdate(
    changedProps: PropertyValueMap<GcPlayerElement>
  ) {
    if (changedProps.has('sId')) {
      this.loadSession();
    }
    if (changedProps.has('pId')) {
      this.updatePlayer();
    }
  }

  private async loadSession() {
    this.session = undefined;
    this.loadingError = undefined;

    if (!this.sId) {
      this.loadingError = String(new Error('No Session Id was provided!'));
      return;
    }

    if (!this.pId) {
      this.loadingError = String(new Error(`No Player Id was provided!`));
      return;
    }

    try {
      this.isLoading = true;
      this.session = await this.sessionsService.getById(this.sId);
      this.updatePlayer();
    } catch (e) {
      this.loadingError = String(e);
    } finally {
      this.isLoading = false;
    }
  }

  private updatePlayer() {
    this.player = this.session?.players.find((p) => p.id === this.pId);

    if (!this.player) {
      this.loadingError = String(
        new Error(`No Player with Id '${this.pId}' was found in this session!`)
      );
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

  private async updatePlayerStats(playerStats: PlayerStatsData, data?: object) {
    if (!this.player) {
      return;
    }

    this.player.stats = this.player.stats.map((ps) =>
      ps === playerStats ? { ...ps, ...data } : ps
    );

    this.player = await this.sessionsService.updatePlayer(
      this.sId,
      this.player
    );

    this.requestUpdate();
  }

  private setCurrentPlayerStats(event: AddPlayerStatsEvent) {
    this.currentPlayerStats = event.data;
  }

  private async addPlayerStats() {
    if (!this.player || !this.currentPlayerStats) {
      return;
    }

    this.player.stats = [...this.player.stats, this.currentPlayerStats];
    this.requestUpdate();

    await this.sessionsService.updatePlayer(this.sId, this.player);
  }

  private async removePlayerStats(data: PlayerStatsData) {
    if (!this.player) {
      return;
    }

    this.player.stats = this.player.stats.filter((ps) => ps !== data);
    this.requestUpdate();

    await this.sessionsService.updatePlayer(this.sId, this.player);
  }

  private async prevPlayer() {
    await this.cyclePlayer(false);
  }

  private async nextPlayer() {
    await this.cyclePlayer(true);
  }

  private async cyclePlayer(isNext: boolean) {
    if (!this.session || !this.player) {
      return;
    }

    const currPlayerIdx = this.session.players.findIndex(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (p) => p.id === this.player!.id
    );

    if (currPlayerIdx === -1) {
      return;
    }

    let nextPlayerIdx = isNext ? currPlayerIdx + 1 : currPlayerIdx - 1;

    if (nextPlayerIdx < 0) {
      nextPlayerIdx = this.session.players.length - 1;
    } else if (nextPlayerIdx > this.session.players.length - 1) {
      nextPlayerIdx = 0;
    }

    const nextPlayer = this.session.players[nextPlayerIdx];

    if (!nextPlayer) {
      return;
    }

    await queryRootElement().router.navigateTo(
      `/session/${this.session.id}/player/${nextPlayer.id}`
    );
  }
}
