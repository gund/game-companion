import { webContextConsumer } from '@game-companion/context';
import { DbService, Setting, SettingsService } from '@game-companion/core';
import '@game-companion/core/menu-drawer';
import {
  customElement,
  html,
  LitElement,
  repeat,
  state,
  until,
  when,
} from '@game-companion/lit';
import { ConfirmDialogService } from '@game-companion/mdc';
import '@game-companion/mdc/button';
import '@game-companion/mdc/card';
import { layoutStyles } from '@game-companion/mdc/layout';
import '@game-companion/mdc/top-app-bar';

declare global {
  interface HTMLElementTagNameMap {
    [GcSettingsElement.selector]: GcSettingsElement;
  }
}

@customElement(GcSettingsElement.selector)
@webContextConsumer()
export class GcSettingsElement extends LitElement {
  static readonly selector = 'gc-settings';
  static override styles = [layoutStyles];

  @state() private declare drawerOpened: boolean;
  @state() private declare clearingStorage: boolean;
  @state() private declare settings?: Promise<Setting[]>;
  @state() private declare updateError?: string;

  @webContextConsumer(SettingsService)
  private declare settingsService: SettingsService;

  @webContextConsumer(DbService)
  private declare dbService: DbService;

  @webContextConsumer(ConfirmDialogService)
  private declare confirmDialogService: ConfirmDialogService;

  constructor() {
    super();

    this.drawerOpened = false;
    this.clearingStorage = false;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.loadSettings();
  }

  private loadSettings() {
    this.settings = this.settingsService.getAllSettings();
  }

  private async updateSetting(setting: Setting) {
    try {
      this.updateError = undefined;
      await this.settingsService.updateSetting(setting);
    } catch (e) {
      this.updateError = String(e);
    }
  }

  private async confirmClearStorage() {
    const isConfirmed = await this.confirmDialogService.confirm({
      title: 'Are you sure you want to clear storage?',
      content: html`<strong>WARNING</strong>: This action is IRREVERSIBLE!`,
    });

    if (isConfirmed) {
      await this.clearStorage();
    }
  }

  private async clearStorage() {
    try {
      this.clearingStorage = true;

      await this.dbService.clearStorage();
      this.loadSettings();
      this.confirmDialogService.confirm({
        title: 'Storage has been cleared!',
        yesText: 'OK',
      });
    } finally {
      this.clearingStorage = false;
    }
  }

  protected override render() {
    return html`
      <mdc-top-app-bar appearance="fixed">
        <span slot="title">Settings</span>
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
        <div class="mdc-layout-grid">
          <div class="mdc-layout-grid__inner">
            <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-12">
              ${until(
                this.settings
                  ?.then((settings) => this.renderSettings(settings))
                  .catch((e) => this.renderError(e)),
                () => html`Loading settings...`,
              )}
            </div>
            <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-12">
              ${this.renderDangerZone()}
            </div>
          </div>
        </div>
      </mdc-top-app-bar>
    `;
  }

  private renderError(e: unknown) {
    return html`<div class="mdc-layout-grid">
      <div class="mdc-layout-grid__inner">
        <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-12">
          Something went wrong! ${String(e)}
        </div>
        <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-12">
          <mdc-button type="button" oultined @click=${this.loadSettings}>
            Reload
          </mdc-button>
        </div>
      </div>
    </div>`;
  }

  private renderSettings(settings: Setting[]) {
    return html`
      <mdc-card>
        <div class="mdc-layout-grid">
          <div class="mdc-layout-grid__inner">
            ${when(
              this.updateError,
              () => html`<div
                class="mdc-layout-grid__cell mdc-layout-grid__cell--span-12"
              >
                <strong>Failed to update settings</strong>: ${this.updateError}
              </div>`,
            )}
            ${repeat(
              settings,
              (setting) => setting.id,
              (setting) => this.renderSetting(setting),
            )}
          </div>
        </div>
      </mdc-card>
    `;
  }

  private renderSetting(setting: Setting) {
    return html`
      <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-6">
        ${setting.name} (${setting.type})
      </div>
      <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-6">
        ${this.renderSettingControl(setting)}
      </div>
    `;
  }

  private renderSettingControl(setting: Setting) {
    switch (setting.type) {
      case 'bool':
        return html`<input
          type="checkbox"
          ?checked=${setting.value}
          @change=${{
            handleEvent: (event: Event) =>
              this.updateSetting({
                ...setting,
                value: (event.target as HTMLInputElement).checked,
              }),
          }}
        />`;
      default:
        return html`${setting.value}`;
    }
  }

  private renderDangerZone() {
    return html`
      <mdc-card>
        <h3>Danger Zone</h3>
        <div class="mdc-layout-grid">
          <div class="mdc-layout-grid__inner">
            <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-6">
              Clear all active and inactive sessions and reset your settings.
            </div>
            <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-6">
              <mdc-button
                type="button"
                raised
                icon="delete_forever"
                @click=${this.confirmClearStorage}
              >
                Clear Storage
              </mdc-button>
            </div>
          </div>
        </div>
      </mdc-card>
    `;
  }
}
