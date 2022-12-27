import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AppElement } from './app.element';
import { live, repeat, when } from './lit-directives';
import type { Player } from './player.model';
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
  private declare error?: string;
  @state()
  private declare isSaving: boolean;

  private sessionsService = new SessionsService();

  constructor() {
    super();

    this.players = [];
    this.isSaving = false;
  }

  render() {
    return html`
      <h1>Create New Session</h1>
      <form @submit=${this.handleSubmit}>
      <fieldset ?disabled=${this.isSaving}>
        <p>
          <label><h3>Players (${this.players.length})</h3></label>
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
                <button @click=${{ handleEvent: () => this.removePlayer(p) }}>
                  Remove this player
                </button>
              </li>`
          )}
          </ul>
          <button type="button" @click=${{
            handleEvent: () => this.addPlayer(),
          }}>Add a player</button>
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

  addPlayer(player: Player = { name: '', stats: {} }) {
    this.players = [...this.players, player];
    return player;
  }

  removePlayer(player: Player) {
    this.players = this.players.filter((p) => p !== player);
  }

  createSession() {
    return this.sessionsService.createSession({ players: this.players });
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
