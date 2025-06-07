import fastifyAutoload from '@fastify/autoload';
import fastifyCors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import dotenv from 'dotenv';
import fastify, { FastifyReply, FastifyRequest, FastifyServerOptions } from 'fastify';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import path from 'path';

dotenv.config();

const build = (opts: FastifyServerOptions = {}) => {
  const app = fastify(opts).withTypeProvider<ZodTypeProvider>();

  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET as string,
  });

  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  app.register(fastifyCors, {
    origin: '*',
  });

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Page Pilot API',
        version: '1.0.0',
        description: 'API documentation for Page Pilot where you can manage your books and authors',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Main server',
        },
      ],
      tags: [
        { name: 'authors', description: 'Author related endpoints' },
        { name: 'books', description: 'Book related endpoints' },
        { name: 'favorites', description: 'Favorite related endpoints' },
        { name: 'auth', description: 'Authentication related endpoints' },
        { name: 'users', description: 'User related endpoints' },
      ],
      components: {
        securitySchemes: {
          token: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  });

  app.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  app.register(fastifyAutoload, {
    dir: path.join(__dirname, 'routes'),
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.setErrorHandler((error, request, reply) => {
    if (error.code === 'FST_ERR_VALIDATION') {
      let statusCode = error.statusCode ?? 400;

      if (['POST', 'PUT'].includes(request.method)) {
        statusCode = 422;
      }

      reply.status(statusCode).send({
        message: error.message,
        error: 'Validation error',
        statusCode,
      });
    } else {
      reply.send(error);
    }
  });

  return app;
};

export default build;
