import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { policyService, claimsService } from '../services/api';
import { openRazorpayCheckout } from '../services/razorpay';
import { ArrowLeft, Shield, Tag, DollarSign, Calendar, ShoppingCart, XCircle, Loader, FilePlus, CheckCircle, X, Check } from 'lucide-react';
import ClaimModal from '../components/ClaimModal';
import toast from 'react-hot-toast';

const PolicyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [paidMonths, setPaidMonths] = useState(0);
  const [hasClaim, setHasClaim] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [purchaseConfirm, setPurchaseConfirm] = useState(false);

  useEffect(() => { fetchPolicy(); }, [id]);

  const fetchPolicy = async () => {
    setLoading(true);
    try {
      const policyRes = await policyService.getById(id);
      setPolicy(policyRes.data);
    } catch (err) {
      toast.error('Policy not found');
      navigate('/policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (policy && user && !isAdmin) {
      checkIfPurchased();
      checkIfClaimed();
      fetchPaymentStatus();
    }
  }, [policy, user, isAdmin]);

  const fetchPaymentStatus = async () => {
    try {
      const res = await policyService.getPaymentStatus(id, user.username);
      setPaidMonths(res.data);
    } catch (err) {
      console.error('Failed to fetch payment status', err);
    }
  };

  const checkIfClaimed = async () => {
    try {
      const res = await claimsService.getUserClaims(user.username);
      const claimed = (res.data || []).some(c => c.policyId === parseInt(id));
      setHasClaim(claimed);
    } catch (err) {
      console.error('Failed to check claim status', err);
    }
  };

  const checkIfPurchased = async () => {
    try {
      const res = await policyService.getUserPolicies(user.username);
      const purchased = (res.data || []).some(p => p.id === parseInt(id));
      setIsPurchased(purchased);
    } catch (err) {
      console.error('Failed to check purchase status', err);
    }
  };

  const handlePurchase = async () => {
    setActionLoading(true);
    const amountInPaise = Math.round(policy.basePremium * 100);
    
    openRazorpayCheckout({
      orderId: null,
      amount: amountInPaise,
      currency: 'INR',
      policyName: policy.name,
      userName: user.username,
      onSuccess: async (paymentData) => {
        try {
          await policyService.purchase(id, user.username);
          toast.success('Payment successful! Policy purchased.');
          setIsPurchased(true);
          setPaidMonths(1);
          setPurchaseConfirm(false);
          fetchPolicy();
          navigate(`/payment-success?policyId=${id}`);
        } catch (err) {
          console.error(err);
          toast.error('Payment succeeded but backend failed to process.');
        } finally {
          setActionLoading(false);
        }
      },
      onFailure: (reason) => {
        toast.error(reason || 'Payment was not completed');
        setActionLoading(false);
      },
    });
  };

  const handlePayPremium = async () => {
    setActionLoading(true);
    const amountInPaise = Math.round(policy.basePremium * 100);
    
    openRazorpayCheckout({
      orderId: null,
      amount: amountInPaise,
      currency: 'INR',
      policyName: `Premium: ${policy.name}`,
      userName: user.username,
      onSuccess: async (paymentData) => {
        try {
          await policyService.payPremium(id, user.username);
          toast.success('Premium payment successful!');
          fetchPaymentStatus();
        } catch (err) {
          toast.error('Payment succeeded but status update failed.');
        } finally {
          setActionLoading(false);
        }
      },
      onFailure: (reason) => {
        toast.error(reason || 'Payment failed');
        setActionLoading(false);
      },
    });
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this policy?')) return;
    setActionLoading(true);
    try {
      await policyService.cancel(id, user.username);
      toast.success('Policy cancelled');
      setIsPurchased(false);
      fetchPolicy();
    } catch (err) {
      toast.error(err.response?.data || 'Cancel failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClaimSubmit = async (data) => {
    const { file, ...claimData } = data;
    try {
      const res = await claimsService.initiate(claimData, user.username);
      if (file) {
        await claimsService.addDocument(res.data.id, file, user.username);
      }
      toast.success('Claim initiated successfully!');
      setClaimModalOpen(false);
      setHasClaim(true);
      navigate('/claims');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate claim');
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: 'var(--text-secondary)' }}><Loader className="animate-spin" style={{ marginBottom: '1rem' }} /> Loading policy...</div>;
  }

  if (!policy) return null;

  return (
    <div className="flex flex-col gap-6">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn btn-ghost" style={{ padding: '0.5rem' }} onClick={() => navigate('/policies')}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Policy Details</h1>
      </div>

      <div className="card" style={{ padding: 0, borderRadius: '24px', overflow: 'hidden' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #0072ff 0%, #00c6ff 100%)', 
          height: '140px', 
          position: 'relative',
          padding: '2rem'
        }}>
          <div style={{ 
            position: 'absolute', 
            bottom: '-32px', 
            left: '2rem',
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            backgroundColor: '#1e293b', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            border: '2px solid rgba(255,255,255,0.1)'
          }}>
            <Shield size={32} style={{ color: '#60a5fa' }} />
          </div>
        </div>

        <div style={{ padding: '4rem 2rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{policy.name}</h1>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>{policy.description}</p>
            </div>
            {!isAdmin && !isPurchased && (
              <button 
                className="btn btn-primary"
                style={{ padding: '0.75rem 2rem', borderRadius: '12px', fontWeight: 700 }}
                onClick={() => setPurchaseConfirm(true)}
                disabled={actionLoading}
              >
                Buy Now Securely
              </button>
            )}
            {isPurchased && (
              <span style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.875rem' }}>
                ✓ Active Policy
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'var(--bg-body)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Monthly Premium</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹{policy.basePremium?.toLocaleString()}</span>
            </div>
            <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'var(--bg-body)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Total Coverage</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹{(policy.coverageAmount || 400000)?.toLocaleString()}</span>
            </div>
            <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'var(--bg-body)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Duration</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{policy.durationMonths || 180} months</span>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Key Benefits Included</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {[
                'Cashless treatment at network hospitals',
                'Comprehensive coverage options',
                'No claim bonus for healthy years',
                '24x7 customer support access'
              ].map((benefit, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={12} />
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {!isAdmin && isPurchased && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Premium Payments Made</span>
                  <span style={{ fontWeight: 700 }}>{paidMonths} / {policy.durationMonths || 180}</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-body)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      backgroundColor: 'var(--color-primary-500)', 
                      width: `${(paidMonths / (policy.durationMonths || 180)) * 100}%` 
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-primary" onClick={handlePayPremium} disabled={actionLoading}>
                  <DollarSign size={18} /> Pay Premium
                </button>
                {paidMonths >= 2 ? (
                  hasClaim ? (
                    <button className="btn btn-secondary" onClick={() => navigate('/claims')}>
                      <CheckCircle size={18} /> View Claim
                    </button>
                  ) : (
                    <button className="btn btn-primary" style={{ backgroundColor: '#10b981', borderColor: '#10b981' }} onClick={() => setClaimModalOpen(true)}>
                      <FilePlus size={18} /> File Claim
                    </button>
                  )
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', borderRadius: '8px', backgroundColor: 'var(--bg-body)', border: '1px dashed var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Eligibility for claim: Pay 1 more month
                  </div>
                )}
                <button className="btn btn-ghost" style={{ border: '1px solid #ef444433', color: '#ef4444' }} onClick={handleCancel} disabled={actionLoading}>
                  <XCircle size={18} /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {purchaseConfirm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '1.5rem', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Purchase Policy</h3>
              <button onClick={() => setPurchaseConfirm(false)} style={{ color: 'var(--text-secondary)' }}><X size={24} /></button>
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Shield size={32} />
              </div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{policy.name}</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Initial 1-month premium payment</p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-body)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Monthly Premium</span>
                <span style={{ fontWeight: 700 }}>₹{policy.basePremium?.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-strong)', fontWeight: 700, color: 'var(--color-primary-600)' }}>
                <span>Total Due Now</span>
                <span>₹{policy.basePremium?.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setPurchaseConfirm(false)}>Back</button>
              <button className="btn btn-primary" style={{ flex: 1, padding: '0.75rem' }} onClick={handlePurchase} disabled={actionLoading}>
                {actionLoading ? <Loader size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}

      {claimModalOpen && (
        <ClaimModal
          isOpen={claimModalOpen}
          onClose={() => setClaimModalOpen(false)}
          onSubmit={handleClaimSubmit}
          policies={[policy]}
        />
      )}
    </div>
  );
};

export default PolicyDetailPage;
