import { GameAppElement } from './app.element';

describe('AppElement', () => {
  let app: GameAppElement;

  beforeEach(() => {
    app = new GameAppElement();
  });

  it('should create successfully', () => {
    expect(app).toBeTruthy();
  });
});
