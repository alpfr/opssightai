'use client';

import React, { useState } from 'react';
import { PhysicianMobileDashboard } from '@/components/physician-mobile-dashboard';
import type { UrgencyLevel } from '@/components/physician-mobile-dashboard';

/**
 * Example Page: Physician's Mobile Dashboard
 * 
 * Demonstrates the usage of the PhysicianMobileDashboard component
 * with different urgency levels and patient scenarios.
 */
export default function PhysicianDashboardExample() {
  const [selectedExample, setSelectedExample] = useState<number>(0);

  const examples = [
    {
      name: 'High Urgency - Cardiac Event',
      urgency: 'High' as UrgencyLevel,
      chiefComplaint: 'Severe chest pain radiating to left arm, shortness of breath',
      painScale: 9,
      historicalContext: [
        'Previous MI in 2020',
        'Hypertension diagnosed 2018',
        'Family history of heart disease'
      ]
    },
    {
      name: 'Medium Urgency - Abdominal Pain',
      urgency: 'Medium' as UrgencyLevel,
      chiefComplaint: 'Persistent abdominal pain, nausea for 2 days',
      painScale: 6,
      historicalContext: 'History of gastritis, last episode 6 months ago'
    },
    {
      name: 'Low Urgency - Follow-up',
      urgency: 'Low' as UrgencyLevel,
      chiefComplaint: 'Routine follow-up for diabetes management',
      painScale: 2,
      historicalContext: [
        'Type 2 Diabetes since 2015',
        'Well-controlled with medication',
        'Last HbA1c: 6.8%'
      ]
    },
    {
      name: 'High Urgency - Trauma',
      urgency: 'High' as UrgencyLevel,
      chiefComplaint: 'Motor vehicle accident, head trauma, loss of consciousness',
      painScale: 8,
      historicalContext: []
    }
  ];

  const currentExample = examples[selectedExample];

  const handleOrderMRI = () => {
    alert('MRI order initiated for patient');
    console.log('Order MRI clicked');
  };

  const handleGenerateReferral = () => {
    alert('Specialist referral generated');
    console.log('Generate Referral clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-deep-slate mb-2">
            Physician's Mobile Dashboard
          </h1>
          <p className="text-gray-600">
            Interactive examples demonstrating the dashboard component with different patient scenarios
          </p>
        </div>

        {/* Example Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Patient Scenario:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => setSelectedExample(index)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${selectedExample === index
                    ? 'bg-healing-teal text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }
                `}
              >
                {example.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Component */}
        <PhysicianMobileDashboard
          urgency={currentExample.urgency}
          chiefComplaint={currentExample.chiefComplaint}
          painScale={currentExample.painScale}
          historicalContext={currentExample.historicalContext}
          onOrderMRI={handleOrderMRI}
          onGenerateReferral={handleGenerateReferral}
        />

        {/* Code Example */}
        <div className="mt-8 bg-gray-900 rounded-lg p-6 overflow-x-auto">
          <h2 className="text-lg font-semibold text-white mb-4">Code Example:</h2>
          <pre className="text-sm text-green-400">
{`<PhysicianMobileDashboard
  urgency="${currentExample.urgency}"
  chiefComplaint="${currentExample.chiefComplaint}"
  painScale={${currentExample.painScale}}
  historicalContext={${JSON.stringify(currentExample.historicalContext, null, 2)}}
  onOrderMRI={() => console.log('Order MRI')}
  onGenerateReferral={() => console.log('Generate Referral')}
/>`}
          </pre>
        </div>

        {/* Features List */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-deep-slate mb-4">Features</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-healing-teal mr-2">✓</span>
              <span>Color-coded urgency badges (Red/Amber/Teal)</span>
            </li>
            <li className="flex items-start">
              <span className="text-healing-teal mr-2">✓</span>
              <span>Pain scale display with severity color coding</span>
            </li>
            <li className="flex items-start">
              <span className="text-healing-teal mr-2">✓</span>
              <span>Historical context with flexible string/array input</span>
            </li>
            <li className="flex items-start">
              <span className="text-healing-teal mr-2">✓</span>
              <span>Touch-optimized action buttons (48px minimum)</span>
            </li>
            <li className="flex items-start">
              <span className="text-healing-teal mr-2">✓</span>
              <span>WCAG 2.1 AA accessibility compliance</span>
            </li>
            <li className="flex items-start">
              <span className="text-healing-teal mr-2">✓</span>
              <span>Mobile-first responsive design</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
