import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import {
  BarChart3, Users, Shield, FileText,
  TrendingUp, RefreshCcw, Loader
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import toast from 'react-hot-toast';

const CHART_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#14b8a6'];

const ReportsPage = () => {
  const [report, setReport] = useState({});
  const [claimsData, setClaimsData] = useState([]);
  const [policiesData, setPoliciesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [reportRes, claimsRes, policiesRes] = await Promise.all([
        adminService.getGeneralReport(),
        adminService.getClaimsReport(),
        adminService.getPoliciesReport(),
      ]);
      setReport(reportRes.data || {});
      setClaimsData(claimsRes.data || []);
      setPoliciesData(policiesRes.data || []);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const claimStatusChart = () => {
    const map = {};
    claimsData.forEach(c => { map[c.status] = (map[c.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  };

  const policyTypeChart = () => {
    const map = {};
    policiesData.forEach(p => {
      const type = p.type || 'OTHER';
      map[type] = (map[type] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}><Loader className="animate-spin" style={{ margin: '0 auto 1rem' }} /> Loading reports...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <button className="btn btn-secondary" onClick={fetchReports}>
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid-cols-4">
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h4>Total Users</h4>
            <p>{report.totalUsers || 0}</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(20, 184, 166, 0.1)', color: '#14b8a6' }}>
            <Shield size={24} />
          </div>
          <div className="stat-info">
            <h4>Total Policies</h4>
            <p>{report.totalPolicies || 0}</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <h4>Total Claims</h4>
            <p>{report.totalClaims || 0}</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h4>Approval Rate</h4>
            <p>
              {claimsData.length > 0
                ? Math.round((claimsData.filter(c => c.status === 'APPROVED').length / claimsData.length) * 100)
                : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card" style={{ padding: '0.5rem', display: 'flex', gap: '0.25rem' }}>
        {['overview', 'claims', 'policies'].map(tab => (
          <button key={tab}
            style={{
              padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500, borderRadius: 'var(--border-radius-md)',
              backgroundColor: activeTab === tab ? 'var(--color-primary-500)' : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--text-secondary)',
              textTransform: 'capitalize'
            }}
            onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {/* Charts */}
      {activeTab === 'overview' && (
        <div className="grid-cols-2">
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Claims Distribution</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={claimStatusChart()} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                    paddingAngle={4} dataKey="value">
                    {claimStatusChart().map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Policies by Type</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={policyTypeChart()} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }} cursor={{ fill: 'var(--bg-surface-hover)' }} />
                  <Bar dataKey="value" fill="var(--color-primary-500)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Claims Report Table */}
      {activeTab === 'claims' && (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Policy ID</th>
                  <th>User</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {claimsData.map(claim => (
                  <tr key={claim.id}>
                    <td><strong>#{claim.id}</strong></td>
                    <td>{claim.policyId}</td>
                    <td>{claim.username}</td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{claim.description}</td>
                    <td><span className={`badge badge-${claim.status?.toLowerCase()}`}>{claim.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {claimsData.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}><p>No claims data</p></div>}
        </div>
      )}

      {/* Policies Report Table */}
      {activeTab === 'policies' && (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Premium</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {policiesData.map(policy => (
                  <tr key={policy.id}>
                    <td><strong>#{policy.id}</strong></td>
                    <td>{policy.name}</td>
                    <td>{policy.type}</td>
                    <td>₹{policy.basePremium?.toLocaleString()}</td>
                    <td><span className={`badge badge-${policy.status?.toLowerCase()}`}>{policy.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {policiesData.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}><p>No policies data</p></div>}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
