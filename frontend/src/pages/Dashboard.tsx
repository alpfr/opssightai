import { useState, useEffect } from 'react';
import { assetApi } from '../services/api';
import { Asset } from '../types';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    highRisk: 0,
    avgRisk: 0,
    maintenanceDue: 0
  });

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const response = await assetApi.getAll();
      const assetData = response.data.assets;
      setAssets(assetData);

      // Calculate stats
      const active = assetData.filter((a: Asset) => a.status === 'active').length;
      const highRisk = assetData.filter((a: Asset) => (a.currentRiskScore || 0) > 60).length;
      const avgRisk = assetData.reduce((sum: number, a: Asset) => sum + (a.currentRiskScore || 0), 0) / assetData.length;
      const maintenanceDue = assetData.filter((a: Asset) => 
        a.nextScheduledMaintenance && new Date(a.nextScheduledMaintenance) < new Date()
      ).length;

      setStats({
        total: assetData.length,
        active,
        highRisk,
        avgRisk: Math.round(avgRisk * 10) / 10,
        maintenanceDue
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to load assets:', error);
      setLoading(false);
    }
  };

  const getRiskColor = (score?: number) => {
    if (!score) return '#cbd5e0';
    if (score > 80) return '#fc8181';
    if (score > 60) return '#f6ad55';
    if (score > 30) return '#f6e05e';
    return '#68d391';
  };

  const getRiskLabel = (score?: number) => {
    if (!score) return 'Unknown';
    if (score > 80) return 'Critical';
    if (score > 60) return 'High';
    if (score > 30) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return <div className="dashboard loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Plant Overview</h2>
        <p>Real-time operational risk intelligence</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Assets</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Active Assets</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: stats.maintenanceDue > 0 ? '#c53030' : '#68d391' }}>
            {stats.maintenanceDue}
          </div>
          <div className="stat-label">🔧 Maintenance Due</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: stats.highRisk > 0 ? '#f6ad55' : '#68d391' }}>
            {stats.highRisk}
          </div>
          <div className="stat-label">High Risk Assets</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: getRiskColor(stats.avgRisk) }}>
            {stats.avgRisk}
          </div>
          <div className="stat-label">Average Risk Score</div>
        </div>
      </div>

      <div className="assets-section">
        <h3>Assets by Risk Level</h3>
        <div className="assets-grid">
          {assets.map(asset => (
            <Link to={`/assets/${asset.id}`} key={asset.id} className="asset-card">
              <div className="asset-header">
                <h4>{asset.name}</h4>
                <span className="asset-type">{asset.type}</span>
              </div>
              <div className="asset-location">
                📍 {asset.location.building} - Floor {asset.location.floor || 'N/A'}
              </div>
              <div className="asset-risk">
                <div 
                  className="risk-badge"
                  style={{ backgroundColor: getRiskColor(asset.currentRiskScore) }}
                >
                  {getRiskLabel(asset.currentRiskScore)}
                </div>
                <div className="risk-score">
                  {asset.currentRiskScore ? asset.currentRiskScore.toFixed(1) : 'N/A'}
                </div>
              </div>
              <div className="asset-status">
                <span className={`status-badge status-${asset.status}`}>
                  {asset.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
