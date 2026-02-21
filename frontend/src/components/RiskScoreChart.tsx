import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface RiskScoreChartProps {
  data: Array<{
    time: string;
    riskScore: number;
  }>;
}

function RiskScoreChart({ data }: RiskScoreChartProps) {
  // Format data for chart
  const chartData = data.map(item => ({
    time: new Date(item.time).toLocaleDateString(),
    score: item.riskScore,
  })).reverse(); // Reverse to show oldest to newest

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" label="Low" />
        <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" label="Medium" />
        <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" label="High" />
        <Line type="monotone" dataKey="score" stroke="#667eea" strokeWidth={2} name="Risk Score" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default RiskScoreChart;
