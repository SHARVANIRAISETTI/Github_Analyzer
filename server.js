import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './src/app.js';
import { env } from './src/config/env.config.js';
import pool from './src/config/db.config.js';
import logger from './src/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Handle uncaught exceptions globally
process.on('uncaughtException', err => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
  process.exit(1);
});

const initializeDatabase = async () => {
  try {
    const schemaPath = path.join(__dirname, 'src', 'models', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon to execute queries individually if needed, 
    // or execute it directly if the mysql driver allows multiple statements.
    // We'll just run the CREATE TABLE which is a single statement in our schema.
    await pool.query(schemaSql);
    logger.info('Database schema verified/initialized successfully.');
  } catch (err) {
    logger.error('Failed to initialize database schema:', err);
    throw err;
  }
};

const startServer = async () => {
  try {
    // Verify database connection before starting the server
    await pool.query('SELECT 1');
    logger.info('MySQL Database connected successfully');
    
    // Initialize schema
    await initializeDatabase();

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
