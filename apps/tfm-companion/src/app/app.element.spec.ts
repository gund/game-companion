import { TfmAppElement } from './app.element';

describe('AppElement', () => {
  let app: TfmAppElement;

  beforeEach(() => {
    app = new TfmAppElement();
  });

  it('should create successfully', () => {
    expect(app).toBeTruthy();
  });
});
