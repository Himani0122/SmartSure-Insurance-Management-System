// React modal component for filing an insurance claim in the SmartSure application

import React, { useState, useRef, useMemo } from 'react';
import { X, FileText, Upload, CheckCircle, Info, Loader } from 'lucide-react';

const ClaimModal = ({ isOpen, onClose, onSubmit, policies = [] }) => {
  const [formData, setFormData] = useState({
    policyId: policies.length > 0 ? policies[0].id : '',
    description: '',
    claimAmount: '',
    idempotencyKey: `CLAIM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Always reactive to policyId changes
  const selectedPolicy = useMemo(
    () => policies.find(p => String(p.id) === String(formData.policyId)),
    [policies, formData.policyId]
  );
  const maxClaimAmount = selectedPolicy?.coverageAmount ?? null;

  const validate = () => {
    const errs = {};
    if (!formData.policyId) errs.policyId = 'Select a policy';
    if (!formData.description.trim() || formData.description.length < 10)
      errs.description = 'Description required (10+ characters)';

    const amount = parseFloat(formData.claimAmount);
    if (!formData.claimAmount || isNaN(amount) || amount <= 0)
      errs.claimAmount = 'Valid claim amount required (must be > 0)';
    else if (maxClaimAmount !== null && amount > maxClaimAmount)
      errs.claimAmount = `Claim amount cannot exceed the policy coverage of ₹${Number(maxClaimAmount).toLocaleString()}`;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        policyId: parseInt(formData.policyId),
        description: formData.description,
        claimAmount: parseFloat(Number(formData.claimAmount).toFixed(2)),
        idempotencyKey: formData.idempotencyKey,
        file: file
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // When policy changes, clear claimAmount to force re-entry
    if (name === 'policyId') {
      setFormData({ ...formData, policyId: value, claimAmount: '' });
      setErrors({ ...errors, policyId: '', claimAmount: '' });
      return;
    }

    setFormData({ ...formData, [name]: value });

    // Real-time validation for claimAmount
    if (name === 'claimAmount') {
      const amount = parseFloat(value);
      const newErrors = { ...errors, claimAmount: '' };
      if (value && !isNaN(amount)) {
        if (amount <= 0) {
          newErrors.claimAmount = 'Claim amount must be greater than 0';
        } else if (maxClaimAmount !== null && amount > maxClaimAmount) {
          newErrors.claimAmount = `Cannot exceed policy coverage of ₹${Number(maxClaimAmount).toLocaleString()}`;
        }
      }
      setErrors(newErrors);
      return;
    }

    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '0', maxWidth: '600px' }}>
        <div style={{ background: 'linear-gradient(to right, var(--color-primary-600), var(--color-primary-800))', color: 'white', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={24} />
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Initiate Insurance Claim</h2>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ color: 'white', opacity: 0.8, padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ background: 'var(--color-primary-50)', padding: '0.75rem 1rem', borderRadius: 'var(--border-radius-md)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Info size={18} style={{ color: 'var(--color-primary-600)', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-primary-700)', margin: 0 }}>
                Filing a claim will initiate a draft. You can add more documents later before final submission.
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Policy to Claim Against</label>
              <select 
                name="policyId" 
                className="form-input"
                style={{ borderColor: errors.policyId ? 'var(--color-danger)' : undefined }}
                value={formData.policyId} 
                onChange={handleChange} 
              >
                <option value="">Select your policy...</option>
                {policies.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (ID: {p.id}) — ₹{p.basePremium?.toLocaleString()}
                  </option>
                ))}
              </select>
              {errors.policyId && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.policyId}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Claim Amount (₹)</label>
              <input 
                type="text" 
                name="claimAmount" 
                className="form-input"
                placeholder="How much are you claiming for?"
                style={{ borderColor: errors.claimAmount ? 'var(--color-danger)' : undefined }}
                value={formData.claimAmount} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
                    handleChange(e);
                  }
                }}
              />
              {errors.claimAmount
                ? <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.claimAmount}</span>
                : maxClaimAmount !== null && (
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    Max allowed: ₹{Number(maxClaimAmount).toLocaleString()} (policy coverage limit)
                  </span>
                )}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Reason for Claim</label>
              <textarea 
                name="description" 
                className="form-input"
                style={{ resize: 'none', borderColor: errors.description ? 'var(--color-danger)' : undefined }}
                placeholder="Please describe the incident or reason for this claim in detail..."
                value={formData.description} 
                onChange={handleChange} 
                rows={4} 
              />
              {errors.description && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.description}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Supporting Document</label>
              <div 
                onClick={() => fileInputRef.current.click()}
                style={{
                  border: '2px dashed var(--border-strong)',
                  borderRadius: 'var(--border-radius-lg)',
                  padding: '2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: file ? 'var(--color-success-bg)' : 'var(--bg-body)'
                }}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                  accept=".pdf,.png,.jpg,.jpeg"
                />
                {file ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={32} style={{ color: 'var(--color-success)' }} />
                    <span style={{ fontWeight: 600 }}>{file.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB • Click to change
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <Upload size={32} style={{ color: 'var(--text-secondary)' }} />
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Click to browse or drag & drop</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>PDF, PNG, or JPG (max 5MB)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group" style={{ opacity: 0.6, marginBottom: 0 }}>
              <label className="form-label">Reference Key</label>
              <input 
                name="idempotencyKey" 
                className="form-input"
                value={formData.idempotencyKey} 
                readOnly 
                style={{ backgroundColor: 'var(--bg-body)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}
              />
            </div>
          </div>

          <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-hover)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ padding: '0.75rem 2rem', borderRadius: 'var(--border-radius-full)' }}
            >
              {loading ? <><Loader size={18} className="animate-spin" /> Processing...</> : 'Initiate Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimModal;








