import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SensorDataChartProps {
  data: Array<{
    timestamp: string;
    sensorType: string;
    value: number;
    unit: string;
  }>;
}

function SensorDataChart({ data }: SensorDataChartProps) {
  // Group data by sensor type
  const sensorTypes = Array.from(new Set(data.map(d => d.sensorType)));
  
  // Create time-series data structure
  const timeMap = new Map<string, any>();
  
  data.forEach(item => {
    const time = new Date(item.timestamp).toLocaleString();
    if (!timeMap.has(time)) {
      timeMap.set(time, { time });
    }
    timeMap.get(time)[item.sensorType] = item.value;
  });
  
  const chartData = Array.from(timeMap.values()).reverse();
  
  // Colors for different sensor types
  const colors = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        {sensorTypes.map((type, index) => (
          <Line 
            key={type}
            type="monotone" 
            dataKey={type} 
            stroke={colors[index % colors.length]} 
            strokeWidth={2}
            name={type}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export default SensorDataChart;
