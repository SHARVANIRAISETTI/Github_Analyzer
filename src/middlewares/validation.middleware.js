import { ZodError } from 'zod';
import AppError from '../utils/AppError.js';

/**
 * Generic validation middleware using Zod
 * @param {Object} schema - Zod schema object containing body, query, and/or params
 */
export const validate = (schema) => (req, res, next) => {
  try {
    if (schema.params) {
      req.params = schema.params.parse(req.params);
    }
    if (schema.query) {
      req.query = schema.query.parse(req.query);
    }
    if (schema.body) {
      req.body = schema.body.parse(req.body);
    }
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: formattedErrors
      });
    }
    next(new AppError('Internal validation error', 500));
  }
};
