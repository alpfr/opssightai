import React, { useState } from 'react';
import { useModels } from '../contexts/ModelContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

function ModelRegistry() {
  const { models, updateModel } = useModels();
  const { userProfile } = useAuth();
  const [sortBy, setSortBy] = useState('lastUpdated');
  const [filterBy, setFilterBy] = useState('all');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Passed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'Failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'Pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRiskTierColor = (tier) => {
    switch (tier) {
      case 'High-Risk':
        return 'bg-red-100 text-red-800';
      case 'Limited':
        return 'bg-yellow-100 text-yellow-800';
      case 'Minimal':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDPOSignOff = async (modelId, currentStatus) => {
    if (userProfile?.role === 'DPO') {
      await updateModel(modelId, { dpoSignOff: !currentStatus });
      alert(`DPO sign-off ${!currentStatus ? 'approved' : 'revoked'} successfully!`);
    }
  };

  const handleComplianceUpdate = async (modelId, newStatus) => {
    if (userProfile?.role === 'DPO' || userProfile?.role === 'Executive') {
      await updateModel(modelId, { complianceStatus: newStatus });
      alert(`Compliance status updated to ${newStatus}!`);
    }
  };

  const filteredModels = models.filter(model => {
    if (filterBy === 'all') return true;
    if (filterBy === 'high-risk') return model.riskTier === 'High-Risk';
    if (filterBy === 'failed') return model.complianceStatus === 'Failed';
    if (filterBy === 'pending') return model.complianceStatus === 'Pending';
    return true;
  });

  const sortedModels = [...filteredModels].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'riskTier':
        const riskOrder = { 'High-Risk': 3, 'Limited': 2, 'Minimal': 1 };
        return riskOrder[b.riskTier] - riskOrder[a.riskTier];
      case 'complianceStatus':
        return a.complianceStatus.localeCompare(b.complianceStatus);
      case 'lastUpdated':
      default:
        return new Date(b.lastUpdated) - new Date(a.lastUpdated);
    }
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Model Registry</h3>
          
          <div className="flex space-x-4">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Models</option>
              <option value="high-risk">High-Risk Only</option>
              <option value="failed">Failed Compliance</option>
              <option value="pending">Pending Review</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="lastUpdated">Last Updated</option>
              <option value="name">Name</option>
              <option value="riskTier">Risk Tier</option>
              <option value="complianceStatus">Compliance Status</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Model
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Use Case
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk Tier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Compliance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DPO Sign-off
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              {(userProfile?.role === 'DPO' || userProfile?.role === 'Executive') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedModels.map((model) => (
              <tr key={model.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {model.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {model.description}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {model.useCase}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskTierColor(model.riskTier)}`}>
                    {model.riskTier === 'High-Risk' && <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
                    {model.riskTier}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(model.complianceStatus)}
                    <span className="ml-2 text-sm text-gray-900">
                      {model.complianceStatus}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {model.dpoSignOff ? (
                      <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <ShieldExclamationIcon className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="ml-2 text-sm text-gray-900">
                      {model.dpoSignOff ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {model.lastUpdated}
                </td>
                {(userProfile?.role === 'DPO' || userProfile?.role === 'Executive') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {userProfile?.role === 'DPO' && (
                      <button
                        onClick={() => handleDPOSignOff(model.id, model.dpoSignOff)}
                        className={`inline-flex items-center px-2 py-1 border border-transparent text-xs rounded ${
                          model.dpoSignOff
                            ? 'text-red-700 bg-red-100 hover:bg-red-200'
                            : 'text-green-700 bg-green-100 hover:bg-green-200'
                        }`}
                      >
                        {model.dpoSignOff ? 'Revoke' : 'Approve'}
                      </button>
                    )}
                    
                    {model.complianceStatus === 'Pending' && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleComplianceUpdate(model.id, 'Passed')}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs rounded text-green-700 bg-green-100 hover:bg-green-200"
                        >
                          Pass
                        </button>
                        <button
                          onClick={() => handleComplianceUpdate(model.id, 'Failed')}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs rounded text-red-700 bg-red-100 hover:bg-red-200"
                        >
                          Fail
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedModels.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No models found matching the current filter.</div>
        </div>
      )}
    </div>
  );
}

export default ModelRegistry;