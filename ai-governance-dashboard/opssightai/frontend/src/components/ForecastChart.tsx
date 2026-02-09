import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';

interface ForecastChartProps {
  data: {
    predictions: Array<{
      date: string;
      predictedRiskScore: number;
      confidence: number;
      lowerBound: number;
      upperBound: number;
    }>;
  };
}

function ForecastChart({ data }: ForecastChartProps) {
  const chartData = data.predictions.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    predicted: item.predictedRiskScore,
    lower: item.lowerBound,
    upper: item.upperBound,
    confidence: (item.confidence * 100).toFixed(1),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="upper" 
          stroke="none" 
          fill="#667eea" 
          fillOpacity={0.1}
          name="Upper Bound"
        />
        <Area 
          type="monotone" 
          dataKey="lower" 
          stroke="none" 
          fill="#667eea" 
          fillOpacity={0.1}
          name="Lower Bound"
        />
        <Line 
          type="monotone" 
          dataKey="predicted" 
          stroke="#667eea" 
          strokeWidth={2}
          name="Predicted Risk Score"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export default ForecastChart;
