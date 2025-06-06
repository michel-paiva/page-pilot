import build from '../src/app';

describe('App', () => {
  it('should build the app', async () => {
    const app = await build();
    expect(app).not.toBeNull();
    await app.close();
  });
}); 