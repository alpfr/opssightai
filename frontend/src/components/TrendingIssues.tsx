interface TrendingIssue {
  issueType: string;
  description: string;
  affectedAssetCount: number;
  severity: string;
  trend: string;
}

interface TrendingIssuesProps {
  issues: TrendingIssue[];
}

function TrendingIssues({ issues }: TrendingIssuesProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return { icon: '📈', color: '#ef4444', label: 'Increasing' };
      case 'stable':
        return { icon: '➡️', color: '#f59e0b', label: 'Stable' };
      case 'decreasing':
        return { icon: '📉', color: '#10b981', label: 'Decreasing' };
      default:
        return { icon: '➖', color: '#6b7280', label: 'Unknown' };
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'severity-critical';
      case 'high':
        return 'severity-high';
      case 'medium':
        return 'severity-medium';
      default:
        return 'severity-low';
    }
  };

  return (
    <div className="trending-issues-section">
      <h2>Trending Issues</h2>
      
      <div className="issues-grid">
        {issues.map((issue, index) => {
          const trendInfo = getTrendIcon(issue.trend);
          
          return (
            <div key={index} className="issue-card">
              <div className="issue-header">
                <div className="issue-type">
                  <span className="issue-icon">⚠️</span>
                  <span className="issue-name">{issue.issueType}</span>
                </div>
                <span className={`severity-badge ${getSeverityClass(issue.severity)}`}>
                  {issue.severity}
                </span>
              </div>
              
              <p className="issue-description">{issue.description}</p>
              
              <div className="issue-footer">
                <div className="affected-count">
                  <span className="count-value">{issue.affectedAssetCount}</span>
                  <span className="count-label">assets affected</span>
                </div>
                
                <div className="trend-indicator" style={{ color: trendInfo.color }}>
                  <span className="trend-icon">{trendInfo.icon}</span>
                  <span className="trend-label">{trendInfo.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TrendingIssues;
