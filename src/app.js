import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import routes from './routes/index.js';
import { globalErrorHandler } from './middlewares/error.middleware.js';
import { apiLimiter } from './middlewares/rateLimiter.middleware.js';
import swaggerSpec from './config/swagger.config.js';
import AppError from './utils/AppError.js';

const app = express();

// 1. GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Implement CORS
app.use(cors());

// Limit requests from same API
app.use('/api', apiLimiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

import { swaggerHtml } from './config/swagger.config.js';

// 2. Swagger Documentation (Serverless HTML Bypass)
app.get('/api-docs', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(swaggerHtml);
});

// 3. ROUTES
app.use('/api/v1', routes);

// Handle unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 4. GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

export default app;
