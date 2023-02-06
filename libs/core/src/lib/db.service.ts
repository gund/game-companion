import {
  DBSchema,
  IDBPDatabase,
  openDB,
  OpenDBCallbacks,
  deleteDB,
} from 'idb/with-async-ittr';

declare global {
  interface GcDbSchema extends DBSchema {}
}

export type { GcDbSchema };

export class DbService {
  private db?: Promise<IDBPDatabase<GcDbSchema>>;
  private dbVersion = 1;
  private dbPopulateData?: { oldVersion: number; newVersion: number | null };
  private migrations?: Record<string, Set<DbMigrationFn> | undefined>;
  private populateFns = new Set<DbPopulateFn>();

  constructor(private dbName = 'game-companion-db') {}

  addMigration(version: number, migrationFn: DbMigrationFn) {
    this.migrations = this.migrations || Object.create(null);
    const migrations =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.migrations![version] || (this.migrations![version] = new Set());

    migrations.add(migrationFn);

    if (version > this.dbVersion) {
      this.dbVersion = version;
    }
  }

  onPopulate(populateFn: DbPopulateFn) {
    this.populateFns.add(populateFn);

    // Trigger population instantly if DB was already opened
    this.db?.then((db) => this.runPopulations(db));
  }

  getDb(): Promise<IDBPDatabase<GcDbSchema>> {
    if (!this.db) {
      this.db = openDB<GcDbSchema>(this.dbName, this.dbVersion, {
        upgrade: (db, oldVersion, newVersion, tx, event) => {
          if (oldVersion === 0) {
            this.dbPopulateData = { oldVersion, newVersion };
          }

          this.runMigrations(oldVersion, db, oldVersion, newVersion, tx, event);
        },
      }).then(async (db) => {
        await this.runPopulations(db);

        return db;
      });
    }

    return this.db;
  }

  async clearStorage() {
    const db = await this.db;
    db?.close();

    await deleteDB(this.dbName);
    this.db = undefined;
  }

  private runMigrations(
    oldVersion: number,
    ...args: Parameters<DbMigrationFn>
  ) {
    if (!this.migrations) {
      return;
    }

    const versions = Object.keys(this.migrations).map(Number).sort();
    const lastVersion = versions[versions.length - 1];

    for (let version = oldVersion + 1; version <= lastVersion; version++) {
      console.debug(`Running migration for version ${version}`);
      this.migrations[version]?.forEach((migrationFn) => migrationFn(...args));
    }
  }

  private async runPopulations(db: IDBPDatabase<GcDbSchema>) {
    if (!this.dbPopulateData || this.populateFns.size === 0) {
      return;
    }

    console.debug(`Running populations`);
    for (const populateFn of this.populateFns) {
      await populateFn(
        db,
        this.dbPopulateData.oldVersion,
        this.dbPopulateData.newVersion,
      );
    }
  }
}

export type DbMigrationFn = NonNullable<OpenDBCallbacks<GcDbSchema>['upgrade']>;

export type DbPopulateFn = (
  db: IDBPDatabase<GcDbSchema>,
  oldVersion: number,
  newVersion: number | null,
) => void | Promise<void>;

export enum BooleanNumber {
  False,
  True,
}

export enum TextRange {
  Upper = '\uFFFF',
}
