import React, { useState } from 'react';
import { useModels } from '../contexts/ModelContext';
import { PlusIcon } from '@heroicons/react/24/outline';

function OnboardForm() {
  const { addModel, classifyRisk } = useModels();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    useCase: '',
    description: '',
    customUseCase: ''
  });

  const predefinedUseCases = [
    // High-Risk Use Cases
    'Credit Scoring',
    'Fraud Detection', 
    'Hiring',
    'Medical Diagnosis',
    'Legal Decision',
    'Insurance Underwriting',
    
    // Limited Risk Use Cases  
    'Chatbot',
    'Content Moderation',
    'Document Processing',
    'Translation',
    'Sentiment Analysis',
    'Code Generation',
    'Code Review',
    'Text Summarization',
    'Question Answering',
    
    // Minimal Risk Use Cases
    'Recommendation',
    'Search Enhancement',
    'Data Analytics',
    'Content Classification',
    'Language Detection',
    'Spell Checking',
    
    // AI Model Specific Use Cases
    'Large Language Model (LLM)',
    'Code Assistant',
    'Conversational AI',
    'Text Generation',
    'Embedding Generation',
    'Fine-tuned Model',
    'Custom'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const useCase = formData.useCase === 'Custom' ? formData.customUseCase : formData.useCase;
    const modelData = {
      name: formData.name,
      useCase,
      description: formData.description
    };

    const result = await addModel(modelData);
    
    if (result.success) {
      // Show success message
      alert('Model successfully onboarded! It will appear in the registry below.');
      
      // Reset form
      setFormData({
        name: '',
        useCase: '',
        description: '',
        customUseCase: ''
      });
      setIsOpen(false);
    } else {
      alert('Error adding model: ' + result.error);
    }
    
    setLoading(false);
  };

  const getPreviewRiskTier = () => {
    const useCase = formData.useCase === 'Custom' ? formData.customUseCase : formData.useCase;
    if (useCase) {
      return classifyRisk(useCase);
    }
    return 'Unknown';
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

  if (!isOpen) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <PlusIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No new models</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by onboarding a new AI model.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Onboard New Model
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Onboard New AI Model</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <span className="sr-only">Close</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Model Name *
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="e.g., Credit Risk Scorer"
          />
        </div>

        <div>
          <label htmlFor="useCase" className="block text-sm font-medium text-gray-700">
            Use Case *
          </label>
          <select
            name="useCase"
            id="useCase"
            required
            value={formData.useCase}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="">Select a use case</option>
            {predefinedUseCases.map((useCase) => (
              <option key={useCase} value={useCase}>
                {useCase}
              </option>
            ))}
          </select>
        </div>

        {formData.useCase === 'Custom' && (
          <div>
            <label htmlFor="customUseCase" className="block text-sm font-medium text-gray-700">
              Custom Use Case *
            </label>
            <input
              type="text"
              name="customUseCase"
              id="customUseCase"
              required
              value={formData.customUseCase}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Describe your custom use case"
            />
          </div>
        )}

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Brief description of the model and its purpose"
          />
        </div>

        {(formData.useCase || formData.customUseCase) && (
          <div className="bg-gray-50 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Risk Assessment Preview</h4>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Predicted Risk Tier:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskTierColor(getPreviewRiskTier())}`}>
                {getPreviewRiskTier()}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Risk tier is automatically determined based on the use case. High-risk models require additional compliance checks.
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Model'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default OnboardForm;