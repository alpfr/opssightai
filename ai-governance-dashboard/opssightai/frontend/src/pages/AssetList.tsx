import { useState, useEffect } from 'react';
import { assetApi } from '../services/api';
import { Asset } from '../types';
import { Link } from 'react-router-dom';
import './AssetList.css';

function AssetList() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [assets, filterType, filterStatus, sortBy, searchTerm]);

  const loadAssets = async () => {
    try {
      const response = await assetApi.getAll();
      setAssets(response.data.assets);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load assets:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...assets];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(term) ||
        a.type.toLowerCase().includes(term) ||
        a.location.building.toLowerCase().includes(term) ||
        a.metadata.manufacturer.toLowerCase().includes(term)
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.type === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(a => a.status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'risk':
          return (b.currentRiskScore || 0) - (a.currentRiskScore || 0);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'maintenance':
          return getMaintenancePriority(a) - getMaintenancePriority(b);
        default:
          return 0;
      }
    });

    setFilteredAssets(filtered);
  };

  const getMaintenancePriority = (asset: Asset): number => {
    if (!asset.nextScheduledMaintenance) return 999;
    const daysUntil = Math.floor((new Date(asset.nextScheduledMaintenance).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntil;
  };

  const getMaintenanceStatus = (nextMaintenance?: string) => {
    if (!nextMaintenance) return null;
    
    const now = new Date();
    const maintenanceDate = new Date(nextMaintenance);
    const daysUntil = Math.floor((maintenanceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) {
      return { status: 'overdue', label: '⚠️ Overdue', class: 'maintenance-overdue' };
    } else if (daysUntil <= 7) {
      return { status: 'due-soon', label: '📅 Due Soon', class: 'maintenance-due-soon' };
    } else if (daysUntil <= 30) {
      return { status: 'upcoming', label: '📆 Upcoming', class: 'maintenance-upcoming' };
    }
    return null;
  };

  if (loading) {
    return <div className="asset-list loading">Loading assets...</div>;
  }

  return (
    <div className="asset-list">
      <div className="list-header">
        <h2>Asset Management</h2>
        <p>{filteredAssets.length} of {assets.length} assets</p>
      </div>

      <div className="filters">
        <div className="filter-group search-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="clear-search">✕</button>
          )}
        </div>

        <div className="filter-group">
          <label>Type:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="transformer">Transformer</option>
            <option value="motor">Motor</option>
            <option value="generator">Generator</option>
            <option value="pump">Pump</option>
            <option value="compressor">Compressor</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
            <option value="decommissioned">Decommissioned</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Name</option>
            <option value="risk">Risk Score</option>
            <option value="type">Type</option>
            <option value="maintenance">Maintenance Due</option>
          </select>
        </div>
      </div>

      <div className="assets-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Location</th>
              <th>Risk Score</th>
              <th>Status</th>
              <th>Maintenance</th>
              <th>Manufacturer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map(asset => {
              const maintenanceStatus = getMaintenanceStatus(asset.nextScheduledMaintenance);
              return (
                <tr key={asset.id}>
                  <td className="asset-name">{asset.name}</td>
                  <td className="asset-type">{asset.type}</td>
                  <td>{asset.location.building} - Floor {asset.location.floor || 'N/A'}</td>
                  <td>
                    <span className={`risk-score risk-${getRiskLevel(asset.currentRiskScore)}`}>
                      {asset.currentRiskScore ? asset.currentRiskScore.toFixed(1) : 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${asset.status}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td>
                    {maintenanceStatus ? (
                      <span className={`maintenance-badge ${maintenanceStatus.class}`}>
                        {maintenanceStatus.label}
                      </span>
                    ) : (
                      <span className="maintenance-badge maintenance-none">Not Scheduled</span>
                    )}
                  </td>
                  <td>{asset.metadata.manufacturer}</td>
                  <td>
                    <Link to={`/assets/${asset.id}`} className="btn-view">
                      View Details
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getRiskLevel(score?: number): string {
  if (!score) return 'unknown';
  if (score > 80) return 'critical';
  if (score > 60) return 'high';
  if (score > 30) return 'medium';
  return 'low';
}

export default AssetList;
