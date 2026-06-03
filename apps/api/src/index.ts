import 'dotenv/config';
import { createApp } from './app';
import { prisma } from './config/database';
import { vectorStore } from './services/vector-store.service';
import { config } from './config';
import { logger } from './utils/logger';

async function bootstrap() {
  await prisma.$connect();
  logger.info('Database connected');

  await vectorStore.init();

  const app = createApp();

  const server = app.listen(config.port, () => {
    logger.info(`API running on port ${config.port} [${config.env}]`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Database disconnected');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Bootstrap failed', { error: err });
  process.exit(1);
});