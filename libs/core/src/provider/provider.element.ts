import { webContextProvider } from '@game-companion/context';
import {
  DbService,
  NavigatableRouter,
  PlayerStats,
  PlayerStatsRegistry,
  SessionHelper,
  SessionsService,
  SettingsService,
  WakelockService,
} from '@game-companion/core';
import {
  customElement,
  LitElement,
  property,
  PropertyValueMap,
} from '@game-companion/lit';
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
  declare playerStats?: PlayerStats[];

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

  @webContextProvider(WakelockService)
  wakelockService = new WakelockService(
    this.settingsService,
    this.snackbarService,
  );

  protected override createRenderRoot() {
    return this;
  }

  protected override willUpdate(
    changedProps: PropertyValueMap<GcProviderElement>,
  ) {
    if (changedProps.has('playerStats')) {
      this.playerStatsRegistry = new PlayerStatsRegistry(
        this.playerStats ?? [],
      );
    }
  }
}
