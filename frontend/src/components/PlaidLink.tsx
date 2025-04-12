import React from 'react';

const PlaidLink: React.FC = () => {
  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Link Your Bank Account</h2>
      <p className="mb-6 text-gray-600">
        Connect your bank account to start tracking your transactions and managing your finances.
      </p>
      <div className="text-center">
        <button className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Connect with Plaid
        </button>
        <p className="mt-4 text-sm text-gray-500">
          We use Plaid to securely connect to your bank. Your credentials are never stored.
        </p>
      </div>
    </div>
  );
};

export default PlaidLink; 