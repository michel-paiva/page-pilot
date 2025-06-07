import build from './app';
import { startBookSubscriber } from './subscribers/book';

const start = async () => {
  try {
    const server = build({
      logger: {
        level: 'info',
      },
    });

    await startBookSubscriber(server.log);

    await server.listen({ port: 3000, host: '0.0.0.0' });
    server.log.info(`Server is running on ${JSON.stringify(server.server.address())}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

void start();
