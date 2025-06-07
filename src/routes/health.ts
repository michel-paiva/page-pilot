import { FastifyPluginAsync } from 'fastify';

const healthRoute: FastifyPluginAsync = async fastify => {
  fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });
};

export default healthRoute;
