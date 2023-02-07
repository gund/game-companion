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
  }
}

export type { GcSettingsRegistry };

export class SettingsService {
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

    return setting;
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
