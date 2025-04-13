import React from 'react';
import EcoAlternative from './EcoAlternative';

interface Transaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  carbon_emissions?: {
    description: string;
    intensity: string;
  };
  calculated_emissions_kg: number;
}

const Transactions: React.FC<{ transactions?: Transaction[] }> = ({ transactions = [] }) => {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">Transaction History</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Description</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-left">Category</th>
              <th className="py-3 px-4 text-left">Carbon Emissions</th>
              <th className="py-3 px-4 text-right">Calculated Emissions (kg)</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-3 px-4">{transaction.date}</td>
                <td className="py-3 px-4">{transaction.description}</td>
                <td className="py-3 px-4 text-right">${transaction.amount.toFixed(2)}</td>
                <td className="py-3 px-4">{transaction.category}</td>
                <td className="py-3 px-4">
                  {transaction.carbon_emissions && (
                    <div className="text-sm">
                      <div>{transaction.carbon_emissions.description}</div>
                      <div className="text-gray-500">{transaction.carbon_emissions.intensity}</div>
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-right">{transaction.calculated_emissions_kg.toFixed(3)} kg</td>
                <td className="py-3 px-4 text-center">
                  {transaction.calculated_emissions_kg > 5 && (
                    <EcoAlternative
                      transaction={{
                        id: index,
                        merchant: transaction.description,
                        category: transaction.category,
                        amount: transaction.amount,
                        emissions_kg: transaction.calculated_emissions_kg
                      }}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions; 