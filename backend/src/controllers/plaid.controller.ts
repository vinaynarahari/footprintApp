import { Request, Response, NextFunction } from 'express';
import { plaidClient } from '../config/plaid';
import { AppError } from '../middleware/errorHandler';
import { CountryCode, Products } from 'plaid';

export const createLinkToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      throw new AppError('User ID is required', 400);
    }

    const configs = {
      user: { client_user_id: req.user.userId },
      client_name: 'Footprint App',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    };

    const createTokenResponse = await plaidClient.linkTokenCreate(configs);
    res.json({ link_token: createTokenResponse.data.link_token });
  } catch (error) {
    next(new AppError('Error creating link token', 500));
  }
};

export const exchangePublicToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { public_token } = req.body;

    if (!public_token) {
      throw new AppError('Public token is required', 400);
    }

    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    // Here you would typically save the access_token to your database
    // associated with the user's account

    res.json({ access_token: exchangeResponse.data.access_token });
  } catch (error) {
    next(new AppError('Error exchanging public token', 500));
  }
}; 