# Page Pilot

[![Tests](https://github.com/michel-paiva/page-pilot/actions/workflows/test.yml/badge.svg)](https://github.com/michel-paiva/page-pilot/actions/workflows/test.yml)

A modern web application for managing books and authors, built with Fastify, Prisma, and TypeScript.

## Features

- 📚 Book management (CRUD operations)
- 👥 Author management (CRUD operations)
- ❤️ User favorites management (Authentication required)
- 🔍 Book cover fetching from Open Library and Google Books (async)
- 🔐 JWT-based authentication
- 🧪 Comprehensive test suite
- 📝 API documentation with Swagger

## Tech Stack

- **Backend**: Fastify, TypeScript, Prisma, Zod
- **Database**: SQLite
- **Message Queue**: Redis (as a plus if running on docker covers are added asynchronously if found on google books or open library)
- **Testing**: Jest
- **Documentation**: Swagger/OpenAPI
- **Container**: Docker

## Prerequisites

- Node.js (v18 or higher)
- pnpm
- Docker and Docker Compose (for Docker setup)

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/michel-paiva/page-pilot.git
   cd page-pilot
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration. (if needed)

4. Bootstrap the development environment

   ```bash
   pnpm bootstrap:dev
   ```

5. Choose your setup method:

   ### Local Development

   ```bash
   # Start the development server
   pnpm dev
   ```

   ### Docker Development

   ```bash
   # Start the containers
   docker-compose up -d
   
   # Bootstrap the development environment inside the container since the host machine OS might differ from docker
   docker-compose exec app pnpm bootstrap:dev && docker-compose restart app
   ```

## Running Ports

- **API**: 3000
- **Redis**: 6379

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints:

1. Register a new user at `POST /v1/users`
2. Login at `POST /v1/auth/login`
3. Use the returned token in the `Authorization` header:

   ```text
   Authorization: Bearer <your-token>
   ```

## Available Resources

### Books

- `GET /v1/books` - List all books
- `GET /v1/books/:id` - Get book details
- `POST /v1/books` - Create a new book
- `PUT /v1/books/:id` - Update a book
- `DELETE /v1/books/:id` - Delete a book

### Authors

- `GET /v1/authors` - List all authors
- `GET /v1/authors/:id` - Get author details
- `POST /v1/authors` - Create a new author
- `PUT /v1/authors/:id` - Update an author
- `DELETE /v1/authors/:id` - Delete an author

### Users

- `POST /v1/users` - Register a new user
- `POST /v1/auth/login` - Login

### Favorites

- `GET /v1/favorites` - List user's favorite books
- `POST /v1/favorites` - Add a book to favorites
- `DELETE /v1/favorites/:id` - Remove a book from favorites

## Building

```bash
pnpm build
```

## Testing

```bash
pnpm test
```

## API Documentation

Once the server is running, visit:

- Swagger UI: `http://localhost:3000/documentation`
- OpenAPI JSON: `http://localhost:3000/documentation/json`
