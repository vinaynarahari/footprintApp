import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import dotenv from 'dotenv';

dotenv.config();

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

export const setupPlaid = () => {
  console.log('Setting up Plaid client...');
  console.log('Plaid Environment:', process.env.PLAID_ENV);
  console.log('Plaid Client ID:', process.env.PLAID_CLIENT_ID?.substring(0, 8) + '...');
  console.log('Plaid Secret:', process.env.PLAID_SECRET?.substring(0, 8) + '...');
  
  if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
    console.error('Plaid credentials not found in environment variables');
    process.exit(1);
  }

  const basePath = PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments];
  console.log('Using Plaid base path:', basePath);
  
  console.log('Plaid client initialized successfully');
}; 