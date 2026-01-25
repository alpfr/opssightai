import React, { useState } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const tourSteps = [
  {
    title: "Welcome to AI Governance Dashboard",
    content: "This demo showcases how organizations can manage AI model compliance and risk assessment according to regulations like the EU AI Act.",
    target: null
  },
  {
    title: "Global Risk Overview",
    content: "Monitor your organization's overall compliance rate and risk level at a glance. The gauge shows the percentage of compliant models.",
    target: "compliance-gauge"
  },
  {
    title: "Model Registry",
    content: "View all AI models in your organization with their risk tiers, compliance status, and DPO approvals. Filter and sort to focus on what matters.",
    target: "model-registry"
  },
  {
    title: "Role-Based Access",
    content: "Different user roles see different features. Developers can onboard models, DPOs can approve compliance, and Executives can monitor overall status.",
    target: "role-actions"
  },
  {
    title: "Onboard New Models",
    content: "Developers can easily add new AI models. The system automatically classifies risk tiers based on use cases.",
    target: "onboard-form"
  }
];

function DemoTour({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentTourStep = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Demo Tour ({currentStep + 1}/{tourSteps.length})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-2">
            {currentTourStep.title}
          </h4>
          <p className="text-sm text-gray-600">
            {currentTourStep.content}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Previous
          </button>

          <div className="flex space-x-1">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
            {currentStep < tourSteps.length - 1 && (
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DemoTour;