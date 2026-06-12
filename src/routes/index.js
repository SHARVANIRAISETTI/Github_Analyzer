import express from 'express';
import profileRoutes from './profile.routes.js';
import { swaggerHtml } from '../config/swagger.config.js'; 

const router = express.Router();

router.use('/profiles', profileRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running flawlessly' });
});

// Clean, serverless-proof documentation route
router.get('/docs', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(swaggerHtml);
});

export default router;
