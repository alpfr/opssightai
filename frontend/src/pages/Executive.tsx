import { useState, useEffect } from 'react';
import { summaryApi } from '../services/api';
import PlantHealthCard from '../components/PlantHealthCard.tsx';
import TopRisksTable from '../components/TopRisksTable.tsx';
import TrendingIssues from '../components/TrendingIssues.tsx';
import './Executive.css';

interface ExecutiveSummary {
  plantId: string;
  generatedAt: string;
  overallHealthScore: number;
  totalAssets: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  criticalAnomalyCount: number;
  topRiskAssets: Array<{
    assetId: string;
    assetName: string;
    assetType: string;
    riskScore: number;
    status: string;
    location: string;
  }>;
  trendingIssues: Array<{
    issueType: string;
    description: string;
    affectedAssetCount: number;
    severity: string;
    trend: string;
  }>;
  recommendations: string[];
}

function Executive() {
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Default plant ID - in production, this would come from user context
  const plantId = 'PLANT-001';

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await summaryApi.get(plantId);
      setSummary(response.data.summary);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load executive summary:', err);
      setError('Failed to load executive summary. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="executive-view loading">Loading executive summary...</div>;
  }

  if (error) {
    return (
      <div className="executive-view error">
        <p>{error}</p>
        <button onClick={loadSummary} className="retry-button">Retry</button>
      </div>
    );
  }

  if (!summary) {
    return <div className="executive-view error">No summary data available</div>;
  }

  return (
    <div className="executive-view">
      <div className="executive-header">
        <h1>Executive Summary</h1>
        <div className="header-meta">
          <span className="plant-id">Plant: {summary.plantId}</span>
          <span className="generated-time">
            Updated: {new Date(summary.generatedAt).toLocaleString()}
          </span>
          <button onClick={loadSummary} className="refresh-button">
            Refresh
          </button>
        </div>
      </div>

      {/* Plant Health Overview */}
      <PlantHealthCard summary={summary} />

      {/* Recommendations Section */}
      {summary.recommendations.length > 0 && (
        <div className="recommendations-section">
          <h2>Recommendations</h2>
          <div className="recommendations-list">
            {summary.recommendations.map((rec, index) => (
              <div key={index} className={`recommendation-card ${rec.includes('URGENT') ? 'urgent' : ''}`}>
                <div className="recommendation-icon">
                  {rec.includes('URGENT') ? '⚠️' : 'ℹ️'}
                </div>
                <p>{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Risk Assets */}
      <TopRisksTable assets={summary.topRiskAssets} />

      {/* Trending Issues */}
      {summary.trendingIssues.length > 0 && (
        <TrendingIssues issues={summary.trendingIssues} />
      )}
    </div>
  );
}

export default Executive;
