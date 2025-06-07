import { randomUUID } from 'crypto';
import build from '../../../src/app';
import { FastifyInstance } from 'fastify';

const getToken = async (app: FastifyInstance, emailPrefix: string) => {
    const userResponse = await app.inject({
        method: 'POST',
        url: '/v1/users',
        payload: {
            email: `${emailPrefix}test@example.com`,
            password: 'password123',
            passwordConfirmation: 'password123',
            name: 'Test User',
        }
    });

    expect(userResponse.statusCode).toBe(201);
    const user = userResponse.json();

    const tokenResponse = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
            email: user.email,
            password: 'password123',
        }
    });

    expect(tokenResponse.statusCode).toBe(200);
    const token = tokenResponse.json().token;

    return token;
}

const createBook = async (app: FastifyInstance) => {
    const authorResponse = await app.inject({
        method: 'POST',
        url: '/v1/authors',
        payload: {
            name: 'Test Author',
            bio: 'Test Bio',
            birthYear: 1990,
        }
    });

    expect(authorResponse.statusCode).toBe(201);
    const author = authorResponse.json();

    const response = await app.inject({
        method: 'POST',
        url: '/v1/books',
        payload: {
            title: 'Test Book',
            summary: 'Test Summary',
            publicationYear: 2024,
            authorId: author.id,
        }
    });

    expect(response.statusCode).toBe(201);
    return response.json().id;
}

describe('Favorites Routes', () => {
    it('should fail to create if book does not exist', async () => {
        const app = await build();

        const token = await getToken(app, 'failcreatefavorite');

        const response = await app.inject({
            method: 'POST',
            url: '/v1/favorites',
            payload: {
                bookId: randomUUID(),
            },
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        expect(response.statusCode).toBe(404);
    });

    it('should create a favorite', async () => {
        const app = await build();

        const token = await getToken(app, 'createfavorite');

        const bookId = await createBook(app);

        const response = await app.inject({
            method: 'POST',
            url: '/v1/favorites',
            payload: {
                bookId,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        expect(response.statusCode).toBe(201);
    });

    it('should fail to create if book is already favorited', async () => {
        const app = await build();

        const token = await getToken(app, 'doublecreatefavorite');

        const bookId = await createBook(app);

        const response = await app.inject({
            method: 'POST',
            url: '/v1/favorites',
            payload: {
                bookId,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        expect(response.statusCode).toBe(201);

        const response2 = await app.inject({
            method: 'POST',
            url: '/v1/favorites',
            payload: {
                bookId,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        expect(response2.statusCode).toBe(400);
    });

    it('should scope favorites to the user', async () => {
        const app = await build();

        const token = await getToken(app, 'scopefavorites1');

        const bookId = await createBook(app);

        const response = await app.inject({
            method: 'POST',
            url: '/v1/favorites',
            payload: {
                bookId,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        expect(response.statusCode).toBe(201);

        const token2 = await getToken(app, 'scopefavorites2');

        const response2 = await app.inject({
            method: 'GET',
            url: '/v1/favorites',
            headers: {
                Authorization: `Bearer ${token2}`,
            }
        });

        expect(response2.statusCode).toBe(200);
        const response2Body = response2.json();
        expect(response2Body.data).toEqual([]);
        expect(response2Body.meta.total).toBe(0);

        const response3 = await app.inject({
            method: 'GET',
            url: '/v1/favorites',
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        expect(response3.statusCode).toBe(200);
        const response3Body = response3.json();
        expect(response3Body.meta.total).toBe(1);
    });

    it('should delete a favorite', async () => {
        const app = await build();

        const token = await getToken(app, 'deletefavorite');

        const bookId = await createBook(app);

        const response = await app.inject({
            method: 'POST',
            url: '/v1/favorites',
            payload: {
                bookId,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        expect(response.statusCode).toBe(201);
        
        const listResponse = await app.inject({
            method: 'GET',
            url: '/v1/favorites',
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        expect(listResponse.statusCode).toBe(200);
        const listResponseBody = listResponse.json();
        expect(listResponseBody.meta.total).toBe(1);

        const deleteResponse = await app.inject({
            method: 'DELETE',
            url: `/v1/favorites/${response.json().id}`,
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        expect(deleteResponse.statusCode).toBe(204);

        const listResponse2 = await app.inject({
            method: 'GET',
            url: '/v1/favorites',
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        expect(listResponse2.statusCode).toBe(200);
        const listResponse2Body = listResponse2.json();
        expect(listResponse2Body.meta.total).toBe(0);
    });
});