import type { Session } from './session.model.js';

export class SessionHelper {
  constructor(
    private timeFormatter = new Intl.RelativeTimeFormat('en', {
      style: 'short',
      numeric: 'auto',
    })
  ) {}

  getName(session: Session) {
    return `Session with ${session.players.length} people`;
  }

  formatSince(session: Session) {
    const today = new Date();
    const diffTime = session.createdAt.getTime() - today.getTime();
    let diff = diffTime / 1000 / 60 / 60 / 24;
    let unit: Intl.RelativeTimeFormatUnit = 'days';

    if (diff > -1) {
      diff *= 24;
      unit = 'hours';
    }

    if (diff > -1) {
      diff *= 60;
      unit = 'minutes';
    }

    if (diff > -1) {
      diff *= 60;
      unit = 'seconds';
    }

    return this.timeFormatter.format(Math.round(diff), unit);
  }
}
