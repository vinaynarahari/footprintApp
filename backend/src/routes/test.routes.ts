import { Router } from 'express';
import { testEndpoint } from '../controllers/test.controller';
import { authenticate } from '../middleware/auth';
import jwt, { SignOptions } from 'jsonwebtoken';

const router = Router();

// Public endpoint
router.get('/public', testEndpoint);

// Protected endpoint (requires authentication)
router.get('/protected', authenticate, testEndpoint);

// Temporary login endpoint for testing
router.post('/login', (req, res) => {
  const userId = 'test-user-123'; // This is just for testing
  const secret = Buffer.from(process.env.JWT_SECRET || 'your_jwt_secret_key_here');
  const options: SignOptions = { expiresIn: '24h' };
  
  const token = jwt.sign({ userId }, secret, options);
  res.json({ token });
});

export default router; 