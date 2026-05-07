import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const DeleteDialog = ({ isOpen, onClose, onConfirm, userId }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem', position: 'relative' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <AlertTriangle size={32} color="var(--color-danger)" />
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Delete User</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Are you sure you want to delete user <strong>#{userId}</strong>? This action cannot be undone.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={onConfirm}>
            Delete Permanently
          </button>
        </div>
        
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-secondary)' }}
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default DeleteDialog;
















