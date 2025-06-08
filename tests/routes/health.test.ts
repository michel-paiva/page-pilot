import build from '../../src/app';

describe('Health Route', () => {
    it('should return 200 on /health', async () => {
        const app = build();

        const response = await app.inject({
            method: 'GET',
            url: '/health'
        });

        expect(response.statusCode).toBe(200);
        const payload = JSON.parse(response.payload);
        expect(payload.status).toBe('ok');
        expect(payload).toHaveProperty('timestamp');
    });
}); 