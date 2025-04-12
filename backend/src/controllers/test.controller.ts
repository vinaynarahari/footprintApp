import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const testEndpoint = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Test database connection
    const dbResult = await pool.query('SELECT NOW()');
    
    // Get user info if authenticated
    const userInfo = req.user ? { userId: req.user.userId } : null;

    res.json({
      status: 'success',
      message: 'Backend is working correctly',
      timestamp: dbResult.rows[0].now,
      user: userInfo,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    next(new AppError('Error testing backend services', 500));
  }
}; 