import type { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

// Initialize Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.NEXT_PUBLIC_PLAID_ENV as keyof typeof PlaidEnvironments || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create a link token for testing
    const createTokenResponse = await plaidClient.linkTokenCreate({
      user: { client_user_id: 'test-user' },
      client_name: process.env.NEXT_PUBLIC_PLAID_CLIENT_NAME || 'Footprint App',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    });

    // Return the link token
    return res.status(200).json({
      link_token: createTokenResponse.data.link_token,
    });
  } catch (error) {
    console.error('Error creating link token:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'An error occurred',
    });
  }
} 