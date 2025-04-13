import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

// Initialize Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// Add security headers to the response
const addSecurityHeaders = (res: NextApiResponse) => {
  res.setHeader(
    'Content-Security-Policy',
    `default-src 'self';
     script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.plaid.com https://cdn.plaid.com;
     style-src 'self' 'unsafe-inline';
     img-src 'self' data: https://*.plaid.com;
     font-src 'self';
     frame-src 'self' https://*.plaid.com;
     connect-src 'self' https://*.plaid.com https://cdn.plaid.com https://sandbox.plaid.com https://*.supabase.co https://upkwjzxfavnybjzsoqpu.supabase.co;`.replace(/\s{2,}/g, ' ').trim()
  );
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add security headers
  addSecurityHeaders(res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Starting link token creation...');
  console.log('Plaid Environment:', {
    env: PlaidEnvironments.sandbox,
    clientId: process.env.PLAID_CLIENT_ID,
    clientIdLength: process.env.PLAID_CLIENT_ID?.length,
    secretLength: process.env.PLAID_SECRET?.length
  });

  try {
    const request = {
      user: {
        client_user_id: 'user-' + Math.random().toString(36).substring(2),
      },
      client_name: process.env.NEXT_PUBLIC_PLAID_CLIENT_NAME || 'Footprint App',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en'
    };

    console.log('Making Plaid API request with:', JSON.stringify(request, null, 2));

    const createTokenResponse = await plaidClient.linkTokenCreate(request);

    console.log('Plaid API response received:', {
      status: 'success',
      hasLinkToken: !!createTokenResponse.data.link_token
    });

    return res.status(200).json({
      link_token: createTokenResponse.data.link_token
    });
  } catch (error: any) {
    console.error('Detailed Plaid error:', {
      name: error.name,
      message: error.message,
      config: error.config,
      response: error.response?.data,
      stack: error.stack
    });

    // Return a more detailed error response
    return res.status(500).json({ 
      error: 'Failed to create link token',
      details: error.response?.data || error.message,
      type: error.name,
      plaidError: error.response?.data?.error_code
    });
  }
} 