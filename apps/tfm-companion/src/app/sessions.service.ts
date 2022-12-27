import type { Player, PlayerStatsData } from './player.model';
import type { Session } from './session.model';

const fakeSessions: Session[] = [
  {
    id: '461358',
    isActive: true,
    createdAt: new Date('2022-12-27T20:00:30.848Z'),
    players: [
      { id: '251509', name: 'a', stats: [{ id: 'vps' }] },
      { id: '227272', name: 'b', stats: [{ id: 'vps' }] },
    ],
  },
];

export class SessionsService {
  async getAllActive(): Promise<Session[]> {
    return fakeSessions
      .filter((s) => s.isActive)
      .sort((s1, s2) => s2.createdAt.getTime() - s1.createdAt.getTime());
  }

  async getById(sId: string): Promise<Session> {
    const session = fakeSessions.find((s) => s.id === sId);

    if (!session) {
      throw new Error(`Session with ID ${sId} was not found!`);
    }

    return session;
  }

  async createSession(data: CreateSessionData): Promise<Session> {
    if (data.players.length === 0) {
      throw new Error(`A session cannot exist without any players!`);
    }

    const session: Session = {
      id: this.genId(),
      isActive: true,
      createdAt: new Date(),
      players: data.players,
    };

    fakeSessions.push(session);

    return session;
  }

  async updatePlayer(sId: string, player: Player): Promise<Player> {
    const session = await this.getById(sId);

    session.players = session.players.map((p) =>
      p.id === player.id ? player : p
    );

    return player;
  }

  genId() {
    return String(Math.ceil(Math.random() * 1000000));
  }
}

export interface CreateSessionData {
  players: Player[];
}
