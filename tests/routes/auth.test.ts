import build from '../../src/app';
import { setupDb } from '../setup';

describe('Auth Routes', () => {
    it('should login successfully with valid credentials', async () => {
        const app = build();

        const userResponse = await app.inject({
            method: 'POST',
            url: '/v1/users',
            payload: {
                email: 'testz@example.com',
                password: 'password123',
                passwordConfirmation: 'password123',
                name: 'Test User'
            }
        });

        expect(userResponse.statusCode).toBe(201);

        const response = await app.inject({
            method: 'POST',
            url: '/auth/login',
            payload: {
                email: 'testz@example.com',
                password: 'password123'
            }
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({
            token: expect.any(String)
        });

        await app.close();
    });

    it('should return 401 with invalid credentials', async () => {
        const app = build();

        const response = await app.inject({
            method: 'POST',
            url: '/auth/login',
            payload: {
                email: 'nonexistent@example.com',
                password: 'wrongpassword'
            }
        });

        expect(response.statusCode).toBe(401);
        expect(response.json()).toEqual({
            error: 'Invalid credentials',
            message: 'Invalid credentials',
            statusCode: 401
        });

        await app.close();
    });

    it('should return validation error with invalid email format', async () => {
        const app = build();

        const response = await app.inject({
            method: 'POST',
            url: '/auth/login',
            payload: {
                email: 'invalid-email',
                password: 'password123'
            }
        });

        expect(response.statusCode).toBe(422);
        expect(response.json().error).toBeDefined();

        await app.close();
    });
}); 