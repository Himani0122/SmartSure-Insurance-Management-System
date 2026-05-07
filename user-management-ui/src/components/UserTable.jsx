import React from 'react';
import { Trash2, ShieldCheck, ShieldOff } from 'lucide-react';

const UserTable = ({ users = [], onDelete, onStatusChange }) => {
  if (users.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--border-radius-xl)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No users found</h3>
        <p style={{ color: 'var(--text-secondary)' }}>There are currently no registered users.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td><strong>#{user.id}</strong></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem' }}>
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500 }}>{user.username}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge ${user.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`badge ${user.blocked ? 'badge-expired' : 'badge-active'}`}>
                    {user.blocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className={`btn ${user.blocked ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => onStatusChange(user)}
                      title={user.blocked ? 'Activate' : 'Block'}
                    >
                      {user.blocked ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                      {user.blocked ? 'Activate' : 'Block'}
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{ color: 'var(--color-danger)', padding: '0.25rem 0.5rem' }}
                      onClick={() => onDelete(user.id)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;




