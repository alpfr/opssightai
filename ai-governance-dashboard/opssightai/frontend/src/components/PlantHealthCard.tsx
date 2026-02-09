import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PlantHealthCardProps {
  summary: {
    overallHealthScore: number;
    totalAssets: number;
    riskDistribution: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    criticalAnomalyCount: number;
  };
}

function PlantHealthCard({ summary }: PlantHealthCardProps) {
  const { overallHealthScore, totalAssets, riskDistribution, criticalAnomalyCount } = summary;

  // Prepare data for pie chart
  const chartData = [
    { name: 'Low Risk', value: riskDistribution.low, color: '#10b981' },
    { name: 'Medium Risk', value: riskDistribution.medium, color: '#f59e0b' },
    { name: 'High Risk', value: riskDistribution.high, color: '#ef4444' },
    { name: 'Critical Risk', value: riskDistribution.critical, color: '#dc2626' },
  ].filter(item => item.value > 0);

  // Determine health status
  const getHealthStatus = (score: number) => {
    if (score >= 85) return { label: 'Excellent', color: '#10b981' };
    if (score >= 70) return { label: 'Good', color: '#3b82f6' };
    if (score >= 50) return { label: 'Fair', color: '#f59e0b' };
    return { label: 'Poor', color: '#ef4444' };
  };

  const healthStatus = getHealthStatus(overallHealthScore);

  return (
    <div className="plant-health-section">
      <h2>Plant Health Overview</h2>
      
      <div className="health-grid">
        {/* Health Score Gauge */}
        <div className="health-card health-score-card">
          <h3>Overall Health Score</h3>
          <div className="health-score-display">
            <div 
              className="health-score-circle"
              style={{ borderColor: healthStatus.color }}
            >
              <span className="score-value">{overallHealthScore.toFixed(1)}</span>
              <span className="score-label">/ 100</span>
            </div>
            <div className="health-status" style={{ color: healthStatus.color }}>
              {healthStatus.label}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="health-card stats-card">
          <div className="stat-item">
            <span className="stat-label">Total Assets</span>
            <span className="stat-value">{totalAssets}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">High Risk Assets</span>
            <span className="stat-value high-risk">
              {riskDistribution.high + riskDistribution.critical}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Critical Anomalies (7d)</span>
            <span className="stat-value critical">
              {criticalAnomalyCount}
            </span>
          </div>
        </div>

        {/* Risk Distribution Chart */}
        <div className="health-card chart-card">
          <h3>Risk Distribution</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No risk data available</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlantHealthCard;
