import express from 'express';
import profileRoutes from './profile.routes.js';

const router = express.Router();

router.use('/profiles', profileRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running flawlessly' });
});

export default router;
