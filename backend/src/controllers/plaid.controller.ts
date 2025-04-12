import { Request, Response } from 'express';
import { PlaidService } from '../services/plaid.service';

interface JwtPayload {
  userId: string;
}

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export class PlaidController {
  static async createLinkToken(req: AuthenticatedRequest, res: Response) {
    try {
      // Temporarily bypass authentication for testing
      const userId = 'test_user_123';
      const response = await PlaidService.createLinkToken(userId);
      res.json(response);
    } catch (error) {
      console.error('Error in createLinkToken:', error);
      res.status(500).json({ error: 'Failed to create link token' });
    }
  }

  static async exchangePublicToken(req: AuthenticatedRequest, res: Response) {
    try {
      const { public_token } = req.body;
      const response = await PlaidService.exchangePublicToken(public_token);
      res.json(response);
    } catch (error) {
      console.error('Error in exchangePublicToken:', error);
      res.status(500).json({ error: 'Failed to exchange public token' });
    }
  }

  static async getTransactions(req: AuthenticatedRequest, res: Response) {
    try {
      const { access_token, cursor } = req.body;
      const response = await PlaidService.getTransactions(access_token, cursor);
      res.json(response);
    } catch (error) {
      console.error('Error in getTransactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }

  static async refreshTransactions(req: AuthenticatedRequest, res: Response) {
    try {
      const { access_token } = req.body;
      const response = await PlaidService.refreshTransactions(access_token);
      res.json(response);
    } catch (error) {
      console.error('Error in refreshTransactions:', error);
      res.status(500).json({ error: 'Failed to refresh transactions' });
    }
  }

  static async handleWebhook(req: Request, res: Response) {
    try {
      const { webhook_type, webhook_code, item_id } = req.body;
      
      if (webhook_type === 'TRANSACTIONS' && webhook_code === 'SYNC_UPDATES_AVAILABLE') {
        // Here you would typically:
        // 1. Fetch the access_token for this item_id from your database
        // 2. Call getTransactions to get the latest updates
        // 3. Process and store the new transactions
      }
      
      res.status(200).json({ status: 'ok' });
    } catch (error) {
      console.error('Error in handleWebhook:', error);
      res.status(500).json({ error: 'Failed to process webhook' });
    }
  }
} 