import { webContextConsumer } from '@game-companion/context';
import type { Session } from '@game-companion/core';
import {
  isNameablePlayerStats,
  isUpdatablePlayerStats,
  Player,
  PlayerStatsData,
  PlayerStatsRegistry,
  SessionsService,
  UpdatePlayerStatsDataEvent,
  WakelockService,
} from '@game-companion/core';
import {
  css,
  customElement,
  html,
  LitElement,
  property,
  PropertyValueMap,
  repeat,
  state,
  when,
} from '@game-companion/lit';
import { ConfirmDialogService, SnackbarService } from '@game-companion/mdc';
import '@game-companion/mdc/card';
import '@game-companion/mdc/dialog';
import '@game-companion/mdc/icon-button';
import { layoutStyles } from '@game-companion/mdc/layout';
import '@game-companion/mdc/top-app-bar';

declare global {
  interface HTMLElementTagNameMap {
    [GcSessionElement.selector]: GcSessionElement;
  }
}

@customElement(GcSessionElement.selector)
@webContextConsumer()
export class GcSessionElement extends LitElement {
  static readonly selector = 'gc-session';
  static override styles = [
    layoutStyles,
    css`
      .player-stats {
        padding-left: 0;
        padding-right: 0;
      }
    `,
  ];

  @property() declare sId?: string;

  @state() private declare session?: Session;
  @state() private declare isLoading: boolean;
  @state() private declare isEditMode: boolean;
  @state() private declare isFinishingSession: boolean;
  @state() private declare loadingError?: string;

  @webContextConsumer(PlayerStatsRegistry)
  private declare playerStatsRegistry: PlayerStatsRegistry;

  @webContextConsumer(SessionsService)
  private declare sessionsService: SessionsService;

  @webContextConsumer(ConfirmDialogService)
  private declare confirmDialogService: ConfirmDialogService;

  @webContextConsumer(SnackbarService)
  private declare snackbarService: SnackbarService;

  @webContextConsumer(WakelockService)
  private declare wakelockService: WakelockService;

  constructor() {
    super();

    this.isLoading = false;
    this.isEditMode = false;
    this.isFinishingSession = false;
  }

  protected override render() {
    return html`<mdc-top-app-bar appearance="fixed">
      <span slot="title">
        ${this.session?.isActive ? 'Active' : 'Inactive'} Session
      </span>
      <mdc-icon-button
        slot="menu"
        type="link"
        href="/"
        class="mdc-top-app-bar__navigation-icon"
        icon="arrow_back"
        title="Back"
        aria-label="Back"
      ></mdc-icon-button>
      ${when(
        this.session?.isActive,
        () =>
          html`
            <mdc-icon-button
              slot="toolbar"
              type="button"
              class="mdc-top-app-bar__navigation-icon"
              icon="${this.isEditMode ? 'edit_off' : 'edit'}"
              title="Toggle edit mode"
              aria-label="Toggle edit mode"
              @click=${{
                handleEvent: () => (this.isEditMode = !this.isEditMode),
              }}
            ></mdc-icon-button>
            <mdc-icon-button
              slot="toolbar"
              type="button"
              class="mdc-top-app-bar__navigation-icon"
              icon="stop_circle"
              title="Finish session"
              aria-label="Finish session"
              ?disabled=${this.isFinishingSession}
              @click=${this.finishSession}
            ></mdc-icon-button>
          `,
      )}
      <div class="mdc-layout-grid">
        <div class="mdc-layout-grid__inner">
          ${when(
            this.session,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            () => this.renderSession(this.session!),
            () => this.renderFallback(),
          )}
        </div>
      </div>
    </mdc-top-app-bar>`;
  }

  private renderSession(session: Session) {
    return html`${repeat(
      session.players,
      (p) => p.id,
      (p) => html`<div
        class="mdc-layout-grid__cell mdc-layout-grid__cell--span-6"
      >
        ${this.renderPlayer(p)}
      </div>`,
    )}`;
  }

  private renderFallback() {
    return html`<div
      class="mdc-layout-grid__cell mdc-layout-grid__cell--span-12"
    >
      ${when(
        this.isLoading,
        () => html`Loading session data...`,
        () => html`<b>Invalid session!</b> ${this.loadingError}`,
      )}
    </div>`;
  }

  private renderPlayer(player: Player) {
    return html`<mdc-card>
      <h3>
        ${when(
          this.session?.isActive,
          () => html`${player.name}`,
          () => html`${player.name} ${this.getFinalPlayerScore(player)}`,
        )}
      </h3>
      <div class="mdc-layout-grid player-stats">
        <div class="mdc-layout-grid__inner">
          ${when(
            player.stats.length,
            () =>
              html` ${repeat(
                player.stats,
                (ps) => ps.id,
                (ps) => html`
                  <div
                    class="mdc-layout-grid__cell mdc-layout-grid__cell--span-4 mdc-layout-grid__cell--span-6-desktop"
                  >
                    ${this.getPlayerStatsName(ps)}
                  </div>
                  <div
                    class="mdc-layout-grid__cell mdc-layout-grid__cell--span-4 mdc-layout-grid__cell--span-6-desktop"
                    @gcUpdateData=${{
                      handleEvent: (e: UpdatePlayerStatsDataEvent) =>
                        this.updatePlayerStats(player, ps, e.data as object),
                    }}
                  >
                    ${this.renderPlayerStats(ps)}
                  </div>
                `,
              )}`,
            () => html`<div
              class="mdc-layout-grid__cell mdc-layout-grid__cell--span-12"
            >
              No player stats recorded.
            </div>`,
          )}
        </div>
      </div>
      ${when(
        this.session?.isActive,
        () => html`<mdc-button
          slot="actions"
          type="link"
          icon="edit"
          outlined
          href="/session/${this.sId}/player/${player.id}"
        >
          Edit stats
        </mdc-button>`,
      )}
    </mdc-card>`;
  }

  private renderPlayerStats(data: PlayerStatsData) {
    const playerStats = this.getPlayerStats(data.id);

    if (!playerStats) {
      return;
    }

    if (
      this.isEditMode &&
      this.session?.isActive &&
      isUpdatablePlayerStats(playerStats)
    ) {
      return playerStats.renderUpdateStats(data);
    } else {
      return playerStats.renderStats(data);
    }
  }

  protected override willUpdate(
    changedProps: PropertyValueMap<GcSessionElement>,
  ) {
    if (changedProps.has('sId')) {
      this.loadSession();
    }
  }

  private async loadSession() {
    this.session = undefined;
    this.loadingError = undefined;

    if (!this.sId) {
      this.loadingError = String(new Error('No Session Id was provided!'));
      return;
    }

    try {
      this.isLoading = true;
      this.session = await this.sessionsService.getById(this.sId);

      if (this.session.isActive) {
        this.wakelockService.request().catch((e) =>
          this.snackbarService.open({
            content: `Failed to request Wakelock: ${String(e)}`,
            hasDismiss: true,
          }),
        );
      }
    } catch (e) {
      this.loadingError = String(e);
    } finally {
      this.isLoading = false;
    }
  }

  private getPlayerStats(id: string) {
    return this.playerStatsRegistry
      .getAvailable()
      .find((ps) => ps.getId() === id);
  }

  private getPlayerStatsName(data: PlayerStatsData) {
    const playerStats = this.getPlayerStats(data.id);

    if (!playerStats) {
      return `Unknown(${data.id})`;
    }

    if (isNameablePlayerStats(playerStats)) {
      return playerStats.renderDisplayName(data);
    }

    return playerStats.getName();
  }

  private async finishSession() {
    this.isFinishingSession = true;

    try {
      const isConfirmed = await this.confirmDialogService.confirm({
        title: 'Finish Session?',
        content: html`Are you sure you want to finish this session?<br />
          You will not be able to modify any player stats anymore.`,
        yesText: 'Finish',
      });

      if (isConfirmed) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.session = await this.sessionsService.finishSesssion(this.sId!);

        this.wakelockService.release();
      }
    } catch (e) {
      await this.snackbarService.open({
        content: `Failed to finish session: ${String(e)}`,
        hasDismiss: true,
      });
    } finally {
      this.isFinishingSession = false;
    }
  }

  private getFinalPlayerScore(player: Player) {
    return player.stats.reduce(
      (score, ps) =>
        score + (this.getPlayerStats(ps.id)?.getFinalScore(ps) ?? 0),
      0,
    );
  }

  private async updatePlayerStats(
    player: Player,
    playerStats: PlayerStatsData,
    data?: object,
  ) {
    if (!this.session) {
      return;
    }

    player.stats = player.stats.map((ps) =>
      ps === playerStats ? { ...ps, ...data } : ps,
    );

    try {
      const updatedPlayer = await this.sessionsService.updatePlayer(
        this.session.id,
        player,
      );

      this.session.players = this.session.players.map((p) =>
        p.id === player.id ? updatedPlayer : p,
      );

      this.requestUpdate();
    } catch (e) {
      await this.snackbarService.open({
        content: `Failed to update Player ${player.name}: ${String(e)}`,
        hasDismiss: true,
      });
    }
  }
}
