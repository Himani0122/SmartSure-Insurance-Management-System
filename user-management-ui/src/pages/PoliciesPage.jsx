import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { policyService, claimsService } from '../services/api';
import { openRazorpayCheckout } from '../services/razorpay';
import PolicyModal from '../components/PolicyModal';
import ClaimModal from '../components/ClaimModal';
import {
  Shield, Search, Plus, Filter,
  Calendar, Tag, Loader,
  ShoppingCart, Eye, Edit, Trash2, X, FilePlus, CheckCircle, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const TYPES = ['ALL', 'HEALTH', 'LIFE', 'VEHICLE', 'PROPERTY', 'OTHER'];
const TABS = ['All Policies', 'Active', 'Expired'];

const PoliciesPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMyPolicies, setShowMyPolicies] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [editPolicy, setEditPolicy] = useState(null);
  const [purchasedIds, setPurchasedIds] = useState([]);
  const [claimedPolicyIds, setClaimedPolicyIds] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [purchaseConfirm, setPurchaseConfirm] = useState(null);

  useEffect(() => { 
    fetchPolicies();
    if (!isAdmin && user) {
      fetchPurchasedIds();
      fetchClaimedPolicyIds();
    }
  }, []);

  const fetchClaimedPolicyIds = async () => {
    try {
      const res = await claimsService.getUserClaims(user.username);
      setClaimedPolicyIds((res.data || []).map(c => c.policyId));
    } catch (err) { console.error('Failed to fetch claims', err); }
  };

  const fetchPurchasedIds = async () => {
    try {
      const res = await policyService.getUserPolicies(user.username);
      setPurchasedIds((res.data || []).map(p => p.id));
    } catch (err) { console.error('Failed to fetch purchased policies', err); }
  };

  useEffect(() => { applyFilters(); }, [policies, activeTab, typeFilter, searchQuery, showMyPolicies]);

  const fetchPolicies = async () => {
    setLoading(true);
    try { const res = await policyService.getAll(); setPolicies(res.data || []); }
    catch (err) { toast.error('Failed to load policies'); }
    finally { setLoading(false); }
  };

  const fetchMyPolicies = async () => {
    setLoading(true);
    try { const res = await policyService.getUserPolicies(user.username); setPolicies(res.data || []); setShowMyPolicies(true); }
    catch (err) { toast.error('Failed to load your policies'); }
    finally { setLoading(false); }
  };

  const applyFilters = () => {
    let result = [...policies];
    if (activeTab === 1) result = result.filter(p => p.status === 'ACTIVE');
    else if (activeTab === 2) result = result.filter(p => p.status === 'EXPIRED');
    if (typeFilter !== 'ALL') result = result.filter(p => p.type === typeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    setFiltered(result);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) { fetchPolicies(); return; }
    setLoading(true);
    try { const res = await policyService.search(searchQuery); setPolicies(res.data || []); }
    catch (err) { toast.error('Search failed'); }
    finally { setLoading(false); }
  };

  const initiatePurchase = (policy) => {
    setPurchaseConfirm(policy);
  };

  const handlePurchase = async () => {
    if (!purchaseConfirm) return;
    const id = purchaseConfirm.id;
    setActionLoading(id);
    
    const amountInPaise = Math.round(purchaseConfirm.basePremium * 100);
    openRazorpayCheckout({
      orderId: null,
      amount: amountInPaise,
      currency: 'INR',
      policyName: purchaseConfirm.name,
      userName: user.username,
      onSuccess: async (paymentData) => {
        try {
          await policyService.purchase(id, user.username);
          toast.success('Payment successful! Policy purchased.');
          setPurchaseConfirm(null);
          setPurchasedIds(prev => [...prev, id]);
          fetchPurchasedIds();
          fetchPolicies();
          navigate(`/payment-success?policyId=${id}`);
        } catch (err) {
          console.error(err);
          toast.error('Payment succeeded but backend failed to process.');
        } finally {
          setActionLoading(null);
        }
      },
      onFailure: (reason) => {
        toast.error(reason || 'Payment was not completed');
        setActionLoading(null);
      },
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this policy permanently?')) return;
    try { await policyService.delete(id); toast.success('Policy deleted'); fetchPolicies(); }
    catch (err) { toast.error('Delete failed'); }
  };

  const handleModalSubmit = async (data) => {
    try {
      if (editPolicy) { await policyService.update(editPolicy.id, data); toast.success('Policy updated'); }
      else { await policyService.create(data); toast.success('Policy created'); }
      setModalOpen(false); setEditPolicy(null); fetchPolicies();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };

  const handleClaimSubmit = async (data) => {
    const { file, ...claimData } = data;
    try {
      const res = await claimsService.initiate(claimData, user.username);
      if (file) await claimsService.addDocument(res.data.id, file, user.username);
      toast.success('Claim initiated successfully!');
      setClaimModalOpen(false);
      setClaimedPolicyIds(prev => [...prev, claimData.policyId]);
      navigate('/claims');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to initiate claim'); }
  };

  const typeIcon = (type) => {
    switch (type) {
      case 'HEALTH': return '🏥';
      case 'LIFE': return '❤️';
      case 'VEHICLE': return '🚗';
      case 'PROPERTY': return '🏠';
      default: return '📋';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Policies</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {!isAdmin && (
            <button
              className={`btn ${showMyPolicies ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { if (showMyPolicies) { setShowMyPolicies(false); fetchPolicies(); } else fetchMyPolicies(); }}
            >
              {showMyPolicies ? <><X size={16} /> All Policies</> : <><ShoppingCart size={16} /> My Policies</>}
            </button>
          )}
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => { setEditPolicy(null); setModalOpen(true); }}>
              <Plus size={16} /> Create Policy
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid var(--border-strong)', borderRadius: 'var(--border-radius-md)' }}>
          <Search size={18} style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text" placeholder="Search policies..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--bg-surface-hover)', padding: '0.25rem', borderRadius: 'var(--border-radius-lg)' }}>
          {TABS.map((tab, i) => (
            <button key={tab}
              style={{
                padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500, borderRadius: 'var(--border-radius-md)',
                backgroundColor: activeTab === i ? 'var(--color-primary-500)' : 'transparent',
                color: activeTab === i ? 'white' : 'var(--text-secondary)',
                boxShadow: activeTab === i ? 'var(--shadow-sm)' : 'none',
              }}
              onClick={() => { setActiveTab(i); setShowMyPolicies(false); fetchPolicies(); }}
            >{tab}</button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="form-input" style={{ width: 'auto', padding: '0.5rem 1rem' }}>
            {TYPES.map(t => <option key={t} value={t}>{t === 'ALL' ? 'All Types' : t}</option>)}
          </select>
        </div>
      </div>

      {/* Policies Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}><Loader className="animate-spin" style={{ margin: '0 auto 1rem' }} /> Loading policies...</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}><Shield size={48} style={{ color: 'var(--border-strong)', margin: '0 auto 1rem' }} /><h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No policies found</h3><p style={{ color: 'var(--text-secondary)' }}>Try adjusting your filters or search query.</p></div>
      ) : (
        <div className="grid-cols-3">
          {filtered.map((policy) => {
            const isPurchased = purchasedIds.includes(policy.id);
            const hasClaim = claimedPolicyIds.includes(policy.id);

            return (
              <div key={policy.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{typeIcon(policy.type)}</span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {isPurchased && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>Purchased</span>
                    )}
                    <span className={`badge badge-${policy.status?.toLowerCase()}`}>{policy.status}</span>
                  </div>
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>{policy.name}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', flex: 1, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{policy.description}</p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Tag size={14} /> {policy.type || 'N/A'}</span>
                  <span style={{ color: 'var(--color-primary-500)', fontWeight: 600 }}>₹{policy.basePremium?.toLocaleString()}</span>
                  {policy.expiryDate && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={14} /> {new Date(policy.expiryDate).toLocaleDateString()}</span>}
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-ghost" style={{ padding: '0.5rem 0.75rem' }} onClick={() => navigate(`/policies/${policy.id}`)}><Eye size={16} /> Details</button>
                  
                  {!isAdmin && policy.status === 'ACTIVE' && (
                    isPurchased ? (
                      hasClaim ? (
                        <button className="btn" style={{ color: 'var(--color-success)', padding: '0.5rem 0.75rem' }} onClick={() => navigate('/claims')}>
                          <CheckCircle size={16} /> Claim Filed
                        </button>
                      ) : (
                        <button className="btn btn-secondary" style={{ borderColor: 'var(--color-primary-500)', color: 'var(--color-primary-500)', padding: '0.5rem 0.75rem' }}
                          onClick={() => { setSelectedPolicy(policy); setClaimModalOpen(true); }}>
                          <FilePlus size={16} /> File Claim
                        </button>
                      )
                    ) : (
                      <button className="btn btn-primary" style={{ padding: '0.5rem 0.75rem' }} onClick={() => initiatePurchase(policy)} disabled={actionLoading === policy.id}>
                        {actionLoading === policy.id ? <Loader size={16} className="animate-spin" /> : <ShoppingCart size={16} />} Purchase
                      </button>
                    )
                  )}

                  {isAdmin && (
                    <>
                      <button className="btn btn-ghost" style={{ padding: '0.5rem 0.75rem' }} onClick={() => { setEditPolicy(policy); setModalOpen(true); }}><Edit size={16} /></button>
                      <button className="btn btn-ghost" style={{ color: 'var(--color-danger)', padding: '0.5rem 0.75rem' }} onClick={() => handleDelete(policy.id)}><Trash2 size={16} /></button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && <PolicyModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditPolicy(null); }} onSubmit={handleModalSubmit} policy={editPolicy} />}
      {claimModalOpen && <ClaimModal isOpen={claimModalOpen} onClose={() => setClaimModalOpen(false)} onSubmit={handleClaimSubmit} policies={[selectedPolicy]} />}

      {purchaseConfirm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '1.5rem', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Purchase Policy</h3>
              <button onClick={() => setPurchaseConfirm(null)} style={{ color: 'var(--text-secondary)' }}><X size={24} /></button>
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Shield size={32} />
              </div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{purchaseConfirm.name}</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Initial 1-month premium payment</p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-body)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Monthly Premium</span>
                <span style={{ fontWeight: 700 }}>₹{purchaseConfirm.basePremium?.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-strong)', fontWeight: 700, color: 'var(--color-primary-600)' }}>
                <span>Total Due Now</span>
                <span>₹{purchaseConfirm.basePremium?.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setPurchaseConfirm(null)}>Back</button>
              <button className="btn btn-primary" style={{ flex: 1, padding: '0.75rem' }} onClick={handlePurchase} disabled={actionLoading === purchaseConfirm.id}>
                {actionLoading === purchaseConfirm.id ? <Loader size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoliciesPage;
