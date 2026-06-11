import app from './src/app.js';
import { env } from './src/config/env.config.js';
import pool from './src/config/db.config.js';
import logger from './src/utils/logger.js';

// Handle uncaught exceptions globally
process.on('uncaughtException', err => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
  process.exit(1);
});

const startServer = async () => {
  try {
    // Verify database connection before starting the server
    await pool.query('SELECT 1');
    logger.info('MySQL Database connected successfully');

    const port = env.PORT || 3000;
    const server = app.listen(port, () => {
      logger.info(`App running on port ${port} in ${env.NODE_ENV} mode.`);
      logger.info(`Swagger UI available at http://localhost:${port}/api-docs`);
    });

    // Handle unhandled promise rejections globally
    process.on('unhandledRejection', err => {
      logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
      server.close(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
