import React from 'react';
import { useModels } from '../contexts/ModelContext';
import { useAuth } from '../contexts/AuthContext';
import ComplianceGauge from './ComplianceGauge';
import ModelRegistry from './ModelRegistry';
import OnboardForm from './OnboardForm';
import DemoTour from './DemoTour';

function Dashboard() {
  const { models, getComplianceStats, loading } = useModels();
  const { userProfile } = useAuth();
  const [showTour, setShowTour] = React.useState(false);

  const stats = getComplianceStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const getRoleBasedWelcome = () => {
    switch (userProfile?.role) {
      case 'Executive':
        return {
          title: 'Executive Overview',
          subtitle: 'Monitor AI compliance across your organization'
        };
      case 'DPO':
        return {
          title: 'Data Protection Officer Dashboard',
          subtitle: 'Review and approve AI models for compliance'
        };
      case 'Developer':
        return {
          title: 'Developer Dashboard',
          subtitle: 'Onboard and track your AI models'
        };
      default:
        return {
          title: 'AI Governance Dashboard',
          subtitle: 'Manage AI compliance and risk'
        };
    }
  };

  const welcome = getRoleBasedWelcome();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Mode Banner */}
      <div className="bg-blue-600 text-white px-4 py-2 text-center text-sm flex justify-between items-center">
        <div>
          🚀 <strong>Demo Mode</strong> - This is a demonstration of the AI Governance Dashboard. 
          All data is simulated for demo purposes.
        </div>
        <button
          onClick={() => setShowTour(true)}
          className="bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded text-xs font-medium"
        >
          Take Tour
        </button>
      </div>
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="border-b border-gray-200 pb-5">
            <h1 className="text-2xl font-bold leading-6 text-gray-900">
              {welcome.title}
            </h1>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              {welcome.subtitle}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Compliance Gauge - Takes up 2 columns on large screens */}
            <div className="lg:col-span-2" id="compliance-gauge">
              <ComplianceGauge 
                complianceRate={stats.complianceRate} 
                stats={stats}
              />
            </div>

            {/* Quick Stats */}
            <div className="space-y-4" id="role-actions">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">High-Risk Models:</span>
                    <span className="font-medium text-red-600">
                      {models.filter(m => m.riskTier === 'High-Risk').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Limited Risk:</span>
                    <span className="font-medium text-yellow-600">
                      {models.filter(m => m.riskTier === 'Limited').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Minimal Risk:</span>
                    <span className="font-medium text-green-600">
                      {models.filter(m => m.riskTier === 'Minimal').length}
                    </span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">Needs Review:</span>
                      <span className="font-bold text-orange-600">
                        {models.filter(m => m.complianceStatus === 'Pending' || m.complianceStatus === 'Failed').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role-specific actions */}
              {userProfile?.role === 'Developer' && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Developer Tips</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Onboard models early in development</li>
                    <li>• High-risk models need DPO approval</li>
                    <li>• Document use cases clearly</li>
                  </ul>
                </div>
              )}

              {userProfile?.role === 'DPO' && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-purple-900 mb-2">DPO Actions</h4>
                  <ul className="text-xs text-purple-700 space-y-1">
                    <li>• Review pending models below</li>
                    <li>• Approve/reject compliance status</li>
                    <li>• Focus on high-risk models first</li>
                  </ul>
                </div>
              )}

              {userProfile?.role === 'Executive' && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-900 mb-2">Executive Actions</h4>
                  <ul className="text-xs text-green-700 space-y-1 mb-3">
                    <li>• Monitor overall compliance rate</li>
                    <li>• Track high-risk model approvals</li>
                    <li>• Ensure regulatory readiness</li>
                  </ul>
                  <button 
                    onClick={() => {
                      const csvData = models.map(m => 
                        `${m.name},${m.riskTier},${m.complianceStatus},${m.dpoSignOff ? 'Yes' : 'No'},${m.lastUpdated}`
                      ).join('\n');
                      const blob = new Blob([`Model Name,Risk Tier,Compliance Status,DPO Approved,Last Updated\n${csvData}`], 
                        { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'ai-compliance-report.csv';
                      a.click();
                    }}
                    className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                  >
                    Export Report
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Onboard Form - Only show for Developers */}
          {userProfile?.role === 'Developer' && (
            <div className="mb-8" id="onboard-form">
              <OnboardForm />
            </div>
          )}

          {/* Model Registry */}
          <div id="model-registry">
            <ModelRegistry />
          </div>
        </div>
      </div>

      {/* Demo Tour */}
      <DemoTour isOpen={showTour} onClose={() => setShowTour(false)} />
    </div>
  );
}

export default Dashboard;