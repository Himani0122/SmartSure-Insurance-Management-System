import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { claimsService, adminService, policyService } from '../services/api';
import ClaimModal from '../components/ClaimModal';
import {
  FileText, Plus, Filter, Eye, Send, XCircle,
  CheckCircle, X as XIcon, Clock, AlertCircle, Loader
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_TABS = ['ALL', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'];

const ClaimsPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [userPolicies, setUserPolicies] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { fetchClaims(); }, []);
  useEffect(() => { applyFilter(); }, [claims, activeStatus]);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      let res;
      if (isAdmin) {
        res = await adminService.getAllClaims();
      } else {
        res = await claimsService.getUserClaims(user.username);
      }
      setClaims(res.data || []);
    } catch (err) {
      toast.error('Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let result = claims;
    if (activeStatus !== 'ALL') {
      result = claims.filter(c => c.status === activeStatus);
    }
    setFiltered([...result].sort((a, b) => b.id - a.id));
  };

  const openNewClaim = async () => {
    try {
      const res = await policyService.getUserPolicies(user.username);
      setUserPolicies(res.data || []);
    } catch {
      try {
        const res = await policyService.getActive();
        setUserPolicies(res.data || []);
      } catch { setUserPolicies([]); }
    }
    setModalOpen(true);
  };

  const handleClaimSubmit = async (data) => {
    const { file, ...claimData } = data;
    try {
      const res = await claimsService.initiate(claimData, user.username);
      if (file) {
        await claimsService.addDocument(res.data.id, file, user.username);
      }
      setClaims(prev => [res.data, ...prev]); // Optimistic update
      toast.success('Claim initiated successfully!');
      setModalOpen(false);
      fetchClaims();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create claim');
    }
  };

  const handleSubmitClaim = async (id) => {
    setActionLoading(id);
    try {
      await claimsService.submit(id, user.username);
      toast.success('Claim submitted for review!');
      fetchClaims();
    } catch (err) {
      toast.error(err.response?.data || 'Submit failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelClaim = async (id) => {
    setActionLoading(id);
    try {
      await claimsService.cancel(id, user.username);
      toast.success('Claim cancelled');
      fetchClaims();
    } catch (err) {
      toast.error(err.response?.data || 'Cancel failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await adminService.approveClaim(id);
      toast.success('Claim approved');
      fetchClaims();
    } catch (err) {
      toast.error('Approve failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await adminService.rejectClaim(id);
      toast.success('Claim rejected');
      fetchClaims();
    } catch (err) {
      toast.error('Reject failed');
    } finally {
      setActionLoading(null);
    }
  };

  const statusIcon = (status) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle size={14} />;
      case 'REJECTED': return <XIcon size={14} />;
      case 'UNDER_REVIEW': case 'SUBMITTED': return <Clock size={14} />;
      case 'CANCELLED': return <XCircle size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Claims</h1>
        {!isAdmin && (
          <button className="btn btn-primary" onClick={openNewClaim}>
            <Plus size={16} /> File New Claim
          </button>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="card" style={{ padding: '0.5rem', display: 'flex', overflowX: 'auto', gap: '0.25rem' }}>
        {STATUS_TABS.map(status => (
          <button
            key={status}
            style={{
              padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500, borderRadius: 'var(--border-radius-md)',
              backgroundColor: activeStatus === status ? 'var(--color-primary-500)' : 'transparent',
              color: activeStatus === status ? 'white' : 'var(--text-secondary)',
              whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
            onClick={() => setActiveStatus(status)}
          >
            {status === 'ALL' ? 'All' : status}
            <span style={{ backgroundColor: activeStatus === status ? 'rgba(255,255,255,0.2)' : 'var(--bg-surface-hover)', padding: '0.125rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem' }}>
              {status === 'ALL' ? claims.length : claims.filter(c => c.status === status).length}
            </span>
          </button>
        ))}
      </div>

      {/* Claims Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}><Loader className="animate-spin" style={{ margin: '0 auto 1rem' }} /> Loading claims...</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
          <FileText size={48} style={{ color: 'var(--border-strong)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No claims found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{isAdmin ? 'No claims match the selected filter.' : 'You haven\'t filed any claims yet.'}</p>
          {!isAdmin && (
            <button className="btn btn-primary" onClick={openNewClaim}>
              <Plus size={16} /> File Your First Claim
            </button>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Policy ID</th>
                  {isAdmin && <th>User</th>}
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((claim) => (
                  <tr key={claim.id}>
                    <td><strong>#{claim.id}</strong></td>
                    <td>{claim.policyId}</td>
                    {isAdmin && <td>{claim.username}</td>}
                    <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{claim.description}</td>
                    <td>
                      <span className={`badge badge-${claim.status?.toLowerCase()}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        {statusIcon(claim.status)} {claim.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem' }} onClick={() => navigate(`/claims/${claim.id}`)}>
                          <Eye size={14} /> View
                        </button>
                        {!isAdmin && claim.status === 'DRAFT' && (
                          <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleSubmitClaim(claim.id)} disabled={actionLoading === claim.id}>
                            <Send size={14} /> Submit
                          </button>
                        )}
                        {!isAdmin && (claim.status === 'DRAFT' || claim.status === 'SUBMITTED') && (
                          <button className="btn btn-ghost" style={{ color: 'var(--color-danger)', padding: '0.25rem 0.5rem' }} onClick={() => handleCancelClaim(claim.id)} disabled={actionLoading === claim.id}>
                            <XCircle size={14} /> Cancel
                          </button>
                        )}
                        {isAdmin && (claim.status === 'UNDER_REVIEW' || claim.status === 'SUBMITTED') && (
                          <>
                            <button className="btn" style={{ backgroundColor: 'var(--color-success)', color: 'white', padding: '0.25rem 0.5rem' }} onClick={() => handleApprove(claim.id)} disabled={actionLoading === claim.id}>
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleReject(claim.id)} disabled={actionLoading === claim.id}>
                              <XIcon size={14} /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <ClaimModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleClaimSubmit}
          policies={userPolicies}
        />
      )}
    </div>
  );
};

export default ClaimsPage;
