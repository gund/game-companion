/* eslint-disable @typescript-eslint/no-explicit-any */
import { BooleanNumber, DbService, TextRange } from './db.service.js';
import type { Player } from './player.model.js';
import type { Session } from './session.model.js';

declare global {
  interface GcDbSchema {
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
}

export class SessionsService {
  constructor(private dbService: DbService) {
    this.initDb();
  }

  private initDb() {
    this.dbService.addMigration(1, (db) => {
      const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id' });
      sessionsStore.createIndex('isActive', 'isActive');
      sessionsStore.createIndex('createdAt', 'createdAt');
      sessionsStore.createIndex('isActive-createdAt', [
        'isActive',
        'createdAt',
      ]);
    });
  }

  async getActive(): Promise<Session[]> {
    const db = await this.dbService.getDb();

    const iter = db
      .transaction('sessions', 'readonly')
      .store.index('isActive-createdAt')
      .iterate(
        IDBKeyRange.bound(
          [BooleanNumber.False, TextRange.Upper],
          [BooleanNumber.True, TextRange.Upper],
        ),
        'prev',
      );

    const sessions: Session[] = [];

    for await (const cursor of iter) {
      sessions.push(cursor.value);
    }

    return sessions.map((s) => this.deserializeSession(s));
  }

  async getInactive(): Promise<Session[]> {
    const db = await this.dbService.getDb();

    const sessions = await db.getAllFromIndex(
      'sessions',
      'isActive',
      BooleanNumber.False,
    );

    return sessions.map((s) => this.deserializeSession(s));
  }

  async getById(sId: string): Promise<Session> {
    const { session } = await this.findByIdTx(sId);

    return this.deserializeSession(session);
  }

  async createSession(data: CreateSessionData): Promise<Session> {
    if (data.players.length === 0) {
      throw new Error(`A session cannot exist without any players!`);
    }

    if (data.players.some((player) => player.name === '')) {
      throw new Error(`Some players have no name!`);
    }

    const session: Session = {
      id: this.genId(),
      isActive: true,
      createdAt: new Date(),
      players: data.players,
    };

    const db = await this.dbService.getDb();

    await db.put('sessions', this.serializeSession(session));

    return session;
  }

  async updatePlayer(sId: string, player: Player): Promise<Player> {
    const { session, tx } = await this.findByIdTx(sId, 'readwrite');

    session.players = session.players.map((p) =>
      p.id === player.id ? player : p,
    );

    await tx.store.put(this.serializeSession(session));

    return player;
  }

  async finishSesssion(sId: string): Promise<Session> {
    const { session, tx } = await this.findByIdTx(sId, 'readwrite');

    session.isActive = false;

    await tx.store.put(this.serializeSession(session));

    return session;
  }

  genId() {
    return String(Math.ceil(Math.random() * 1000000));
  }

  private async findByIdTx<M extends IDBTransactionMode = 'readonly'>(
    sId: string,
    mode: M = 'readonly' as any,
  ) {
    const db = await this.dbService.getDb();
    const tx = db.transaction('sessions', mode);

    const session = await tx.store.get(sId);

    if (!session) {
      throw new Error(`Session with ID ${sId} was not found!`);
    }

    return { session, tx };
  }

  private deserializeSession(session: Session): Session {
    return {
      ...session,
      isActive: (session.isActive as any) === BooleanNumber.True ? true : false,
    };
  }

  private serializeSession(session: Session): Session {
    return {
      ...session,
      isActive: (session.isActive
        ? BooleanNumber.True
        : BooleanNumber.False) as any,
    };
  }
}

export interface CreateSessionData {
  players: Player[];
}
