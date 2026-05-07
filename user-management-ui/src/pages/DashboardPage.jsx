import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { policyService, claimsService, adminService } from '../services/api';
import { Shield, FileText, Users, TrendingUp, ArrowRight, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import toast from 'react-hot-toast';

const CHART_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [reportRes, claimsRes, policiesRes] = await Promise.all([adminService.getGeneralReport(), adminService.getAllClaims(), adminService.getPoliciesReport()]);
        setStats(reportRes.data); setClaims(claimsRes.data || []); setPolicies(policiesRes.data || []);
      } else {
        const [userPolicies, userClaims] = await Promise.all([policyService.getUserPolicies(user.username), claimsService.getUserClaims(user.username)]);
        setPolicies(userPolicies.data || []); setClaims(userClaims.data || []);
        setStats({ 
          totalPolicies: (userPolicies.data || []).length, 
          totalClaims: (userClaims.data || []).length,
          pendingClaims: (userClaims.data || []).filter(c => c.status === 'UNDER_REVIEW' || c.status === 'SUBMITTED').length,
          approvedClaims: (userClaims.data || []).filter(c => c.status === 'APPROVED').length 
        });
      }
    } catch (error) { 
      console.error('Dashboard load error:', error); 
      toast.error('Failed to load dashboard'); 
    }
    finally { setLoading(false); }
  };

  const claimStatusData = () => { const m = {}; claims.forEach(c => { m[c.status] = (m[c.status] || 0) + 1; }); return Object.entries(m).map(([name, value]) => ({ name, value })); };
  const policyTypeData = () => { const m = {}; policies.forEach(p => { const t = p.type || 'OTHER'; m[t] = (m[t] || 0) + 1; }); return Object.entries(m).map(([name, value]) => ({ name, value })); };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--text-secondary)' }}><p>Loading dashboard...</p></div>;

  const adminCards = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers || 0, color: 'var(--color-primary-500)', bg: 'rgba(99, 102, 241, 0.15)' },
    { icon: Shield, label: 'Total Policies', value: stats.totalPolicies || 0, color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.1)' },
    { icon: FileText, label: 'Total Claims', value: stats.totalClaims || 0, color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
    { icon: Clock, label: 'Under Review', value: claims.filter(c => c.status === 'UNDER_REVIEW' || c.status === 'SUBMITTED').length, color: 'var(--color-danger)', bg: 'var(--color-danger-bg)' },
  ];
  const userCards = [
    { icon: Shield, label: 'My Policies', value: stats.totalPolicies || 0, color: 'var(--color-primary-500)', bg: 'rgba(99, 102, 241, 0.15)' },
    { icon: FileText, label: 'My Claims', value: stats.totalClaims || 0, color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.1)' },
    { icon: Clock, label: 'Under Review', value: stats.pendingClaims || 0, color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
    { icon: CheckCircle2, label: 'Approved', value: stats.approvedClaims || 0, color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
  ];
  const statCards = isAdmin ? adminCards : userCards;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome Card */}
      <div className="card" style={{ padding: '2rem', background: 'linear-gradient(to right, rgba(99, 102, 241, 0.15), transparent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Welcome back, <span style={{ color: 'var(--color-primary-500)' }}>{user?.username}</span> 👋
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>Here's what's happening with your {isAdmin ? 'platform' : 'insurance'} today.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {!isAdmin && (
              <>
                <button className="btn btn-primary" onClick={() => navigate('/policies')}><Shield size={16} /> Browse Policies</button>
                <button className="btn btn-secondary" onClick={() => navigate('/claims')}><FileText size={16} /> My Claims</button>
              </>
            )}
            {isAdmin && <button className="btn btn-primary" onClick={() => navigate('/reports')}><TrendingUp size={16} /> View Reports</button>}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {(isAdmin || policies.length > 0 || claims.length > 0) && (
        <div className="grid-cols-4">
          {statCards.map((card, i) => (
            <div key={i} className="card stat-card">
              <div className="stat-icon" style={{ backgroundColor: card.bg, color: card.color }}>
                <card.icon size={24} />
              </div>
              <div className="stat-info">
                <h4>{card.label}</h4>
                <p>{card.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid-cols-2">
        {claims.length > 0 && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Claims by Status</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={claimStatusData()} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                    {claimStatusData().map((_, index) => <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {policies.length > 0 && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Policies by Type</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={policyTypeData()} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }} cursor={{ fill: 'var(--bg-surface-hover)' }} />
                  <Bar dataKey="value" fill="var(--color-primary-500)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Recent Claims Table */}
      {claims.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Recent Claims</h3>
            <button className="btn btn-ghost" onClick={() => navigate('/claims')}>View All <ChevronRight size={16} /></button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th><th>Policy ID</th>{isAdmin && <th>User</th>}<th>Description</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...claims].sort((a, b) => b.id - a.id).slice(0, 5).map((claim) => (
                  <tr key={claim.id} onClick={() => navigate(`/claims/${claim.id}`)} style={{ cursor: 'pointer' }}>
                    <td><strong>#{claim.id}</strong></td>
                    <td>{claim.policyId}</td>
                    {isAdmin && <td>{claim.username}</td>}
                    <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{claim.description}</td>
                    <td><span className={`badge badge-${claim.status?.toLowerCase()}`}>{claim.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isAdmin && claims.length === 0 && policies.length === 0 && (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--color-primary-500)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Shield size={40} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Get Started with SmartSure</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Browse our insurance policies and purchase one to protect yourself.</p>
          <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }} onClick={() => navigate('/policies')}>
            <Shield size={18} /> Explore Policies <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
