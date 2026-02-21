import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assetApi, sensorDataApi, riskApi, anomalyApi, forecastApi } from '../services/api';
import { Asset, SensorData } from '../types';
import RiskScoreChart from '../components/RiskScoreChart.tsx';
import SensorDataChart from '../components/SensorDataChart.tsx';
import AnomalyTimeline from '../components/AnomalyTimeline.tsx';
import ForecastChart from '../components/ForecastChart.tsx';
import './AssetDetail.css';

function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [riskHistory, setRiskHistory] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadAssetData(id);
    }
  }, [id]);

  const loadAssetData = async (assetId: string) => {
    try {
      const [assetResponse, dataResponse] = await Promise.all([
        assetApi.getById(assetId),
        sensorDataApi.getByAsset(assetId, { limit: 100 })
      ]);

      setAsset(assetResponse.data.asset);
      setSensorData(dataResponse.data.data || []);
      setLoading(false);

      // Load chart data
      loadChartData(assetId);
    } catch (error) {
      console.error('Failed to load asset data:', error);
      setLoading(false);
      setChartsLoading(false);
    }
  };

  const loadChartData = async (assetId: string) => {
    try {
      const [riskResponse, anomalyResponse, forecastResponse] = await Promise.all([
        riskApi.getHistory(assetId, { limit: 30 }).catch(() => ({ data: { history: [] } })),
        anomalyApi.getByAsset(assetId, { limit: 50 }).catch(() => ({ data: { anomalies: [] } })),
        forecastApi.get(assetId).catch(() => ({ data: { forecast: null } }))
      ]);

      setRiskHistory(riskResponse.data.history || []);
      setAnomalies(anomalyResponse.data.anomalies || []);
      setForecast(forecastResponse.data.forecast);
      setChartsLoading(false);
    } catch (error) {
      console.error('Failed to load chart data:', error);
      setChartsLoading(false);
    }
  };

  const calculateAssetAge = (installationDate: string): string => {
    const years = (Date.now() - new Date(installationDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
    if (years < 1) {
      const months = Math.floor(years * 12);
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    return `${years.toFixed(1)} years`;
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isMaintenanceOverdue = (nextMaintenance: string): boolean => {
    return new Date(nextMaintenance) < new Date();
  };

  if (loading) {
    return <div className="asset-detail loading">Loading asset details...</div>;
  }

  if (!asset) {
    return <div className="asset-detail error">Asset not found</div>;
  }

  return (
    <div className="asset-detail">
      <div className="detail-header">
        <Link to="/assets" className="back-link">← Back to Assets</Link>
        <h2>{asset.name}</h2>
        <span className={`status-badge status-${asset.status}`}>{asset.status}</span>
      </div>

      <div className="detail-grid">
        <div className="info-card">
          <h3>Asset Information</h3>
          <div className="info-row">
            <span className="label">Type:</span>
            <span className="value">{asset.type}</span>
          </div>
          <div className="info-row">
            <span className="label">Location:</span>
            <span className="value">
              {asset.location.building} - Floor {asset.location.floor || 'N/A'}
            </span>
          </div>
          <div className="info-row">
            <span className="label">Plant ID:</span>
            <span className="value">{asset.location.plantId}</span>
          </div>
          <div className="info-row">
            <span className="label">Risk Score:</span>
            <span className="value risk-value">
              {asset.currentRiskScore ? asset.currentRiskScore.toFixed(1) : 'N/A'}
            </span>
          </div>
          <div className="info-row">
            <span className="label">Age:</span>
            <span className="value">{calculateAssetAge(asset.metadata.installationDate)}</span>
          </div>
          {asset.lastMaintenanceDate && (
            <div className="info-row">
              <span className="label">Last Maintenance:</span>
              <span className="value">{formatDate(asset.lastMaintenanceDate)}</span>
            </div>
          )}
          {asset.nextScheduledMaintenance && (
            <div className="info-row">
              <span className="label">Next Maintenance:</span>
              <span className={`value ${isMaintenanceOverdue(asset.nextScheduledMaintenance) ? 'maintenance-overdue-text' : ''}`}>
                {formatDate(asset.nextScheduledMaintenance)}
                {isMaintenanceOverdue(asset.nextScheduledMaintenance) && ' ⚠️'}
              </span>
            </div>
          )}
        </div>

        <div className="info-card">
          <h3>Equipment Details</h3>
          <div className="info-row">
            <span className="label">Manufacturer:</span>
            <span className="value">{asset.metadata.manufacturer}</span>
          </div>
          <div className="info-row">
            <span className="label">Model:</span>
            <span className="value">{asset.metadata.model}</span>
          </div>
          <div className="info-row">
            <span className="label">Serial Number:</span>
            <span className="value">{asset.metadata.serialNumber}</span>
          </div>
          <div className="info-row">
            <span className="label">Installation Date:</span>
            <span className="value">
              {new Date(asset.metadata.installationDate).toLocaleDateString()}
            </span>
          </div>
          {asset.metadata.capacity && (
            <div className="info-row">
              <span className="label">Capacity:</span>
              <span className="value">{asset.metadata.capacity}</span>
            </div>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {chartsLoading ? (
          <div className="charts-loading">Loading analytics...</div>
        ) : (
          <>
            {/* Risk Score History Chart */}
            {riskHistory.length > 0 && (
              <div className="chart-card">
                <h3>Risk Score History</h3>
                <RiskScoreChart data={riskHistory} />
              </div>
            )}

            {/* Sensor Data Chart */}
            {sensorData.length > 0 && (
              <div className="chart-card">
                <h3>Sensor Readings Over Time</h3>
                <SensorDataChart data={sensorData} />
              </div>
            )}

            {/* Anomaly Timeline */}
            {anomalies.length > 0 && (
              <div className="chart-card">
                <h3>Anomaly Timeline</h3>
                <AnomalyTimeline data={anomalies} />
              </div>
            )}

            {/* Forecast Chart */}
            {forecast && forecast.predictions && forecast.predictions.length > 0 && (
              <div className="chart-card">
                <h3>30-Day Risk Forecast</h3>
                <ForecastChart data={forecast} />
                <div className="forecast-info">
                  <p>Generated: {new Date(forecast.generatedAt).toLocaleString()}</p>
                  <p>Horizon: {forecast.forecastHorizon} days</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="sensor-data-section">
        <h3>Recent Sensor Readings</h3>
        {sensorData.length > 0 ? (
          <div className="sensor-table">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Sensor Type</th>
                  <th>Value</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                {sensorData.map((data) => (
                  <tr key={`${data.timestamp}-${data.sensorType}`}>
                    <td>{new Date(data.timestamp).toLocaleString()}</td>
                    <td className="sensor-type">{data.sensorType}</td>
                    <td className="sensor-value">{data.value}</td>
                    <td>{data.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data">
            <p>No sensor data available for this asset.</p>
            <p className="hint">Sensor data will appear here once readings are ingested.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssetDetail;
