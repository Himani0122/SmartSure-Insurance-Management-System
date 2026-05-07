import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { policyService, claimsService } from '../services/api';
import { CheckCircle, ArrowRight, Shield, FileText, Home, Loader } from 'lucide-react';
import ClaimModal from '../components/ClaimModal';
import toast from 'react-hot-toast';

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const policyId = queryParams.get('policyId');

  const [policy, setPolicy] = useState(null);
  const [paidMonths, setPaidMonths] = useState(0);
  const [loading, setLoading] = useState(true);
  const [claimModalOpen, setClaimModalOpen] = useState(false);

  useEffect(() => {
    if (!policyId) {
      navigate('/policies');
      return;
    }
    fetchData();
  }, [policyId]);

  const fetchData = async () => {
    try {
      const policyRes = await policyService.getById(policyId);
      setPolicy(policyRes.data);
      
      const paymentRes = await policyService.getPaymentStatus(policyId, user.username);
      setPaidMonths(paymentRes.data);
    } catch (err) {
      toast.error('Failed to load details');
    } finally {
      setLoading(false);
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
      navigate('/claims');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate claim');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}><Loader className="animate-spin" size={32} style={{ margin: '0 auto 1rem' }} /> Loading payment details...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem' }}>
      <div className="card" style={{ maxWidth: '600px', width: '100%', padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--color-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', animation: 'scaleIn 0.5s ease-out' }}>
          <CheckCircle size={48} style={{ color: 'var(--color-success)' }} />
        </div>
        
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Payment Successful!</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '2.5rem' }}>
          Your payment for <strong style={{ color: 'var(--text-primary)' }}>{policy?.name}</strong> has been processed successfully.
        </p>

        <div style={{ width: '100%', padding: '1.5rem', backgroundColor: 'var(--bg-body)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-subtle)', marginBottom: '2.5rem', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} style={{ color: 'var(--color-primary-500)' }} /> Next Steps
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            Your policy is now active. You can track your payment status in the dashboard.
            {paidMonths < 2 
              ? ' You will become eligible to file a claim after your next monthly payment.'
              : ' If you need to file a claim regarding this policy, you can do so immediately below.'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          {paidMonths >= 2 && (
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
              onClick={() => setClaimModalOpen(true)}
            >
              <FileText size={20} /> File a Claim Now
            </button>
          )}
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn btn-secondary" 
              style={{ flex: 1, padding: '0.875rem' }}
              onClick={() => navigate(`/policies/${policyId}`)}
            >
              <Shield size={18} /> View Policy
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ flex: 1, padding: '0.875rem' }}
              onClick={() => navigate('/dashboard')}
            >
              <Home size={18} /> Dashboard
            </button>
          </div>
        </div>
      </div>

      {claimModalOpen && policy && (
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

export default PaymentSuccessPage;
