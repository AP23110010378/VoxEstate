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

/**
 * Fetch all companies (tenants).
 * Used by TenantSelector to populate the company cards.
 */
export const getCompanies = async () => {
  const response = await api.get('/companies');
  return response.data;
};

/**
 * Fetch all customers/leads for a specific company.
 * Used by LeadsTable when a company is selected.
 */
export const getCustomers = async (companyId) => {
  const response = await api.get(`/customers?company_id=${companyId}`);
  return response.data;
};

/**
 * Start an AI voice campaign for a company.
 * Called when the manager clicks "Launch Campaign".
 */
export const startCampaign = async (companyId) => {
  const response = await api.post('/campaign/start', {
    company_id: companyId,
  });
  return response.data;
};

/**
 * Health check — verify backend is running.
 */
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
