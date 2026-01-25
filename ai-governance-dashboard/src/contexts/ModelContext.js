import React, { createContext, useContext, useState, useEffect } from 'react';

const ModelContext = createContext();

export function useModels() {
  return useContext(ModelContext);
}

export function ModelProvider({ children }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);

  // Demo data for MVP - Updated with modern AI models
  const demoModels = [
    {
      id: 'model-001',
      name: 'Llama3-70B Credit Scorer',
      useCase: 'Credit Scoring',
      riskTier: 'High-Risk',
      complianceStatus: 'Passed',
      dpoSignOff: true,
      createdAt: '2024-01-15',
      lastUpdated: '2024-01-20',
      description: 'Meta Llama3-70B fine-tuned for credit risk assessment in loan applications'
    },
    {
      id: 'model-002',
      name: 'Mistral-7B Support Assistant',
      useCase: 'Chatbot',
      riskTier: 'Limited',
      complianceStatus: 'Passed',
      dpoSignOff: true,
      createdAt: '2024-01-10',
      lastUpdated: '2024-01-18',
      description: 'Mistral-7B powered customer support chatbot with RAG capabilities'
    },
    {
      id: 'model-003',
      name: 'Qwen2-72B Fraud Detector',
      useCase: 'Fraud Detection',
      riskTier: 'High-Risk',
      complianceStatus: 'Failed',
      dpoSignOff: false,
      createdAt: '2024-01-12',
      lastUpdated: '2024-01-22',
      description: 'Alibaba Qwen2-72B model for real-time transaction fraud detection'
    },
    {
      id: 'model-004',
      name: 'Phi3-Mini Recommender',
      useCase: 'Recommendation',
      riskTier: 'Minimal',
      complianceStatus: 'Passed',
      dpoSignOff: true,
      createdAt: '2024-01-08',
      lastUpdated: '2024-01-16',
      description: 'Microsoft Phi3-Mini optimized for product recommendation systems'
    },
    {
      id: 'model-005',
      name: 'DeepSeek-Coder Document Processor',
      useCase: 'Document Processing',
      riskTier: 'Limited',
      complianceStatus: 'Pending',
      dpoSignOff: false,
      createdAt: '2024-01-20',
      lastUpdated: '2024-01-24',
      description: 'DeepSeek-Coder-33B for intelligent document classification and extraction'
    },
    {
      id: 'model-006',
      name: 'Llama3-8B Medical Assistant',
      useCase: 'Medical Diagnosis',
      riskTier: 'High-Risk',
      complianceStatus: 'Pending',
      dpoSignOff: false,
      createdAt: '2024-01-22',
      lastUpdated: '2024-01-24',
      description: 'Meta Llama3-8B fine-tuned for preliminary medical diagnosis support'
    },
    {
      id: 'model-007',
      name: 'Mistral-Large HR Screener',
      useCase: 'Hiring',
      riskTier: 'High-Risk',
      complianceStatus: 'Failed',
      dpoSignOff: false,
      createdAt: '2024-01-18',
      lastUpdated: '2024-01-23',
      description: 'Mistral-Large for automated resume screening and candidate evaluation'
    },
    {
      id: 'model-008',
      name: 'Qwen2-7B Content Moderator',
      useCase: 'Content Moderation',
      riskTier: 'Limited',
      complianceStatus: 'Passed',
      dpoSignOff: true,
      createdAt: '2024-01-14',
      lastUpdated: '2024-01-19',
      description: 'Qwen2-7B fine-tuned for social media content moderation and safety'
    },
    {
      id: 'model-009',
      name: 'Phi3-Medium Price Optimizer',
      useCase: 'Recommendation',
      riskTier: 'Minimal',
      complianceStatus: 'Passed',
      dpoSignOff: true,
      createdAt: '2024-01-11',
      lastUpdated: '2024-01-17',
      description: 'Microsoft Phi3-Medium for dynamic e-commerce pricing optimization'
    },
    {
      id: 'model-010',
      name: 'DeepSeek-V2 Code Assistant',
      useCase: 'Translation',
      riskTier: 'Limited',
      complianceStatus: 'Passed',
      dpoSignOff: true,
      createdAt: '2024-01-09',
      lastUpdated: '2024-01-15',
      description: 'DeepSeek-V2 for code translation and multi-language programming support'
    },
    {
      id: 'model-011',
      name: 'Llama3-405B Legal Advisor',
      useCase: 'Legal Decision',
      riskTier: 'High-Risk',
      complianceStatus: 'Pending',
      dpoSignOff: false,
      createdAt: '2024-01-25',
      lastUpdated: '2024-01-26',
      description: 'Meta Llama3-405B for legal document analysis and advisory support'
    },
    {
      id: 'model-012',
      name: 'Mistral-Nemo Sentiment Analyzer',
      useCase: 'Sentiment Analysis',
      riskTier: 'Limited',
      complianceStatus: 'Passed',
      dpoSignOff: true,
      createdAt: '2024-01-05',
      lastUpdated: '2024-01-12',
      description: 'Mistral-Nemo optimized for customer feedback sentiment analysis'
    }
  ];

  useEffect(() => {
    loadModels();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      // Try to load from localStorage first
      const savedModels = localStorage.getItem('ai-dashboard-models');
      if (savedModels) {
        setModels(JSON.parse(savedModels));
      } else {
        // Use demo data if no models in localStorage
        setModels(demoModels);
        localStorage.setItem('ai-dashboard-models', JSON.stringify(demoModels));
      }
    } catch (error) {
      console.log('Error loading models, using demo data');
      setModels(demoModels);
    }
    setLoading(false);
  };

  const addModel = async (modelData) => {
    try {
      // Risk classification logic
      const riskTier = classifyRisk(modelData.useCase);
      
      const newModel = {
        ...modelData,
        riskTier,
        complianceStatus: 'Pending',
        dpoSignOff: false,
        createdAt: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
        id: `model-${Date.now()}`
      };

      const updatedModels = [...models, newModel];
      setModels(updatedModels);
      
      // Save to localStorage
      localStorage.setItem('ai-dashboard-models', JSON.stringify(updatedModels));

      return { success: true, model: newModel };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateModel = async (modelId, updates) => {
    try {
      const updatedModel = {
        ...updates,
        lastUpdated: new Date().toISOString().split('T')[0]
      };

      const updatedModels = models.map(model => 
        model.id === modelId 
          ? { ...model, ...updatedModel }
          : model
      );
      
      setModels(updatedModels);
      
      // Save to localStorage
      localStorage.setItem('ai-dashboard-models', JSON.stringify(updatedModels));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Risk classification logic based on use case
  const classifyRisk = (useCase) => {
    const highRiskUseCases = [
      'Credit Scoring',
      'Fraud Detection',
      'Hiring',
      'Medical Diagnosis',
      'Legal Decision',
      'Insurance Underwriting'
    ];
    
    const limitedRiskUseCases = [
      'Chatbot',
      'Content Moderation',
      'Document Processing',
      'Translation',
      'Sentiment Analysis',
      'Code Generation',
      'Code Review',
      'Text Summarization',
      'Question Answering',
      'Large Language Model (LLM)',
      'Code Assistant',
      'Conversational AI',
      'Text Generation',
      'Fine-tuned Model'
    ];

    const minimalRiskUseCases = [
      'Recommendation',
      'Search Enhancement',
      'Data Analytics',
      'Content Classification',
      'Language Detection',
      'Spell Checking',
      'Embedding Generation'
    ];

    if (highRiskUseCases.some(risk => useCase.toLowerCase().includes(risk.toLowerCase()))) {
      return 'High-Risk';
    } else if (limitedRiskUseCases.some(risk => useCase.toLowerCase().includes(risk.toLowerCase()))) {
      return 'Limited';
    } else if (minimalRiskUseCases.some(risk => useCase.toLowerCase().includes(risk.toLowerCase()))) {
      return 'Minimal';
    } else {
      // Default classification for custom use cases
      return 'Limited';
    }
  };

  // Calculate compliance statistics
  const getComplianceStats = () => {
    const total = models.length;
    const passed = models.filter(m => m.complianceStatus === 'Passed').length;
    const failed = models.filter(m => m.complianceStatus === 'Failed').length;
    const pending = models.filter(m => m.complianceStatus === 'Pending').length;
    const dpoApproved = models.filter(m => m.dpoSignOff).length;

    return {
      total,
      passed,
      failed,
      pending,
      dpoApproved,
      complianceRate: total > 0 ? Math.round((passed / total) * 100) : 0
    };
  };

  const value = {
    models,
    loading,
    addModel,
    updateModel,
    loadModels,
    getComplianceStats,
    classifyRisk
  };

  return (
    <ModelContext.Provider value={value}>
      {children}
    </ModelContext.Provider>
  );
}