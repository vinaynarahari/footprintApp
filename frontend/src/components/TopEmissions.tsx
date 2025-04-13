interface CategoryEmissions {
  name: string;
  value: number;
  percentage: number;
}

interface TopEmissionsProps {
  data: CategoryEmissions[];
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF7C43', '#A4DE6C', '#D0ED57'
];

export default function TopEmissions({ data }: TopEmissionsProps) {
  if (!data.length) return null;

  const top5 = data.slice(0, 5);
  const totalEmissions = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex-1">
      <h3 className="text-lg font-semibold mb-3">Top 5 Carbon Emission Sources</h3>
      <div className="space-y-3">
        {top5.map((item, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="font-medium">
                  {item.name.length > 30 ? item.name.substring(0, 30) + '...' : item.name}
                </span>
              </div>
              <span className="font-bold">{item.percentage.toFixed(1)}%</span>
            </div>
            <div className="mt-1 flex justify-between text-sm text-gray-600">
              <span>Emissions:</span>
              <span>{item.value.toFixed(2)} kg CO2e</span>
            </div>
            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full" 
                style={{ 
                  width: `${item.percentage}%`, 
                  backgroundColor: COLORS[index % COLORS.length] 
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center text-gray-600">
        Total Carbon Emissions: {totalEmissions.toFixed(2)} kg CO2e
      </div>
    </div>
  );
} 