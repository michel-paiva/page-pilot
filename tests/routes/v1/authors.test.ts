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
    });

    it('should search authors by name and bio', async () => {
        setupDb('file:./test-search-authors.testdb');
        const app = build();

        await app.inject({
            method: 'POST',
            url: '/v1/authors',
            payload: {
                name: 'J.K. Rowling',
                bio: 'British author of fantasy novels',
                birthYear: 1965
            }
        });

        await app.inject({
            method: 'POST',
            url: '/v1/authors',
            payload: {
                name: 'George R.R. Martin',
                bio: 'American novelist and short story writer',
                birthYear: 1948
            }
        });

        await app.inject({
            method: 'POST',
            url: '/v1/authors',
            payload: {
                name: 'Stephen King',
                bio: 'American author of horror novels',
                birthYear: 1947
            }
        });

        const responseByName = await app.inject({
            method: 'GET',
            url: '/v1/authors?search=Rowling'
        });

        expect(responseByName.statusCode).toBe(200);
        expect(responseByName.json().data.length).toBe(1);
        expect(responseByName.json().data[0].name).toBe('J.K. Rowling');

        const responseByBio = await app.inject({
            method: 'GET',
            url: '/v1/authors?search=horror'
        });

        expect(responseByBio.statusCode).toBe(200);
        expect(responseByBio.json().data.length).toBe(1);
        expect(responseByBio.json().data[0].name).toBe('Stephen King');

        const responseByCommon = await app.inject({
            method: 'GET',
            url: '/v1/authors?search=American'
        });

        expect(responseByCommon.statusCode).toBe(200);
        expect(responseByCommon.json().data.length).toBe(2);
        expect(responseByCommon.json().data.map((author: any) => author.name)).toEqual(
            expect.arrayContaining(['George R.R. Martin', 'Stephen King'])
        );
    });

    it('should list books by author with search', async () => {
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

        expect(authorResponse.statusCode).toBe(201);
        const authorId = authorResponse.json().id;

        const books = [
            {
                title: 'The Great Adventure',
                summary: 'An exciting journey',
                publicationYear: 2023,
                authorId
            },
            {
                title: 'Mystery House',
                summary: 'A thrilling mystery',
                publicationYear: 2023,
                authorId
            },
            {
                title: 'Adventure Time',
                summary: 'A fun story',
                publicationYear: 2023,
                authorId
            }
        ];

        for (const book of books) {
            await app.inject({
                method: 'POST',
                url: '/v1/books',
                payload: book
            });
        }

        const titleSearchResponse = await app.inject({
            method: 'GET',
            url: `/v1/authors/${authorId}/books?search=Adventure`
        });

        expect(titleSearchResponse.statusCode).toBe(200);
        expect(titleSearchResponse.json().data.length).toBe(2);
        expect(titleSearchResponse.json().data.map((book: any) => book.title)).toEqual(
            expect.arrayContaining(['The Great Adventure', 'Adventure Time'])
        );

        const summarySearchResponse = await app.inject({
            method: 'GET',
            url: `/v1/authors/${authorId}/books?search=thrilling`
        });

        expect(summarySearchResponse.statusCode).toBe(200);
        expect(summarySearchResponse.json().data.length).toBe(1);
        expect(summarySearchResponse.json().data[0].title).toBe('Mystery House');

        const noResultsResponse = await app.inject({
            method: 'GET',
            url: `/v1/authors/${authorId}/books?search=nonexistent`
        });

        expect(noResultsResponse.statusCode).toBe(200);
        expect(noResultsResponse.json().data.length).toBe(0);
        expect(noResultsResponse.json().meta.total).toBe(0);
    });

    it('should list books by author with search and pagination', async () => {
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

        expect(authorResponse.statusCode).toBe(201);
        const authorId = authorResponse.json().id;

        for (let i = 0; i < 5; i++) {
            await app.inject({
                method: 'POST',
                url: '/v1/books',
                payload: {
                    title: `Adventure Book ${i}`,
                    summary: `Summary ${i}`,
                    publicationYear: 2023,
                    authorId
                }
            });
        }

        const response = await app.inject({
            method: 'GET',
            url: `/v1/authors/${authorId}/books?search=Adventure&page=1&limit=2`
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().data.length).toBe(2);
        expect(response.json().meta.total).toBe(5);
        expect(response.json().meta.page).toBe(1);
        expect(response.json().meta.totalPages).toBe(3);

        const response2 = await app.inject({
            method: 'GET',
            url: `/v1/authors/${authorId}/books?search=Adventure&page=2&limit=2`
        });

        expect(response2.statusCode).toBe(200);
        expect(response2.json().data.length).toBe(2);
        expect(response2.json().meta.page).toBe(2);
    });
}); 