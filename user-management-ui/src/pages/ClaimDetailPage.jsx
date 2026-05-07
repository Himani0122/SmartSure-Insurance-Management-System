import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { claimsService, adminService } from '../services/api';
import {
  ArrowLeft, FileText, Send, XCircle, CheckCircle, Eye,
  X as XIcon, Upload, Trash2, File, Clock, Loader
} from 'lucide-react';
import toast from 'react-hot-toast';

const ClaimDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [claim, setClaim] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => { fetchClaim(); }, [id]);

  const fetchClaim = async () => {
    setLoading(true);
    try {
      const res = await claimsService.getById(id);
      setClaim(res.data);
      if (res.data.policyId) {
        fetchPolicy(res.data.policyId);
      }
    } catch (err) {
      toast.error('Claim not found');
      navigate('/claims');
    } finally {
      setLoading(false);
    }
  };

  const fetchPolicy = async (policyId) => {
    try {
      const res = await policyService.getById(policyId);
      setPolicy(res.data);
    } catch (err) {
      console.error('Failed to fetch policy name', err);
    }
  };

  const handleSubmit = async () => {
    setActionLoading(true);
    try {
      await claimsService.submit(id, user.username);
      toast.success('Claim submitted for review');
      fetchClaim();
    } catch (err) { toast.error(err.response?.data || 'Submit failed'); }
    finally { setActionLoading(false); }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await claimsService.cancel(id, user.username);
      toast.success('Claim cancelled');
      fetchClaim();
    } catch (err) { toast.error(err.response?.data || 'Cancel failed'); }
    finally { setActionLoading(false); }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await adminService.reviewClaim(id, { status: 'APPROVED', comments: reviewComment || 'Approved by Admin' });
      toast.success('Claim approved');
      fetchClaim();
    } catch (err) { toast.error('Approve failed'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await adminService.reviewClaim(id, { status: 'REJECTED', comments: reviewComment || 'Rejected by Admin' });
      toast.success('Claim rejected');
      fetchClaim();
    } catch (err) { toast.error('Reject failed'); }
    finally { setActionLoading(false); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setActionLoading(true);
    try {
      await claimsService.addDocument(id, file, user.username);
      toast.success('Document uploaded');
      fetchClaim();
    } catch (err) { toast.error('Upload failed'); }
    finally { setActionLoading(false); }
  };

  const handleDeleteDoc = async (docId) => {
    setActionLoading(true);
    try {
      await claimsService.deleteDocument(id, docId, user.username);
      toast.success('Document deleted');
      fetchClaim();
    } catch (err) { toast.error('Delete failed'); }
    finally { setActionLoading(false); }
  };

  const handleDownloadDoc = async (doc) => {
    try {
      const res = await claimsService.downloadDocument(id, doc.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Download failed');
    }
  };

  const handleViewDoc = async (doc) => {
    try {
      const res = await claimsService.downloadDocument(id, doc.id);
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      toast.error('Could not open document');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}><Loader className="animate-spin" style={{ margin: '0 auto 1rem' }} /> Loading claim...</div>;
  if (!claim) return null;

  return (
    <div className="flex flex-col gap-6">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn btn-ghost" style={{ padding: '0.5rem' }} onClick={() => navigate('/claims')}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Claim Details</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 1024 ? '2fr 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Main Info */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Claim #{claim.id}</h2>
            <span className={`badge badge-${claim.status?.toLowerCase()}`}>{claim.status}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Policy</span>
              <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary-600)' }}>
                {policy ? policy.name : `ID: ${claim.policyId}`}
              </span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Requested Amount</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-danger)' }}>
                ₹{claim.claimAmount?.toLocaleString() || '0'}
              </span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Filed By</span>
              <span style={{ fontSize: '1.125rem', fontWeight: 500 }}>{claim.username}</span>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Idempotency Key</span>
              <span style={{ fontSize: '0.875rem', fontFamily: 'monospace', wordBreak: 'break-all', backgroundColor: 'var(--bg-surface-hover)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                {claim.idempotencyKey}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>Description</h3>
            <p style={{ backgroundColor: 'var(--bg-body)', padding: '1.5rem', borderRadius: 'var(--border-radius-lg)', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {claim.description}
            </p>
          </div>

        </div>

        {/* Side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* User Actions */}
          {!isAdmin && (claim.status === 'DRAFT' || claim.status === 'SUBMITTED') && (
            <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-primary-500)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {claim.status === 'DRAFT' && (
                  <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={handleSubmit} disabled={actionLoading}>
                    <Send size={18} /> Submit for Review
                  </button>
                )}
                <button className="btn btn-secondary w-full" style={{ justifyContent: 'center', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }} onClick={handleCancel} disabled={actionLoading}>
                  <XCircle size={18} /> Cancel Claim
                </button>
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><File size={20} /> Documents</h3>
            {claim.documents && claim.documents.length > 0 ? (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {claim.documents.map(doc => (
                  <li key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-body)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                      <FileText size={18} style={{ color: 'var(--color-primary-500)', flexShrink: 0 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.filename}</span>
                        {doc.uploadedAt && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={() => handleViewDoc(doc)} title="View Document">
                        <Eye size={16} />
                      </button>
                      <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={() => handleDownloadDoc(doc)} title="Download Document">
                        <Upload size={16} style={{ transform: 'rotate(180deg)' }} />
                      </button>
                      {!isAdmin && claim.status === 'DRAFT' && (
                        <button className="btn btn-ghost" style={{ padding: '0.25rem', color: 'var(--color-danger)' }} onClick={() => handleDeleteDoc(doc.id)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'var(--bg-body)', borderRadius: 'var(--border-radius-md)', border: '1px dashed var(--border-strong)', color: 'var(--text-secondary)' }}>
                <FileText size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.875rem' }}>No documents attached</p>
              </div>
            )}
            {!isAdmin && claim.status === 'DRAFT' && (!claim.documents || claim.documents.length === 0) && (
              <div style={{ marginTop: '1rem' }}>
                <input type="file" ref={fileInputRef} onChange={handleUpload} hidden accept=".pdf,.png,.jpg,.jpeg" />
                <button className="btn btn-secondary w-full" onClick={() => fileInputRef.current?.click()} disabled={actionLoading} style={{ display: 'flex', justifyContent: 'center' }}>
                  <Upload size={18} /> Upload Document
                </button>
              </div>
            )}
          </div>

          {/* Admin Review */}
          {isAdmin && (claim.status === 'UNDER_REVIEW' || claim.status === 'SUBMITTED') && (
            <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-primary-500)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={20} /> Admin Review</h3>
              <div className="form-group">
                <label className="form-label">Review Comments</label>
                <textarea className="form-input" rows={3} placeholder="Add review comments..."
                  value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
                  style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button className="btn" style={{ flex: 1, backgroundColor: 'var(--color-success)', color: 'white' }} onClick={handleApprove} disabled={actionLoading}>
                  {actionLoading ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  Approve
                </button>
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleReject} disabled={actionLoading}>
                  {actionLoading ? <Loader size={16} className="animate-spin" /> : <XIcon size={16} />}
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimDetailPage;
