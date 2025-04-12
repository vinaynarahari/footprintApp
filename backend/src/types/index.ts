export interface User {
  id: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export interface Transaction {
  id: string;
  user_id: string;
  plaid_transaction_id: string;
  amount: number;
  date: Date;
  category: string[];
  merchant_name: string;
  carbon_footprint: number;
  created_at: Date;
  updated_at: Date;
}

export interface PlaidItem {
  id: string;
  user_id: string;
  access_token: string;
  item_id: string;
  institution_id: string;
  created_at: Date;
  updated_at: Date;
} 