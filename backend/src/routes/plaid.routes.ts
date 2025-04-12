import { Router } from 'express';
import { PlaidController } from '../controllers/plaid.controller';

const router = Router();

// Create a link token for the client
router.post('/link/token/create', PlaidController.createLinkToken);

// Exchange public token for access token
router.post('/item/public_token/exchange', PlaidController.exchangePublicToken);

// Get transactions
router.post('/transactions/sync', PlaidController.getTransactions);

// Refresh transactions
router.post('/transactions/refresh', PlaidController.refreshTransactions);

// Handle Plaid webhooks
router.post('/webhook/plaid', PlaidController.handleWebhook);

export default router; 