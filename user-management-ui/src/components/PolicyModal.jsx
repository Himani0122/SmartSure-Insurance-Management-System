import React, { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';

const PolicyModal = ({ isOpen, onClose, onSubmit, policy }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePremium: '',
    type: 'HEALTH',
    status: 'ACTIVE',
    expiryDate: '',
    durationMonths: '',
    coverageAmount: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (policy) {
      setFormData({
        name: policy.name || '',
        description: policy.description || '',
        basePremium: policy.basePremium || '',
        type: policy.type || 'HEALTH',
        status: policy.status || 'ACTIVE',
        expiryDate: policy.expiryDate ? policy.expiryDate.slice(0, 16) : '',
        durationMonths: policy.durationMonths || '',
        coverageAmount: policy.coverageAmount || '',
      });
    } else {
      setFormData({
        name: '', description: '', basePremium: '',
        type: 'HEALTH', status: 'ACTIVE', expiryDate: '',
        durationMonths: '180', coverageAmount: '400000',
      });
    }
    setErrors({});
  }, [policy, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.length < 3) errs.name = 'Name required (3+ chars)';
    if (!formData.description.trim() || formData.description.length < 10) errs.description = 'Description required (10+ chars)';
    if (!formData.basePremium || parseFloat(formData.basePremium) <= 0) errs.basePremium = 'Valid premium required';
    if (!formData.durationMonths || parseInt(formData.durationMonths) <= 0) errs.durationMonths = 'Valid duration required';
    if (!formData.coverageAmount || parseFloat(formData.coverageAmount) <= 0) errs.coverageAmount = 'Valid coverage required';
    if (!formData.expiryDate) errs.expiryDate = 'Expiry date required';
    else if (new Date(formData.expiryDate) <= new Date()) errs.expiryDate = 'Must be a future date';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        basePremium: parseFloat(formData.basePremium),
        durationMonths: parseInt(formData.durationMonths),
        coverageAmount: parseFloat(formData.coverageAmount),
        expiryDate: formData.expiryDate ? formData.expiryDate + ':00' : null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '0', maxWidth: '600px' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{policy ? 'Edit Policy' : 'Create Policy'}</h2>
          <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Policy Name</label>
              <input name="name" className="form-input" style={{ borderColor: errors.name ? 'var(--color-danger)' : undefined }}
                placeholder="e.g. Future Star Life" value={formData.name} onChange={handleChange} />
              {errors.name && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.name}</span>}
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Description</label>
              <textarea name="description" className="form-input" style={{ resize: 'vertical', borderColor: errors.description ? 'var(--color-danger)' : undefined }}
                placeholder="Describe the policy coverage..." value={formData.description}
                onChange={handleChange} rows={3} />
              {errors.description && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.description}</span>}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Monthly Premium (₹)</label>
                <input name="basePremium" type="number" step="0.01" className="form-input" style={{ borderColor: errors.basePremium ? 'var(--color-danger)' : undefined }}
                  placeholder="1000.00" value={formData.basePremium} onChange={handleChange} />
                {errors.basePremium && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.basePremium}</span>}
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Total Coverage (₹)</label>
                <input name="coverageAmount" type="number" step="0.01" className="form-input" style={{ borderColor: errors.coverageAmount ? 'var(--color-danger)' : undefined }}
                  placeholder="400000.00" value={formData.coverageAmount} onChange={handleChange} />
                {errors.coverageAmount && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.coverageAmount}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Duration (Months)</label>
                <input name="durationMonths" type="number" className="form-input" style={{ borderColor: errors.durationMonths ? 'var(--color-danger)' : undefined }}
                  placeholder="180" value={formData.durationMonths} onChange={handleChange} />
                {errors.durationMonths && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.durationMonths}</span>}
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Type</label>
                <select name="type" className="form-input" value={formData.type} onChange={handleChange}>
                  {['HEALTH', 'LIFE', 'VEHICLE', 'PROPERTY', 'OTHER'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Status</label>
                <select name="status" className="form-input" value={formData.status} onChange={handleChange}>
                  {['ACTIVE', 'INACTIVE', 'EXPIRED'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Expiry Date</label>
                <input name="expiryDate" type="datetime-local" className="form-input" style={{ borderColor: errors.expiryDate ? 'var(--color-danger)' : undefined }}
                  value={formData.expiryDate} onChange={handleChange} />
                {errors.expiryDate && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.expiryDate}</span>}
              </div>
            </div>
          </div>
          <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-hover)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader className="animate-spin" size={16} /> : policy ? 'Update Policy' : 'Create Policy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PolicyModal;



