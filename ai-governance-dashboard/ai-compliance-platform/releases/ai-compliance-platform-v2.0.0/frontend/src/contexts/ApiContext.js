/**
 * API Context for AI Compliance Platform
 */

import React, { createContext, useContext } from 'react';
import axios from 'axios';

const ApiContext = createContext();

export function useApi() {
  return useContext(ApiContext);
}

export function ApiProvider({ children }) {
  // Organizations API
  const getOrganizations = async () => {
    try {
      const response = await axios.get('/organizations');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch organizations' };
    }
  };

  const createOrganization = async (orgData) => {
    try {
      const response = await axios.post('/organizations', orgData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to create organization' };
    }
  };

  // Assessments API
  const getAssessments = async () => {
    try {
      const response = await axios.get('/assessments');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch assessments' };
    }
  };

  const createAssessment = async (assessmentData) => {
    try {
      const response = await axios.post('/assessments', assessmentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to create assessment' };
    }
  };

  const updateAssessment = async (assessmentId, assessmentData) => {
    try {
      const response = await axios.put(`/assessments/${assessmentId}`, assessmentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to update assessment' };
    }
  };

  // Guardrails API
  const getGuardrails = async () => {
    try {
      const response = await axios.get('/guardrails');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch guardrails' };
    }
  };

  const createGuardrail = async (guardrailData) => {
    try {
      const response = await axios.post('/guardrails', guardrailData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to create guardrail' };
    }
  };

  const updateGuardrail = async (guardrailId, guardrailData) => {
    try {
      const response = await axios.put(`/guardrails/${guardrailId}`, guardrailData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to update guardrail' };
    }
  };

  const filterContent = async (content, context = {}, industryProfile = 'financial_services', jurisdiction = 'US', modelId = null) => {
    try {
      const requestData = {
        content,
        context,
        industry_profile: industryProfile,
        jurisdiction
      };
      
      // Add model_id if provided for LLM assessment
      if (modelId) {
        requestData.model_id = modelId;
      }
      
      const response = await axios.post('/guardrails/filter', requestData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to filter content' };
    }
  };

  // AI Models API for LLM Assessment
  const getModels = async (industryProfile = null) => {
    try {
      const url = industryProfile ? `/models?industry_profile=${industryProfile}` : '/models';
      const response = await axios.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch models' };
    }
  };

  const getModelDetails = async (modelId) => {
    try {
      const response = await axios.get(`/models/${modelId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch model details' };
    }
  };

  const getModelConfiguration = async (modelId) => {
    try {
      const response = await axios.get(`/models/${modelId}/configuration`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch model configuration' };
    }
  };

  const updateModelConfiguration = async (modelId, configData) => {
    try {
      const response = await axios.put(`/models/${modelId}/configuration`, configData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to update model configuration' };
    }
  };

  // Generic API call helper
  const apiCall = async (endpoint, method = 'GET', data = null) => {
    try {
      const config = {
        method,
        url: endpoint
      };
      
      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.data = data;
      }
      
      const response = await axios(config);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || `Failed to ${method} ${endpoint}` };
    }
  };

  // Dashboard API
  const getDashboardData = async () => {
    try {
      const response = await axios.get('/compliance/dashboard');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch dashboard data' };
    }
  };

  // Audit Trail API
  const getAuditTrail = async (limit = 100) => {
    try {
      const response = await axios.get(`/audit-trail?limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch audit trail' };
    }
  };

  const value = {
    // Organizations
    getOrganizations,
    createOrganization,
    
    // Assessments
    getAssessments,
    createAssessment,
    updateAssessment,
    
    // Guardrails
    getGuardrails,
    createGuardrail,
    updateGuardrail,
    filterContent,
    
    // AI Models for LLM Assessment
    getModels,
    getModelDetails,
    getModelConfiguration,
    updateModelConfiguration,
    
    // Dashboard
    getDashboardData,
    
    // Audit Trail
    getAuditTrail,
    
    // Generic API helper
    apiCall
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
}