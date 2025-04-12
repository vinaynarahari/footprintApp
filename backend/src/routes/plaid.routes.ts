import { Router } from 'express';
import { createLinkToken, exchangePublicToken } from '../controllers/plaid.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/create-link-token', authenticate, createLinkToken);
router.post('/exchange-token', authenticate, exchangePublicToken);

export default router; 