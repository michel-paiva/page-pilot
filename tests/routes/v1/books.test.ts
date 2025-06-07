import build from '../../../src/app';
import { randomUUID } from 'crypto';
import { setupDb } from '../../setup';

describe('Book Routes', () => {
    it('should create a book', async () => {
        const app = build();

        const authorResponse = await app.inject({
            method: 'POST',
            url: '/v1/authors',
            payload: {
                name: 'John Doe',
                bio: 'A famous author',
                birthYear: 1990
            }
        });

        const authorId = authorResponse.json().id;

        const response = await app.inject({
            method: 'POST',
            url: '/v1/books',
            payload: {
                title: 'The Great Book',
                summary: 'An amazing story',
                publicationYear: 2023,
                authorId: authorId
            }
        });

        expect(response.statusCode).toBe(201);
        expect(response.json()).toEqual({
            id: expect.any(String),
            title: 'The Great Book',
            summary: 'An amazing story',
            coverUrl: null,
            publicationYear: 2023,
            authorId: authorId,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
        });

        await app.close();
    });

    it('should return validation error if the create request is invalid', async () => {
        const app = build();

        const response = await app.inject({
            method: 'POST',
            url: '/v1/books',
            payload: {
                title: 'The Great Book'
            }
        });

        expect(response.statusCode).toBe(422);
        expect(response.json().error).toEqual("Validation error");
        expect(response.json().statusCode).toEqual(422);

        await app.close();
    });

    it('should return book by id', async () => {
        const app = build();

        const authorResponse = await app.inject({
            method: 'POST',
            url: '/v1/authors',
            payload: {
                name: 'John Doe',
                bio: 'A famous author',
                birthYear: 1990
            }
        });

        const authorId = authorResponse.json().id;

        const responsePost = await app.inject({
            method: 'POST',
            url: '/v1/books',
            payload: {
                title: 'The Great Book',
                summary: 'An amazing story',
                publicationYear: 2023,
                authorId: authorId
            }
        });

        expect(responsePost.statusCode).toBe(201);

        const bookId = responsePost.json().id;

        const responseGet = await app.inject({
            method: 'GET',
            url: `/v1/books/${bookId}`
        });

        expect(responseGet.statusCode).toBe(200);
        expect(responseGet.json()).toEqual({
            id: bookId,
            title: 'The Great Book',
            summary: 'An amazing story',
            publicationYear: 2023,
            coverUrl: null,
            authorId: authorId,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
        });

        await app.close();
    });

    it('should return 404 if the book does not exist', async () => {
        const app = build();

        const response = await app.inject({
            method: 'GET',
            url: `/v1/books/${randomUUID()}`
        });

        expect(response.statusCode).toBe(404);
        expect(response.json().error).toEqual("Book not found");
        expect(response.json().statusCode).toEqual(404);

        await app.close();
    });

    it('should return all books and paginate them', async () => {
        setupDb('file:./test-list-books.testdb');
        const app = build();

        const authorResponse = await app.inject({
            method: 'POST',
            url: '/v1/authors',
            payload: {
                name: 'John Doe',
                bio: 'A famous author',
                birthYear: 1990
            }
        });

        const authorId = authorResponse.json().id;

        for (let i = 0; i < 10; i++) {
            await app.inject({
                method: 'POST',
                url: '/v1/books',
                payload: {
                    title: `Book ${i}`,
                    summary: `Summary ${i}`,
                    publicationYear: 2020 + i,
                    authorId: authorId
                }
            });
        }

        const response = await app.inject({
            method: 'GET',
            url: '/v1/books?page=1&limit=3'
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().data.length).toBe(3);
        expect(response.json().meta.total).toBe(10);
        expect(response.json().meta.page).toBe(1);
        expect(response.json().meta.totalPages).toBe(4);

        const response2 = await app.inject({
            method: 'GET',
            url: '/v1/books?page=4&limit=3'
        });

        expect(response2.statusCode).toBe(200);
        expect(response2.json().data.length).toBe(1);
        expect(response2.json().meta.total).toBe(10);
        expect(response2.json().meta.page).toBe(4);
        expect(response2.json().meta.totalPages).toBe(4);

        await app.close();
    });

    it('should delete book', async () => {
        const app = build();

        const authorResponse = await app.inject({
            method: 'POST',
            url: '/v1/authors',
            payload: {
                name: 'John Doe',
                bio: 'A famous author',
                birthYear: 1990
            }
        });

        const authorId = authorResponse.json().id;

        const responsePost = await app.inject({
            method: 'POST',
            url: '/v1/books',
            payload: {
                title: 'The Great Book',
                summary: 'An amazing story',
                publicationYear: 2023,
                authorId: authorId
            }
        });

        expect(responsePost.statusCode).toBe(201);

        const bookId = responsePost.json().id;

        const responseDelete = await app.inject({
            method: 'DELETE',
            url: `/v1/books/${bookId}`
        });

        expect(responseDelete.statusCode).toBe(204);

        const responseGet = await app.inject({
            method: 'GET',
            url: `/v1/books/${bookId}`
        });

        expect(responseGet.statusCode).toBe(404);

        await app.close();
    });

    it('should update book', async () => {
        const app = build();

        const authorResponse = await app.inject({
            method: 'POST',
            url: '/v1/authors',
            payload: {
                name: 'John Doe',
                bio: 'A famous author',
                birthYear: 1990
            }
        });

        const authorId = authorResponse.json().id;

        const responsePost = await app.inject({
            method: 'POST',
            url: '/v1/books',
            payload: {
                title: 'The Great Book',
                summary: 'An amazing story',
                publicationYear: 2023,
                authorId: authorId
            }
        });

        expect(responsePost.statusCode).toBe(201);

        const bookId = responsePost.json().id;

        const responseUpdate = await app.inject({
            method: 'PUT',
            url: `/v1/books/${bookId}`,
            payload: {
                title: 'The Updated Book',
                summary: 'An even better story',
                publicationYear: 2024,
                authorId: authorId
            }
        });

        expect(responseUpdate.statusCode).toBe(200);
        expect(responseUpdate.json()).toEqual({
            id: bookId,
            title: 'The Updated Book',
            summary: 'An even better story',
            publicationYear: 2024,
            coverUrl: null,
            authorId: authorId,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
        });
        
        await app.close();
    });

    it('should return validation error if the update request is invalid', async () => {
        const app = build();

        const authorResponse = await app.inject({
            method: 'POST',
            url: '/v1/authors',
            payload: {
                name: 'John Doe',
                bio: 'A famous author',
                birthYear: 1990
            }
        });

        const authorId = authorResponse.json().id;

        const responsePost = await app.inject({
            method: 'POST',
            url: '/v1/books',
            payload: {
                title: 'The Great Book',
                summary: 'An amazing story',
                publicationYear: 2023,
                authorId: authorId
            }
        });

        expect(responsePost.statusCode).toBe(201);

        const bookId = responsePost.json().id;

        const responseUpdate = await app.inject({
            method: 'PUT',
            url: `/v1/books/${bookId}`,
            payload: {
                title: 'The Updated Book'
            }
        });

        expect(responseUpdate.statusCode).toBe(422);
        expect(responseUpdate.json().error).toEqual("Validation error");
        expect(responseUpdate.json().statusCode).toEqual(422);

        await app.close();
    });

    it('should return error when creating a book with non-existent author', async () => {
        const app = build();

        const response = await app.inject({
            method: 'POST',
            url: '/v1/books',
            payload: {
                title: 'The Great Book',
                summary: 'An amazing story',
                publicationYear: 2023,
                authorId: randomUUID(),
            }
        });

        expect(response.statusCode).toBe(404);
        expect(response.json().error).toEqual("Author not found");
        expect(response.json().statusCode).toEqual(404);

        await app.close();
    });

    it('should return error when updating a book with non-existent author', async () => {
        const app = build();

        const authorResponse = await app.inject({
            method: 'POST',
            url: '/v1/authors',
            payload: {
                name: 'John Doe',
                bio: 'A famous author',
                birthYear: 1990
            }
        });

        const authorId = authorResponse.json().id;

        const responsePost = await app.inject({
            method: 'POST',
            url: '/v1/books',
            payload: {
                title: 'The Great Book',
                summary: 'An amazing story',
                publicationYear: 2023,
                authorId: authorId
            }
        });

        const bookId = responsePost.json().id;

        const response = await app.inject({
            method: 'PUT',
            url: `/v1/books/${bookId}`,
            payload: {
                title: 'The not so Great Book',
                summary: 'An not so amazing story',
                publicationYear: 2022,
                authorId: randomUUID()
            }
        });

        expect(response.statusCode).toBe(404);
        expect(response.json().error).toEqual("Author not found");
        expect(response.json().statusCode).toEqual(404);

        await app.close();
    });
}); 