import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CategoryEmissions {
  name: string;
  value: number;
  percentage: number;
}

interface EmissionsPieChartProps {
  data: CategoryEmissions[];
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF7C43', '#A4DE6C', '#D0ED57'
];

export default function EmissionsPieChart({ data }: EmissionsPieChartProps) {
  if (!data.length) return null;

  return (
    <div className="flex-1 min-h-[400px] w-full">
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percentage }) => {
              const shortName = name.length > 20 ? name.substring(0, 20) + '...' : name;
              return `${shortName} (${percentage.toFixed(1)}%)`;
            }}
            outerRadius={150}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            isAnimationActive={true}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(2)} kg CO2e`, 'Emissions']}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '8px'
            }}
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Legend 
            layout="vertical" 
            align="right" 
            verticalAlign="middle"
            wrapperStyle={{ 
              paddingLeft: '20px',
              fontSize: '12px'
            }}
            formatter={(value: string) => {
              const shortName = value.length > 25 ? value.substring(0, 25) + '...' : value;
              return shortName;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
} 