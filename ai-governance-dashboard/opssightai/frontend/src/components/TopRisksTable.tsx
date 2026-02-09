import { Link } from 'react-router-dom';

interface Asset {
  assetId: string;
  assetName: string;
  assetType: string;
  riskScore: number;
  status: string;
  location: string;
}

interface TopRisksTableProps {
  assets: Asset[];
}

function TopRisksTable({ assets }: TopRisksTableProps) {
  const getRiskLevel = (score: number) => {
    if (score <= 30) return { label: 'Low', className: 'risk-low' };
    if (score <= 60) return { label: 'Medium', className: 'risk-medium' };
    if (score <= 80) return { label: 'High', className: 'risk-high' };
    return { label: 'Critical', className: 'risk-critical' };
  };

  const getPrimaryConcern = (score: number) => {
    if (score > 80) return 'Immediate attention required';
    if (score > 60) return 'Schedule maintenance soon';
    if (score > 30) return 'Monitor closely';
    return 'Operating normally';
  };

  return (
    <div className="top-risks-section">
      <h2>Top Risk Assets</h2>
      
      {assets.length > 0 ? (
        <div className="risks-table-container">
          <table className="risks-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Asset Name</th>
                <th>Type</th>
                <th>Location</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th>Primary Concern</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, index) => {
                const riskLevel = getRiskLevel(asset.riskScore);
                const concern = getPrimaryConcern(asset.riskScore);
                
                return (
                  <tr key={asset.assetId}>
                    <td className="rank-cell">#{index + 1}</td>
                    <td className="asset-name-cell">
                      <strong>{asset.assetName}</strong>
                    </td>
                    <td className="type-cell">{asset.assetType}</td>
                    <td>{asset.location}</td>
                    <td className="score-cell">
                      <span className="score-badge">{asset.riskScore.toFixed(1)}</span>
                    </td>
                    <td>
                      <span className={`risk-badge ${riskLevel.className}`}>
                        {riskLevel.label}
                      </span>
                    </td>
                    <td className="concern-cell">{concern}</td>
                    <td>
                      <Link to={`/assets/${asset.assetId}`} className="view-link">
                        View Details →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-data">
          <p>No high-risk assets detected</p>
          <p className="hint">All assets are operating within normal parameters</p>
        </div>
      )}
    </div>
  );
}

export default TopRisksTable;
