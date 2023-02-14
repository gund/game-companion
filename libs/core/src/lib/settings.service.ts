import { DbService } from './db.service.js';

declare global {
  interface GcDbSchema {
    settings: {
      key: SettingId;
      value: Setting;
      indexes: {};
    };
  }

  interface GcSettingsRegistry {
    'haptic-enabled': BooleanSetting;
    'wakelock-enabled': BooleanSetting;
    'wakelock-notifications': BooleanSetting;
  }
}

export type { GcSettingsRegistry };

export class SettingsService {
  protected updateCallbacks = new Map<
    SettingId | null,
    Set<(setting: Setting) => void>
  >();

  constructor(private dbService: DbService) {
    this.initDb();
  }

  private initDb() {
    this.dbService.addMigration(2, (db) => {
      db.createObjectStore('settings', { keyPath: 'id' });
    });

    this.dbService.addMigration(3, (_1, _2, _3, tx) => {
      tx.objectStore('settings').put({
        id: 'haptic-enabled',
        name: 'Haptic Feedback',
        type: 'bool',
        value: true,
        description:
          'Controls weather to perform tactile feedback (vibrations)' +
          ' when editing score fields.',
      });
    });

    this.dbService.addMigration(4, (_1, _2, _3, tx) => {
      tx.objectStore('settings').put({
        id: 'wakelock-enabled',
        name: 'Screen Wakelock',
        type: 'bool',
        value: true,
        description:
          'Request a screen wakelock in an active sessions to prevent it from going to sleep.',
      });

      tx.objectStore('settings').put({
        id: 'wakelock-notifications',
        name: 'Screen Wakelock Notifications',
        type: 'bool',
        value: true,
        description:
          'Show a notification whenever a Screen Wakelock is aquired or released.',
      });
    });
  }

  async getAllSettings(): Promise<Setting[]> {
    const db = await this.dbService.getDb();

    return db.getAll('settings');
  }

  async getById(id: SettingId): Promise<Setting | undefined> {
    const db = await this.dbService.getDb();

    return db.get('settings', id);
  }

  async updateSetting(setting: Setting): Promise<Setting> {
    const db = await this.dbService.getDb();

    await db.put('settings', setting);

    this.updateCallbacks.get(setting.id)?.forEach((cb) => cb(setting));
    this.updateCallbacks.get(null)?.forEach((cb) => cb(setting));

    return setting;
  }

  onUpdate(
    callback: (setting: Setting) => void,
    settingId?: SettingId,
  ): () => void {
    if (!this.updateCallbacks.has(settingId ?? null)) {
      this.updateCallbacks.set(settingId ?? null, new Set());
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.updateCallbacks.get(settingId ?? null)!.add(callback);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return () => this.updateCallbacks.get(settingId ?? null)!.delete(callback);
  }
}

export type Setting = BooleanSetting;

export type SettingId = keyof GcSettingsRegistry & string;

export interface SettingBase {
  id: SettingId;
  name: string;
  description?: string;
}

export interface BooleanSetting extends SettingBase {
  type: 'bool';
  value: boolean;
}
