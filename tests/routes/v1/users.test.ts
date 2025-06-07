import build from '../../../src/app';
import { setupDb } from '../../setup';

describe('User Routes', () => {
    it('should create a new user successfully', async () => {
        const app = build();

        const response = await app.inject({
            method: 'POST',
            url: '/v1/users',
            payload: {
                email: 'test@example.com',
                password: 'password123',
                passwordConfirmation: 'password123',
                name: 'Test User'
            }
        });

        expect(response.statusCode).toBe(201);
        expect(response.json()).toEqual({
            id: expect.any(String),
            email: 'test@example.com',
            name: 'Test User',
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
        });

        await app.close();
    });

    it('should return validation error if password confirmation does not match', async () => {
        const app = build();

        const response = await app.inject({
            method: 'POST',
            url: '/v1/users',
            payload: {
                email: 'test@example.com',
                password: 'password123',
                passwordConfirmation: 'differentpassword',
                name: 'Test User'
            }
        });

        expect(response.statusCode).toBe(422);
        expect(response.json().error).toBeDefined();

        await app.close();
    });

    it('should return validation error if email is invalid', async () => {
        const app = build();

        const response = await app.inject({
            method: 'POST',
            url: '/v1/users',
            payload: {
                email: 'invalid-email',
                password: 'password123',
                passwordConfirmation: 'password123',
                name: 'Test User'
            }
        });

        expect(response.statusCode).toBe(422);
        expect(response.json().error).toBeDefined();

        await app.close();
    });

    it('should return error if user already exists', async () => {
        setupDb('file:./test-user-exists.testdb');
        const app = build();

        const firstResponse = await app.inject({
            method: 'POST',
            url: '/v1/users',
            payload: {
                email: 'test@example.com',
                password: 'password123',
                passwordConfirmation: 'password123',
                name: 'Test User'
            }
        });

        expect(firstResponse.statusCode).toBe(201);

        const secondResponse = await app.inject({
            method: 'POST',
            url: '/v1/users',
            payload: {
                email: 'test@example.com',
                password: 'password123',
                passwordConfirmation: 'password123',
                name: 'Another User'
            }
        });

        expect(secondResponse.statusCode).toBe(400);
        expect(secondResponse.json()).toEqual({
            error: 'User already exists',
            message: 'User already exists',
            statusCode: 400
        });

        await app.close();
    });

    it('should return validation error if required fields are missing', async () => {
        const app = build();

        const response = await app.inject({
            method: 'POST',
            url: '/v1/users',
            payload: {
                email: 'test@example.com'
            }
        });

        expect(response.statusCode).toBe(422);
        expect(response.json().error).toBeDefined();

        await app.close();
    });
}); 