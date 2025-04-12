import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

interface JwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('Auth headers:', req.headers.authorization);
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      console.log('No token provided in request');
      throw new AppError('No token provided', 401);
    }

    console.log('JWT Secret:', process.env.JWT_SECRET?.substring(0, 10) + '...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    console.log('Decoded token:', decoded);
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    next(new AppError('Invalid token', 401));
  }
}; 