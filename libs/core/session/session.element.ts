import type { Player, Session } from '@game-companion/core';
import { PlayerStatsRegistry, SessionsService } from '@game-companion/core';
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
import '@game-companion/mdc/card';
import '@game-companion/mdc/icon-button';
import { layoutStyles } from '@game-companion/mdc/layout';
import '@game-companion/mdc/top-app-bar';

declare global {
  interface HTMLElementTagNameMap {
    [GcSessionElement.selector]: GcSessionElement;
  }
}

@customElement(GcSessionElement.selector)
export class GcSessionElement extends LitElement {
  static readonly selector = 'gc-session';
  static override styles = [layoutStyles];

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
        aria-label="Back"
      ></mdc-icon-button>
      ${when(
        this.session?.isActive,
        () =>
          html`<mdc-icon-button
            slot="toolbar"
            type="button"
            class="mdc-top-app-bar__navigation-icon"
            icon="stop_circle"
            aria-label="Finish session"
            @click=${this.finishSession}
          ></mdc-icon-button>`
      )}
      ${when(
        this.session,
        () => this.renderSession(this.session!),
        () => this.renderFallback()
      )}
    </mdc-top-app-bar>`;
  }

  private renderSession(session: Session) {
    return html`<div class="mdc-layout-grid">
      <div class="mdc-layout-grid__inner">
        ${repeat(
          session.players,
          (p) => p.id,
          (p) => html`<div
            class="mdc-layout-grid__cell mdc-layout-grid__cell--span-6"
          >
            ${this.renderPlayer(p)}
          </div>`
        )}
      </div>
    </div>`;
  }

  private renderFallback() {
    return html`${when(
      this.isLoading,
      () => html`<p>Loading session data...</p>`,
      () => html`<p>Invalid session!</p>`
    )}`;
  }

  private renderPlayer(player: Player) {
    return html`<mdc-card>
      <h3>
        ${when(
          this.session?.isActive,
          () => html`${player.name}`,
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
      )}
      <mdc-button
        slot="actions"
        type="link"
        icon="edit"
        outlined
        href="/session/${this.sId}/player/${player.id}"
      >
        Edit Player
      </mdc-button>
    </mdc-card>`;
  }

  protected override willUpdate(
    changedProps: PropertyValueMap<GcSessionElement>
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
