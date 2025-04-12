import { Request, Response, NextFunction } from 'express';
import { plaidClient } from '../config/plaid';
import { AppError } from '../middleware/errorHandler';
import { CountryCode, Products, DepositoryAccountSubtype } from 'plaid';

export const createLinkToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('Creating link token...');
    console.log('User from request:', req.user);
    console.log('Authorization header:', req.headers.authorization);

    if (!req.user?.userId) {
      console.error('No userId found in request');
      throw new AppError('User ID is required', 400);
    }

    const configs = {
      user: {
        client_user_id: String(req.user.userId)
      },
      client_name: 'Footprint App',
      products: [Products.Auth],
      country_codes: [CountryCode.Us],
      language: 'en',
      account_filters: {
        depository: {
          account_subtypes: [DepositoryAccountSubtype.Checking, DepositoryAccountSubtype.Savings]
        }
      }
    };

    console.log('Plaid configs:', JSON.stringify(configs, null, 2));

    try {
      const createTokenResponse = await plaidClient.linkTokenCreate(configs);
      console.log('Plaid response:', JSON.stringify(createTokenResponse.data, null, 2));
      res.json({ link_token: createTokenResponse.data.link_token });
    } catch (plaidError: any) {
      console.error('Plaid API error:', {
        error: plaidError,
        message: plaidError.message,
        response: plaidError.response?.data
      });
      throw new AppError(`Error creating link token: ${plaidError.message}`, 500);
    }
  } catch (error) {
    console.error('Error in createLinkToken:', error);
    next(error);
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