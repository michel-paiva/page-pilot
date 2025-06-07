import axios from 'axios';
import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';
import { BookSearchResult, GoogleBook, OpenLibraryBook } from '../lib/types/cover';

export async function searchOpenLibrary(title: string): Promise<BookSearchResult> {
  try {
    const response = await axios.get<{ docs: OpenLibraryBook[] }>(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`
    );

    const books = response.data.docs;
    if (books && books.length > 0) {
      const bookWithIsbn = books.find(book => book.isbn && book.isbn.length > 0);
      if (bookWithIsbn) {
        const isbn = bookWithIsbn.isbn[0];

        if (bookWithIsbn.cover_i) {
          return {
            isbn,
            coverUrl: `https://covers.openlibrary.org/b/id/${bookWithIsbn.cover_i}-L.jpg`,
          };
        }
        return { isbn, coverUrl: null };
      }
    }
    return { isbn: null, coverUrl: null };
  } catch (error) {
    console.error('Error searching Open Library:', error);
    return { isbn: null, coverUrl: null };
  }
}

export async function searchGoogleBooks(title: string): Promise<BookSearchResult> {
  try {
    const response = await axios.get<{ items: GoogleBook[] }>(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}`
    );

    const books = response.data.items;
    if (books && books.length > 0) {
      const book = books[0];
      const volumeInfo = book.volumeInfo;

      const isbn = volumeInfo.industryIdentifiers?.find(
        id => id.type === 'ISBN_13' || id.type === 'ISBN_10'
      )?.identifier;

      return {
        isbn: isbn || null,
        coverUrl:
          volumeInfo.imageLinks?.extraLarge ||
          volumeInfo.imageLinks?.large ||
          volumeInfo.imageLinks?.thumbnail ||
          null,
      };
    }
    return { isbn: null, coverUrl: null };
  } catch (error) {
    console.error('Error searching Google Books:', error);
    return { isbn: null, coverUrl: null };
  }
}

export async function fetchAndUpdateBookCover(
  bookData: { id: string; title: string },
  logger: FastifyInstance['log']
) {
  try {
    const [openLibraryResult, googleBooksResult] = await Promise.all([
      searchOpenLibrary(bookData.title),
      searchGoogleBooks(bookData.title),
    ]);

    const result =
      openLibraryResult.isbn || openLibraryResult.coverUrl ? openLibraryResult : googleBooksResult;

    if (result.coverUrl) {
      await prisma.book.update({
        where: { id: bookData.id },
        data: { coverUrl: result.coverUrl },
      });
      logger.info(`Updated cover for book ${bookData.id} from direct URL`);
    } else if (result.isbn) {
      const response = await axios.get<
        Record<string, { cover?: { large?: string; medium?: string } }>
      >(`https://openlibrary.org/api/books?bibkeys=ISBN:${result.isbn}&format=json&jscmd=data`);

      const bookInfo = response.data[`ISBN:${result.isbn}`];
      if (bookInfo?.cover) {
        await prisma.book.update({
          where: { id: bookData.id },
          data: { coverUrl: bookInfo.cover.large || bookInfo.cover.medium },
        });
        logger.info(`Updated cover for book ${bookData.id} using ISBN`);
      } else {
        logger.info(`No cover found for book ${bookData.id} with ISBN ${result.isbn}`);
      }
    } else {
      logger.info(`No ISBN or cover found for book ${bookData.id}`);
    }
  } catch (error) {
    logger.error(`Error fetching cover for book ${bookData.id}:`, error);
  }
}
