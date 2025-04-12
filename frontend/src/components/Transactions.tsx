import React from 'react';

const Transactions: React.FC = () => {
  // Placeholder data for demonstration
  const transactions = [
    { id: 1, date: '2023-04-12', description: 'Grocery Store', amount: -120.50 },
    { id: 2, date: '2023-04-11', description: 'Salary Deposit', amount: 2500.00 },
    { id: 3, date: '2023-04-10', description: 'Restaurant', amount: -45.75 },
  ];

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Your Transactions</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">Date</th>
              <th className="py-2 px-4 text-left">Description</th>
              <th className="py-2 px-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="border-t">
                <td className="py-2 px-4">{transaction.date}</td>
                <td className="py-2 px-4">{transaction.description}</td>
                <td className={`py-2 px-4 text-right ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(transaction.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 text-center text-gray-500">
        <p>Connect your bank account to see your actual transactions.</p>
      </div>
    </div>
  );
};

export default Transactions; 