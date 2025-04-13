interface Transaction {
  date: string;
  name: string;
  amount: number;
  emissions?: {
    industry: string;
    emissionFactor: {
      industry: string;
      factor: number;
      unit: string;
      description: string;
    } | null;
  } | null;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  if (!transactions.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Transaction History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-right">Amount</th>
              <th className="px-4 py-2 text-left">Carbon Emissions</th>
              <th className="px-4 py-2 text-right">Calculated Emissions (kg)</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2">{new Date(transaction.date).toLocaleDateString()}</td>
                <td className="px-4 py-2">{transaction.name}</td>
                <td className="px-4 py-2 text-right">
                  ${Math.abs(transaction.amount).toFixed(2)}
                </td>
                <td className="px-4 py-2">
                  {transaction.emissions ? (
                    <div>
                      <div className="font-semibold">{transaction.emissions.industry}</div>
                      {transaction.emissions.emissionFactor ? (
                        <div className="text-sm">
                          <div>{transaction.emissions.emissionFactor.factor} {transaction.emissions.emissionFactor.unit}</div>
                          <div className="text-gray-600">{transaction.emissions.emissionFactor.description}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-yellow-600">No emission factor found</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">Loading emissions...</div>
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  {transaction.emissions?.emissionFactor ? (
                    <div>
                      {(Math.abs(transaction.amount) * transaction.emissions.emissionFactor.factor).toFixed(3)} kg
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">-</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 