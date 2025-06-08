import { FastifyInstance } from 'fastify';
import Redis from 'ioredis';
import { fetchAndUpdateBookCover } from '../services/cover';

const COVER_CHANNEL = 'book-cover-fetch';

export async function startBookSubscriber(logger: FastifyInstance['log']) {
  if (process.env.BOOK_SUBSCRIBER_ENABLED !== 'true') {
    logger.info('Cover service is disabled');
    return;
  }

  const subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

  void subscriber.subscribe(COVER_CHANNEL, err => {
    if (err) {
      logger.error('Failed to subscribe to Redis channel:', err);
      return;
    }
    logger.info('Subscribed to Redis channel:', COVER_CHANNEL);
  });

  subscriber.on('message', (channel, message) => {
    if (channel === COVER_CHANNEL) {
      try {
        const bookData = JSON.parse(message) as { id: string; title: string };
        void fetchAndUpdateBookCover(bookData, logger);
      } catch (error) {
        logger.error('Error processing message:', error);
      }
    }
  });
}

export async function publishBookCoverRequest(bookId: string, title: string) {
  if (process.env.BOOK_SUBSCRIBER_ENABLED !== 'true') {
    return;
  }

  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

  try {
    const message = JSON.stringify({ id: bookId, title });
    await redis.publish(COVER_CHANNEL, message);
  } catch (error) {
    console.error('Error publishing message:', error);
  }

  void redis.quit();
}
