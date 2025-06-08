import build from '../src/app';

describe('App', () => {
  it('should build the app', async () => {
    const app = build();
    expect(app).not.toBeNull();
  });
}); 