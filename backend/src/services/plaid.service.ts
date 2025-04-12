import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode, TransactionsSyncResponse } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

interface OverrideAccount {
  type: string;
  subtype: string;
  transactions: Transaction[];
  identity?: {
    names: string[];
    addresses: {
      primary: boolean;
      data: {
        country: string;
        city: string;
        street: string;
        postal_code: string;
        region: string;
      };
    }[];
  };
}

interface Transaction {
  date_transacted: string;
  date_posted: string;
  amount: number;
  description: string;
  currency: string;
}

interface PlaidAccount {
  account_id: string;
  balances: {
    available: number;
    current: number;
    limit: number | null;
    iso_currency_code: string;
    unofficial_currency_code: string | null;
  };
  mask: string;
  name: string;
  official_name: string | null;
  type: string;
  subtype: string | null;
}

interface PlaidTransaction {
  date: string;
  name: string;
  amount: number;
  personal_finance_category?: {
    primary: string;
  };
  category?: string[];
}

interface PlaidTransactionsResponse {
  transactions: PlaidTransaction[];
}

interface PlaidItem {
  item_id: string;
  institution_id: string;
  webhook: string | null;
  error: any | null;
  available_products: string[];
  billed_products: string[];
  products: string[];
  consented_products: string[] | null;
  consent_expiration_time: string | null;
  update_type: string;
  owner?: {
    names: string[];
    addresses: {
      data: {
        city: string | null;
        country: string | null;
        postal_code: string | null;
        region: string | null;
        street: string[];
      };
      primary: boolean;
    }[];
  };
}

interface PlaidTransactionsSyncResponse {
  accounts: PlaidAccount[];
  item: PlaidItem;
  request_id: string;
  total_transactions: number;
  added: PlaidTransaction[];
  modified: PlaidTransaction[];
  removed: PlaidTransaction[];
  next_cursor: string;
  has_more: boolean;
}

export class PlaidService {
  static async createLinkToken(userId: string) {
    try {
      const webhookUrl = `${process.env.API_URL}/api/plaid/webhook/plaid`;
      console.log('Creating link token with webhook URL:', webhookUrl);
      
      const response = await plaidClient.linkTokenCreate({
        user: { client_user_id: userId },
        client_name: 'Footprint App',
        products: [Products.Transactions],
        country_codes: [CountryCode.Us],
        language: 'en',
        webhook: webhookUrl,
        transactions: {
          days_requested: 730, // Maximum allowed days
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating link token:', error);
      throw error;
    }
  }

  static async exchangePublicToken(publicToken: string) {
    try {
      const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });
      return response.data;
    } catch (error) {
      console.error('Error exchanging public token:', error);
      throw error;
    }
  }

  static async getTransactions(accessToken: string, cursor?: string): Promise<any> {
    try {
      console.log('Fetching transactions with access token:', accessToken);
      console.log('Using cursor:', cursor);
      
      const response = await plaidClient.transactionsSync({
        access_token: accessToken,
        cursor: cursor,
        options: {
          include_personal_finance_category: true
        }
      });

      console.log('Raw Plaid response:', JSON.stringify(response.data, null, 2));

      const plaidResponse = response.data as TransactionsSyncResponse;

      if (!plaidResponse.added || plaidResponse.added.length === 0) {
        console.error('No transactions in response:', plaidResponse);
        throw new Error('No transactions found in response');
      }

      const transformedTransactions = plaidResponse.added.map(tx => ({
        date: tx.date,
        name: tx.merchant_name || tx.name,
        amount: tx.amount,
        category: tx.personal_finance_category?.primary || tx.category || []
      }));

      console.log('Transformed transactions:', JSON.stringify(transformedTransactions, null, 2));
      return { 
        transactions: transformedTransactions,
        next_cursor: plaidResponse.next_cursor,
        has_more: plaidResponse.has_more
      };
    } catch (error: any) {
      console.error('Error in getTransactions:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      throw new Error('Failed to fetch transactions');
    }
  }

  static async refreshTransactions(accessToken: string) {
    try {
      const response = await plaidClient.transactionsRefresh({
        access_token: accessToken,
      });
      return response.data;
    } catch (error) {
      console.error('Error refreshing transactions:', error);
      throw error;
    }
  }
} 