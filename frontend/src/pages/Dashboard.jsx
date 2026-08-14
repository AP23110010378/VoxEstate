/**
 * Dashboard.jsx — Main Dashboard Page
 *
 * This is the primary view of the app. It combines:
 * - StatsBar (top) — campaign statistics
 * - TenantSelector (left) — company picker
 * - LeadsTable (right) — leads with status badges
 * - CampaignButton (bottom) — launch AI campaign
 *
 * Auto-polls every 5 seconds to refresh lead statuses.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mic, Activity, RefreshCw } from 'lucide-react';
import StatsBar from '../components/StatsBar';
import TenantSelector from '../components/TenantSelector';
import LeadsTable from '../components/LeadsTable';
import CampaignButton from '../components/CampaignButton';
import { getCompanies, getCustomers, startCampaign } from '../api/client';

export default function Dashboard({ onExitDashboard }) {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);

  // Fetch companies on mount
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const data = await getCompanies();
        setCompanies(data);
        // Auto-select first company if available
        if (data.length > 0) {
          setSelectedCompany(data[0]);
        }
      } catch (err) {
        console.error('Failed to fetch companies:', err);
        setError('Failed to load companies. Is the backend running?');
      }
    }
    fetchCompanies();
  }, []);

  // Fetch customers when company changes
  const fetchCustomers = useCallback(async () => {
    if (!selectedCompany) return;

    try {
      setLoading(true);
      const data = await getCustomers(selectedCompany.id);
      setCustomers(data);
      setLastRefresh(new Date());
      setError('');
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setError('Failed to load leads.');
    } finally {
      setLoading(false);
    }
  }, [selectedCompany]);

  // Fetch when company changes
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Auto-poll every 5 seconds for live status updates
  useEffect(() => {
    if (!selectedCompany) return;

    const interval = setInterval(() => {
      fetchCustomers();
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedCompany, fetchCustomers]);

  // Handle company selection
  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
    setCustomers([]); // Clear while loading
  };

  // Handle campaign launch
  const handleLaunchCampaign = async () => {
    if (!selectedCompany) return;

    try {
      const result = await startCampaign(selectedCompany.id);
      console.log('Campaign started:', result);
      // Refresh leads immediately after launch
      setTimeout(fetchCustomers, 1000);
    } catch (err) {
      console.error('Campaign failed:', err);
      const msg = err.response?.data?.detail || 'Campaign launch failed';
      alert(msg);
      throw err; // Re-throw so CampaignButton knows it failed
    }
  };

  return (
    <div className="min-h-screen mesh-gradient">
      {/* Header */}
      <header className="border-b border-white/5 bg-[var(--color-navy-900)]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onExitDashboard} className="flex items-center gap-3 group cursor-pointer text-left hover:opacity-80 transition-opacity bg-transparent border-none">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[var(--color-gold-500)] to-[var(--color-gold-400)] shadow-lg shadow-[var(--color-gold-500)]/20 group-hover:shadow-[var(--color-gold-500)]/40 transition-shadow">
              <Mic size={22} className="text-[var(--color-navy-950)]" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight text-[var(--color-text-primary)]">
                Prop<span className="gradient-text">Voice</span>
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Campaign Dashboard
              </p>
            </div>
          </button>

          <div className="flex items-center gap-4">
            {lastRefresh && (
              <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1.5">
                <Activity size={12} className="text-green-400" />
                Live — {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchCustomers}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-gold-400)] cursor-pointer"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-3 text-red-400 text-sm"
          >
            ⚠️ {error}
          </motion.div>
        )}

        {/* Stats Bar */}
        <section>
          <StatsBar customers={customers} />
        </section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Left Panel — Company Selector */}
          <aside>
            <TenantSelector
              companies={companies}
              selectedCompany={selectedCompany}
              onSelect={handleSelectCompany}
            />
          </aside>

          {/* Right Panel — Leads Table */}
          <section className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-['Outfit'] text-[var(--color-text-primary)]">
                  {selectedCompany ? `${selectedCompany.name} — Leads` : 'Select a Company'}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  {customers.length} total leads
                </p>
              </div>

              {/* Campaign Button */}
              <CampaignButton
                onLaunch={handleLaunchCampaign}
                disabled={!customers.some(c => c.status === 'PENDING')}
                selectedCompany={selectedCompany}
              />
            </div>

            {/* Leads Table */}
            <LeadsTable customers={customers} loading={loading && customers.length === 0} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-xs text-[var(--color-text-secondary)]">
          Built with FastAPI + LangGraph + Vapi.ai + MongoDB + React •
          Multi-Tenant Agentic Voice Orchestrator
        </div>
      </footer>
    </div>
  );
}
