import express from 'express';
import { z } from 'zod';
import { analyzeProfile, getProfiles, getProfile } from '../controllers/profile.controller.js';
import { validate } from '../middlewares/validation.middleware.js';

const router = express.Router();

// Validation Schemas
const usernameParamsSchema = z.object({
  username: z.string().min(1, 'Username is required').max(39, 'Username is too long')
});

const queryFiltersSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
  sortBy: z.enum(['profile_score', 'public_repos', 'followers', 'created_at', 'repo_velocity', 'engagement_rate']).optional(),
  order: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional(),
  language: z.string().optional()
});

/**
 * @swagger
 * /profiles:
 *   get:
 *     summary: Retrieve a list of analyzed GitHub profiles
 *     description: Retrieve profiles with pagination, sorting, and filtering capabilities.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [profile_score, public_repos, followers, created_at, repo_velocity, engagement_rate]
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter by top_language
 *     responses:
 *       200:
 *         description: A list of profiles
 */
router.get(
  '/',
  validate({ query: queryFiltersSchema }),
  getProfiles
);

/**
 * @swagger
 * /profiles/{username}:
 *   post:
 *     summary: Analyze and Upsert a GitHub Profile
 *     description: Fetches GitHub profile data concurrently, calculates advanced metrics, and upserts into the database. Checks 12-hour local cache first.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: GitHub username to analyze
 *     responses:
 *       200:
 *         description: Successfully returned cached profile
 *       201:
 *         description: Successfully fetched, analyzed and created/updated profile
 *       404:
 *         description: GitHub user not found
 *       429:
 *         description: GitHub API rate limit exceeded
 */
router.post(
  '/:username',
  validate({ params: usernameParamsSchema }),
  analyzeProfile
);

/**
 * @swagger
 * /profiles/{username}:
 *   get:
 *     summary: Get a local analyzed profile
 *     description: Retrieves profile from the database without querying GitHub API.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: GitHub username
 *     responses:
 *       200:
 *         description: Profile object
 *       404:
 *         description: Profile has not been analyzed yet
 */
router.get(
  '/:username',
  validate({ params: usernameParamsSchema }),
  getProfile
);

export default router;
