import { webContextProvider } from '@game-companion/context';
import {
  DbService,
  NavigatableRouter,
  PlayerStats,
  PlayerStatsRegistry,
  SessionHelper,
  SessionsService,
  SettingsService,
} from '@game-companion/core';
import { customElement, LitElement, property } from '@game-companion/lit';
import {
  ConfirmDialogService,
  DialogService,
  SnackbarService,
} from '@game-companion/mdc';

declare global {
  interface HTMLElementTagNameMap {
    [GcProviderElement.selector]: GcProviderElement;
  }
}

@customElement(GcProviderElement.selector)
@webContextProvider()
export class GcProviderElement extends LitElement {
  static readonly selector = 'gc-provider';

  @property()
  @webContextProvider(NavigatableRouter)
  declare router?: NavigatableRouter;

  @property()
  set playerStats(playerStats: PlayerStats[]) {
    this.playerStatsRegistry = new PlayerStatsRegistry(playerStats);
  }

  @webContextProvider(PlayerStatsRegistry)
  playerStatsRegistry = new PlayerStatsRegistry([]);

  @webContextProvider(DbService)
  dbService = new DbService();

  @webContextProvider(SessionsService)
  sessionsService = new SessionsService(this.dbService);

  @webContextProvider(SettingsService)
  settingsService = new SettingsService(this.dbService);

  @webContextProvider(SessionHelper)
  sessionHelper = new SessionHelper();

  @webContextProvider(DialogService)
  dialogService = new DialogService({ renderRoot: this });

  @webContextProvider(ConfirmDialogService)
  confirmDialogService = new ConfirmDialogService(this.dialogService);

  @webContextProvider(SnackbarService)
  snackbarService = new SnackbarService();

  protected override createRenderRoot() {
    return this;
  }
}
