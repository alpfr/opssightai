import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AnomalyTimelineProps {
  data: Array<{
    detectedAt: string;
    metric: string;
    severity: string;
    description: string;
  }>;
}

function AnomalyTimeline({ data }: AnomalyTimelineProps) {
  // Map severity to numeric values for Y-axis
  const severityMap: { [key: string]: number } = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };

  // Map severity to colors
  const severityColors: { [key: string]: string } = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626',
  };

  const chartData = data.map(item => ({
    time: new Date(item.detectedAt).getTime(),
    timeLabel: new Date(item.detectedAt).toLocaleString(),
    severity: severityMap[item.severity.toLowerCase()],
    severityLabel: item.severity,
    metric: item.metric,
    description: item.description,
    color: severityColors[item.severity.toLowerCase()],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{data.timeLabel}</p>
          <p style={{ margin: '0 0 5px 0' }}>Metric: {data.metric}</p>
          <p style={{ margin: '0 0 5px 0' }}>Severity: {data.severityLabel}</p>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>{data.description}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="time" 
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(value) => new Date(value).toLocaleDateString()}
        />
        <YAxis 
          dataKey="severity"
          type="number"
          domain={[0, 5]}
          ticks={[1, 2, 3, 4]}
          tickFormatter={(value) => {
            const labels: { [key: number]: string } = {
              1: 'Low',
              2: 'Medium',
              3: 'High',
              4: 'Critical',
            };
            return labels[value] || '';
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Scatter data={chartData}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export default AnomalyTimeline;
