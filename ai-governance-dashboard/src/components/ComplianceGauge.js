import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

function ComplianceGauge({ complianceRate, stats }) {
  const data = [
    { name: 'Compliant', value: complianceRate },
    { name: 'Non-Compliant', value: 100 - complianceRate }
  ];

  const COLORS = {
    'Compliant': '#22c55e',
    'Non-Compliant': '#e5e7eb'
  };

  const getRiskColor = (rate) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskLevel = (rate) => {
    if (rate >= 80) return 'Low Risk';
    if (rate >= 60) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Global Risk Overview
      </h3>
      
      <div className="flex items-center justify-between">
        <div className="gauge-container">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie
                data={data}
                cx={100}
                cy={100}
                startAngle={90}
                endAngle={-270}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={0}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="gauge-text">
            <div className={`text-2xl font-bold ${getRiskColor(complianceRate)}`}>
              {complianceRate}%
            </div>
            <div className="text-sm text-gray-500">Compliant</div>
          </div>
        </div>

        <div className="ml-8 space-y-4">
          <div>
            <div className={`text-lg font-semibold ${getRiskColor(complianceRate)}`}>
              {getRiskLevel(complianceRate)}
            </div>
            <div className="text-sm text-gray-500">Overall Risk Level</div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Models:</span>
              <span className="font-medium">{stats.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Passed:</span>
              <span className="font-medium text-green-600">{stats.passed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Failed:</span>
              <span className="font-medium text-red-600">{stats.failed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending:</span>
              <span className="font-medium text-yellow-600">{stats.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">DPO Approved:</span>
              <span className="font-medium text-blue-600">{stats.dpoApproved}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplianceGauge;