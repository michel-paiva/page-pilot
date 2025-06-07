import build from '../../../src/app';
import { randomUUID } from 'crypto';
import { setupDb } from '../../setup';

describe('Author Routes', () => {
    it('should create an author', async () => {
        const app = build();

        const response = await app.inject({
            method: 'POST',
            url: '/v1/authors',
            payload: {
                name: 'John Doe',
                bio: 'A famous author',
                birthYear: 1990
            }
        });

        expect(response.statusCode).toBe(201);
        expect(response.json()).toEqual({
            id: expect.any(String),
            name: 'John Doe',
            bio: 'A famous author',
            birthYear: 1990,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
        });

        await app.close();
    });

    it('should return validation error if the create request is invalid', async () => {
        const app = build();

        const response = await app.inject({
            method: 'POST',
            url: '/v1/authors',
            payload: {
                name: 'John Doe'
            }
        });

        expect(response.statusCode).toBe(422);
        expect(response.json().error).toEqual("Validation error");
        expect(response.json().statusCode).toEqual(422);

        await app.close();
    });

    it('should return author by id', async () => {
        const app = build();

        const responsePost = await app.inject({
            method: 'POST',
            url: '/v1/authors',
            payload: {
                name: 'John Doe',
                bio: 'A famous author',
                birthYear: 1990
            }
        });

        expect(responsePost.statusCode).toBe(201);

        const authorId = responsePost.json().id;

        const responseGet = await app.inject({
            method: 'GET',
            url: `/v1/authors/${authorId}`
        });

        expect(responseGet.statusCode).toBe(200);
        expect(responseGet.json()).toEqual({
            id: authorId,
            name: 'John Doe',
            bio: 'A famous author',
            birthYear: 1990,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
        });

        await app.close();
    });

    it('should return 404 if the author does not exist', async () => {
        const app = build();

        const response = await app.inject({
            method: 'GET',
            url: `/v1/authors/${randomUUID()}`
        });

        expect(response.statusCode).toBe(404);
        expect(response.json().error).toEqual("Author not found");
        expect(response.json().statusCode).toEqual(404);

        await app.close();
    });

    it('should return all authors and paginate them', async () => {
        setupDb('file:./test-list-authors.testdb');
        const app = build();

        for (let i = 0; i < 10; i++) {
            await app.inject({
                method: 'POST',
                url: '/v1/authors',
                payload: {
                    name: `Author ${i}`,
                    bio: `Bio ${i}`,
                    birthYear: 1990 + i
                }
            });
        }

        const response = await app.inject({
            method: 'GET',
            url: '/v1/authors?page=1&limit=3'
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().data.length).toBe(3);
        expect(response.json().meta.total).toBe(10);
        expect(response.json().meta.page).toBe(1);
        expect(response.json().meta.totalPages).toBe(4);

        const response2 = await app.inject({
            method: 'GET',
            url: '/v1/authors?page=4&limit=3'
        });

        expect(response2.statusCode).toBe(200);
        expect(response2.json().data.length).toBe(1);
        expect(response2.json().meta.total).toBe(10);
        expect(response2.json().meta.page).toBe(4);
        expect(response2.json().meta.totalPages).toBe(4);

        await app.close();
    });

    it('should return delete author', async () => {
        const app = build();

        const responsePost = await app.inject({
            method: 'POST',
            url: '/v1/authors',
            payload: {
                name: 'John Doe',
                bio: 'A famous author',
                birthYear: 1990
            }
        });

        expect(responsePost.statusCode).toBe(201);

        const authorId = responsePost.json().id;

        const responseDelete = await app.inject({
            method: 'DELETE',
            url: `/v1/authors/${authorId}`
        });

        expect(responseDelete.statusCode).toBe(204);

        const responseGet = await app.inject({
            method: 'GET',
            url: `/v1/authors/${authorId}`
        });

        expect(responseGet.statusCode).toBe(404);

        await app.close();
    });

    it('should return update author', async () => {
        const app = build();

        const responsePost = await app.inject({
            method: 'POST',
            url: '/v1/authors',
            payload: {
                name: 'John Doe',
                bio: 'A famous author',
                birthYear: 1990
            }
        });

        expect(responsePost.statusCode).toBe(201);

        const authorId = responsePost.json().id;

        const responseUpdate = await app.inject({
            method: 'PUT',
            url: `/v1/authors/${authorId}`,
            payload: {
                name: 'Jane Doe',
                bio: 'Even more famous author',
                birthYear: 1990
            }
        });

        expect(responseUpdate.statusCode).toBe(200);
        expect(responseUpdate.json()).toEqual({
            id: authorId,
            name: 'Jane Doe',
            bio: 'Even more famous author',
            birthYear: 1990,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
        });
        
        await app.close();
    });

    it('should return validation error if the update request is invalid', async () => {
        const app = build();

        const responsePost = await app.inject({
            method: 'POST',
            url: '/v1/authors',
            payload: {
                name: 'John Doe',
                bio: 'A famous author',
                birthYear: 1990
            }
        });

        expect(responsePost.statusCode).toBe(201);

        const authorId = responsePost.json().id;

        const responseUpdate = await app.inject({
            method: 'PUT',
            url: `/v1/authors/${authorId}`,
            payload: {
                name: 'Jane Doe',
            }
        });

        expect(responseUpdate.statusCode).toBe(422);
        expect(responseUpdate.json().error).toEqual("Validation error");
        expect(responseUpdate.json().statusCode).toEqual(422);

        await app.close();
    });

    it('should list books by author', async () => {
        const app = build();

        const responsePost = await app.inject({
            method: 'POST',
            url: '/v1/authors',
            payload: {
                name: 'John Doe',
                bio: 'A famous author',
                birthYear: 1990
            }
        });

        expect(responsePost.statusCode).toBe(201);

        const authorId = responsePost.json().id;
        
        const responsePostBook = await app.inject({
            method: 'POST',
            url: '/v1/books',
            payload: {
                title: 'Book 1',
                summary: 'A famous book',
                publicationYear: 2020,
                authorId: authorId,
            }
        });

        expect(responsePostBook.statusCode).toBe(201);

        const responseGetBooks = await app.inject({
            method: 'GET',
            url: `/v1/authors/${authorId}/books`
        });

        expect(responseGetBooks.statusCode).toBe(200);
        expect(responseGetBooks.json().data.length).toBe(1);
        expect(responseGetBooks.json().data[0].title).toBe('Book 1');
        expect(responseGetBooks.json().data[0].authorId).toBe(authorId);

        await app.close();
    });
}); 