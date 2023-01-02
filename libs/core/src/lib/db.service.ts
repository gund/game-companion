import {
  DBSchema,
  IDBPDatabase,
  openDB,
  OpenDBCallbacks,
} from 'idb/with-async-ittr';
import { Session } from './session.model.js';

export interface DbSchema extends DBSchema {
  sessions: {
    key: string;
    value: Session;
    indexes: {
      isActive: BooleanNumber;
      createdAt: Date;
      'isActive-createdAt': [BooleanNumber, Date | string];
    };
  };
}

export enum BooleanNumber {
  False,
  True,
}

export enum TextRange {
  Upper = '\uFFFF',
}

export class DbService {
  private migrations: Record<string, OpenDBCallbacks<DbSchema>['upgrade']> = {
    1: (db) => {
      const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id' });
      sessionsStore.createIndex('isActive', 'isActive');
      sessionsStore.createIndex('createdAt', 'createdAt');
      sessionsStore.createIndex('isActive-createdAt', [
        'isActive',
        'createdAt',
      ]);
    },
  };

  private db?: Promise<IDBPDatabase<DbSchema>>;

  constructor(private dbName = 'tfm-db', private dbVersion = 1) {}

  getDb(): Promise<IDBPDatabase<DbSchema>> {
    if (!this.db) {
      this.db = openDB<DbSchema>(this.dbName, this.dbVersion, {
        upgrade: (db, oldVersion, newVersion, tx, event) => {
          const versions = Object.keys(this.migrations).map(Number).sort();
          const lastVersion = versions[versions.length - 1];

          for (
            let version = oldVersion + 1;
            version <= lastVersion;
            version++
          ) {
            console.log('Running migration', version);
            this.migrations[version]?.(db, oldVersion, newVersion, tx, event);
          }
        },
      });
    }

    return this.db;
  }
}
