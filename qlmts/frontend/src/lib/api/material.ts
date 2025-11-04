import axios from 'axios';
import { HeatFormData, BatchFormData, SplitBatchFormData, HeatQueryData } from '../validations/material';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or refresh token
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Heat API functions
export const heatApi = {
  async create(data: HeatFormData) {
    const response = await api.post('/materials/heats', data);
    return response.data;
  },

  async getAll(params: Partial<HeatQueryData> = {}) {
    const response = await api.get('/materials/heats', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/materials/heats/${id}`);
    return response.data;
  },

  async update(id: string, data: Partial<HeatFormData>) {
    const response = await api.patch(`/materials/heats/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/materials/heats/${id}`);
    return response.data;
  },

  async getLineage(heatId: string) {
    const response = await api.get(`/materials/heats/${heatId}/lineage`);
    return response.data;
  },
};

// Batch API functions
export const batchApi = {
  async create(data: BatchFormData) {
    const response = await api.post('/materials/batches', data);
    return response.data;
  },

  async getAll(params: any = {}) {
    const response = await api.get('/materials/batches', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/materials/batches/${id}`);
    return response.data;
  },

  async split(id: string, data: SplitBatchFormData) {
    const response = await api.post(`/materials/batches/${id}/split`, data);
    return response.data;
  },
};

// Supplier API functions (for dropdowns)
export const supplierApi = {
  async getAll() {
    const response = await api.get('/suppliers');
    return response.data;
  },
};