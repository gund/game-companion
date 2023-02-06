import { webContextConsumer } from '@game-companion/context';
import { Session, SessionsService } from '@game-companion/core';
import '@game-companion/core/menu-drawer';
import '@game-companion/core/session-list';
import {
  css,
  customElement,
  html,
  LitElement,
  state,
  until,
  when,
} from '@game-companion/lit';
import '@game-companion/mdc/button';
import '@game-companion/mdc/fab';
import { layoutStyles } from '@game-companion/mdc/layout';
import '@game-companion/mdc/top-app-bar';

declare global {
  interface HTMLElementTagNameMap {
    [GcSessionsElement.selector]: GcSessionsElement;
  }
}

@customElement(GcSessionsElement.selector)
@webContextConsumer()
export class GcSessionsElement extends LitElement {
  static readonly selector = 'gc-sessions';
  static override styles = [
    layoutStyles,
    css`
      mdc-fab {
        position: fixed;
        right: 24px;
        bottom: 24px;
      }

      .title {
        padding-top: 0;
        padding-bottom: 0;
      }
    `,
  ];

  @webContextConsumer(SessionsService)
  private declare sessionsService: SessionsService;

  @state()
  private declare sessions: Promise<Session[]>;
  @state()
  private declare inactiveSessions: Promise<Session[]>;
  @state()
  private declare drawerOpened: boolean;

  constructor() {
    super();

    this.drawerOpened = false;
  }

  protected override render() {
    return html`
      <mdc-top-app-bar appearance="fixed">
        <span slot="title">Sessions</span>
        <mdc-icon-button
          slot="menu"
          type="button"
          class="mdc-top-app-bar__navigation-icon"
          icon="${this.drawerOpened ? 'close' : 'menu'}"
          title="Toggle menu"
          aria-label="Toggle menu"
          @click=${{
            handleEvent: () => (this.drawerOpened = !this.drawerOpened),
          }}
        ></mdc-icon-button>
        <gc-menu-drawer
          slot="nav-drawer"
          ?open=${this.drawerOpened}
          @MDCDrawer:opened=${{ handleEvent: () => (this.drawerOpened = true) }}
          @MDCDrawer:closed=${{
            handleEvent: () => (this.drawerOpened = false),
          }}
        >
        </gc-menu-drawer>
        ${until(
          this.sessions
            .then((s) => this.renderSessions(s))
            .catch((e) => this.renderError(e)),
          `Loading...`,
        )}
        ${until(
          this.inactiveSessions
            .then((s) => this.renderInactiveSessions(s))
            .catch((e) => this.renderError(e)),
        )}
      </mdc-top-app-bar>
      <mdc-fab
        type="link"
        href="/session/new"
        icon="group_add"
        title="Create new session"
        aria-label="Create new session"
      ></mdc-fab>
    `;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.loadSessions();
  }

  private renderSessions(sessions: Session[]) {
    return html`<gc-session-list .sessions=${sessions}></gc-session-list>`;
  }

  private renderInactiveSessions(sessions: Session[]) {
    return html`${when(
      sessions.length,
      () => html`<div class="mdc-layout-grid title">
          <div class="mdc-layout-grid__inner">
            <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-12">
              <h3>Inactive Sessions</h3>
            </div>
          </div>
        </div>
        ${this.renderSessions(sessions)}`,
    )}`;
  }

  private renderError(e: unknown) {
    return html`<div class="mdc-layout-grid">
      <div class="mdc-layout-grid__inner">
        <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-12">
          Something went wrong! ${String(e)}
        </div>
        <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-12">
          <mdc-button type="button" oultined @click=${this.loadSessions}>
            Reload
          </mdc-button>
        </div>
      </div>
    </div>`;
  }

  private loadSessions() {
    this.sessions = this.sessionsService.getActive();
    this.inactiveSessions = this.sessionsService.getInactive();
  }
}
