/**
 * API Client for Email Agent Platform
 */
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        
        // Check if this is a 401 and we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          // Don't retry if this is the refresh endpoint itself
          if (originalRequest.url?.includes('/auth/refresh')) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject(error);
          }
          
          // Token expired, try to refresh
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('access_token', response.access_token);
              
              // Retry original request with new token
              if (originalRequest) {
                originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
                return this.client.request(originalRequest);
              }
            } catch (refreshError) {
              // Refresh failed, logout
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              window.location.href = '/login';
            }
          } else {
            // No refresh token, logout
            localStorage.removeItem('access_token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async register(email: string, password: string, full_name: string) {
    const response = await this.client.post('/auth/register', { email, password, full_name });
    return response.data;
  }

  async refreshToken(refresh_token: string) {
    const response = await this.client.post('/auth/refresh', { refresh_token });
    return response.data;
  }

  async logout() {
    const response = await this.client.post('/auth/logout');
    return response.data;
  }

  async resetPassword(email: string) {
    const response = await this.client.post('/auth/reset-password', { email });
    return response.data;
  }

  // Gmail OAuth
  async getGmailAuthUrl() {
    const response = await this.client.get('/gmail/oauth/authorize');
    return response.data;
  }

  async getGmailStatus() {
    const response = await this.client.get('/gmail/oauth/status');
    return response.data;
  }

  async disconnectGmail() {
    const response = await this.client.delete('/gmail/oauth/disconnect');
    return response.data;
  }

  // Email Management
  async searchEmails(query: string = '', maxResults: number = 100, pageToken?: string) {
    const response = await this.client.get('/emails/search', {
      params: { query, max_results: maxResults, page_token: pageToken },
    });
    return response.data;
  }

  async getEmail(emailId: string, format: string = 'full') {
    const response = await this.client.get(`/emails/${emailId}`, {
      params: { format },
    });
    return response.data;
  }

  async getEmailThread(emailId: string) {
    const response = await this.client.get(`/emails/${emailId}/thread`);
    return response.data;
  }

  async sendEmail(data: {
    to: string[];
    subject: string;
    body: string;
    cc?: string[];
    bcc?: string[];
    html?: boolean;
  }) {
    const response = await this.client.post('/emails/send', data);
    return response.data;
  }

  async createDraft(data: {
    to: string[];
    subject: string;
    body: string;
    cc?: string[];
    bcc?: string[];
    html?: boolean;
  }) {
    const response = await this.client.post('/emails/drafts', data);
    return response.data;
  }

  async updateDraft(draftId: string, data: {
    to: string[];
    subject: string;
    body: string;
    cc?: string[];
    bcc?: string[];
    html?: boolean;
  }) {
    const response = await this.client.put(`/emails/drafts/${draftId}`, data);
    return response.data;
  }

  async deleteDraft(draftId: string) {
    const response = await this.client.delete(`/emails/drafts/${draftId}`);
    return response.data;
  }

  async addLabels(emailId: string, labelIds: string[]) {
    const response = await this.client.post(`/emails/${emailId}/labels`, { label_ids: labelIds });
    return response.data;
  }

  async removeLabels(emailId: string, labelIds: string[]) {
    const response = await this.client.delete(`/emails/${emailId}/labels`, {
      data: { label_ids: labelIds },
    });
    return response.data;
  }

  async getLabels() {
    const response = await this.client.get('/emails/labels/list');
    return response.data;
  }

  // AI Agent
  async chatWithAgent(message: string, conversationId?: string) {
    const response = await this.client.post('/agent/chat', {
      message,
      conversation_id: conversationId,
    });
    return response.data;
  }

  async getConversationHistory(limit: number = 10) {
    const response = await this.client.get('/agent/history', {
      params: { limit },
    });
    return response.data;
  }

  async getConversation(conversationId: string) {
    const response = await this.client.get(`/agent/history/${conversationId}`);
    return response.data;
  }

  async deleteConversation(conversationId: string) {
    const response = await this.client.delete(`/agent/history/${conversationId}`);
    return response.data;
  }
}

export const apiClient = new ApiClient();
