import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Asset API
export const assetApi = {
  getAll: () => api.get('/assets'),
  getById: (id: string) => api.get(`/assets/${id}`),
  create: (asset: any) => api.post('/assets', asset),
  update: (id: string, asset: any) => api.put(`/assets/${id}`, asset),
  delete: (id: string) => api.delete(`/assets/${id}`),
};

// Sensor Data API
export const sensorDataApi = {
  ingest: (data: any) => api.post('/data', data),
  getByAsset: (assetId: string, params?: any) => api.get(`/data/${assetId}`, { params }),
};

// Risk API
export const riskApi = {
  calculate: (assetId: string, assetType: string) => 
    api.post('/risk/calculate', { assetId, assetType }),
  getCurrent: (assetId: string) => api.get(`/risk/${assetId}`),
  getHistory: (assetId: string, params?: any) => 
    api.get(`/risk/${assetId}/history`, { params }),
};

// Anomaly API
export const anomalyApi = {
  detect: (assetId: string, assetType: string) => 
    api.post('/anomalies/detect', { assetId, assetType }),
  getByAsset: (assetId: string, params?: any) => 
    api.get(`/anomalies/${assetId}`, { params }),
  getCritical: (params?: any) => 
    api.get('/anomalies/critical/all', { params }),
};

// Forecast API
export const forecastApi = {
  get: (assetId: string) => api.get(`/forecast/${assetId}`),
  refresh: (assetId: string) => api.post(`/forecast/${assetId}/refresh`),
};

// Summary API
export const summaryApi = {
  get: (plantId: string) => api.get(`/summary/${plantId}`),
  getHistory: (plantId: string, params?: any) => api.get(`/summary/${plantId}/history`, { params }),
};

// Notification API
export const notificationApi = {
  getAll: (params?: any) => api.get('/notifications', { params }),
  create: (notification: any) => api.post('/notifications', notification),
  markAsRead: (id: string, userId: string) => api.put(`/notifications/${id}/read`, { userId }),
  markAllAsRead: (userId: string) => api.put('/notifications/read-all', { userId }),
  getPreferences: (userId: string) => api.get('/notifications/preferences', { params: { userId } }),
  updatePreferences: (userId: string, preferences: any) => api.post('/notifications/preferences', { userId, preferences }),
};

// Health API
export const healthApi = {
  check: () => api.get('/health'),
};

export default api;
