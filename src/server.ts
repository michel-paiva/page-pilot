import build from './app';

const start = async () => {
  try {
    const server = build({
      logger: {
        level: 'info',
      },
    });
    await server.listen({ port: 3000, host: '0.0.0.0' });
    server.log.info(`Server is running on ${JSON.stringify(server.server.address())}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

void start();
