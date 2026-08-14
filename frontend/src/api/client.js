/**
 * client.js — API Client (Axios)
 *
 * Centralized API calls to our FastAPI backend.
 * All components use these functions instead of calling fetch directly.
 * This makes it easy to change the base URL for production.
 */

import axios from 'axios';

// In dev, Vite proxy handles /companies → localhost:8000/companies
// In prod, set VITE_API_URL to your Cloud Run backend URL
const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Fetch all companies (tenants). */
export const getCompanies = async () => {
  const response = await api.get('/companies');
  return response.data;
};

/** Fetch customers/leads for a specific company (with optional pagination). */
export const getCustomers = async (companyId, skip = 0, limit = 100) => {
  const response = await api.get(`/customers?company_id=${companyId}&skip=${skip}&limit=${limit}`);
  return response.data;
};

/** Start an AI voice campaign for a company. */
export const startCampaign = async (companyId) => {
  const response = await api.post('/campaign/start', { company_id: companyId });
  return response.data;
};

/**
 * Reset all stuck CALL_INITIATED leads back to PENDING.
 * Use when a campaign crashes and leads are permanently stuck.
 */
export const resetCampaign = async (companyId) => {
  const response = await api.post('/campaign/reset', { company_id: companyId });
  return response.data;
};

/**
 * Fetch call logs (transcripts & outcomes) for a company.
 * Returns the 50 most recent logs, newest first.
 */
export const getCallLogs = async (companyId) => {
  const response = await api.get(`/campaign/call-logs?company_id=${companyId}`);
  return response.data;
};

/** Health check — verify backend is running. */
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
