import type { Player } from './player.model';
import type { Session } from './session.model';

const fakeSessions: Session[] = [];

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
      id: Math.random().toFixed(6),
      isActive: true,
      createdAt: new Date(),
      players: data.players,
    };

    fakeSessions.push(session);

    return session;
  }
}

export interface CreateSessionData {
  players: Player[];
}
