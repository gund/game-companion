import { SnackbarService } from '@game-companion/mdc';
import { SettingsService } from './settings.service.js';

export class WakelockService {
  protected sentinel?: WakeLockSentinel;
  protected isEnabled?: boolean;
  protected shouldShowNotification?: boolean;
  protected shouldReaquire = false;
  protected disposable?: () => void;

  constructor(
    protected settingsService: SettingsService,
    protected snackbarService: SnackbarService,
    protected wakeLock = globalThis.navigator.wakeLock,
    protected document = globalThis.document,
  ) {
    this.init().catch(console.error);
  }

  isSupported() {
    return this.wakeLock !== undefined;
  }

  isAquired() {
    return !!this.sentinel || this.shouldReaquire;
  }

  async request() {
    if (!this.isSupported()) {
      return false;
    }

    if (!this.canRequest()) {
      this.shouldReaquire = true;
      return true;
    }

    if (this.sentinel) {
      return true;
    }

    this.sentinel = await this.wakeLock.request('screen');

    this.sentinel.addEventListener('release', this.handleRelease);

    this.showNotification('Wakelock aquired!');

    return true;
  }

  async release() {
    this.shouldReaquire = false;

    if (!this.sentinel) {
      return;
    }

    this.sentinel?.removeEventListener('release', this.handleRelease);

    try {
      await this.sentinel?.release();

      this.showNotification('Wakelock released!');
    } finally {
      this.sentinel = undefined;
    }
  }

  dispose() {
    this.document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange,
    );
    this.disposable?.();
    this.disposable = undefined;
    this.release();
  }

  protected async init() {
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    this.disposable = this.settingsService.onUpdate(() =>
      this.updateSettings(),
    );

    await this.updateSettings();
  }

  protected canRequest() {
    if (this.isEnabled === undefined) {
      this.shouldReaquire = true;
      return false;
    }

    return this.isEnabled && this.document.visibilityState === 'visible';
  }

  protected handleRelease = () => {
    this.sentinel?.removeEventListener('release', this.handleRelease);
    this.sentinel = undefined;
    this.shouldReaquire = true;
  };

  protected handleVisibilityChange = async () => {
    if (this.shouldReaquire) {
      await this.request();
    }
  };

  protected async showNotification(msg: string) {
    if (!this.shouldShowNotification) {
      return;
    }

    await this.snackbarService.open({
      content: msg,
      hasDismiss: true,
      tag: 'gc-wakelock-message',
    });
  }

  protected async updateSettings() {
    this.isEnabled =
      (await this.settingsService.getById('wakelock-enabled'))?.value ?? false;
    this.shouldShowNotification =
      (await this.settingsService.getById('wakelock-notifications'))?.value ??
      false;

    if (this.isEnabled && this.shouldReaquire) {
      await this.request();
    } else if (!this.isEnabled && this.isAquired()) {
      await this.release();
    }
  }
}
