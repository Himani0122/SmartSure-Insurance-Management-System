import React, { useState, useEffect } from 'react';
import { RefreshCcw, Users, ShieldAlert, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService, authService } from '../services/api';
import UserTable from '../components/UserTable';
import DeleteDialog from '../components/DeleteDialog';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, BLOCKED

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      toast.error('Failed to load users. Backend might be offline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDeleteClick = (userId) => {
    setUserToDelete(userId);
    setIsDeleteOpen(true);
  };

  const handleStatusToggle = async (userItem) => {
    const loadingToast = toast.loading('Updating status...');
    try {
      if (userItem.blocked) {
        await adminService.activateUser(userItem.id);
        toast.success('User activated successfully', { id: loadingToast });
      } else {
        await adminService.blockUser(userItem.id);
        toast.success('User blocked successfully', { id: loadingToast });
      }
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update status', { id: loadingToast });
    }
  };

  const handleDeleteConfirm = async () => {
    const loadingToast = toast.loading('Deleting user...');
    try {
      await authService.deleteUser(userToDelete);
      toast.success('User deleted successfully', { id: loadingToast });
      setIsDeleteOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user', { id: loadingToast });
    }
  };

  const filteredUsers = users.filter(u => {
    if (filter === 'ACTIVE') return !u.blocked;
    if (filter === 'BLOCKED') return u.blocked;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button className="btn btn-secondary" onClick={fetchUsers}>
          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid-cols-3">
        <div 
          className="card stat-card" 
          onClick={() => setFilter('ALL')}
          style={{ cursor: 'pointer', border: filter === 'ALL' ? '2px solid var(--color-primary-500)' : '1px solid var(--border-subtle)' }}
        >
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h4>Total Users</h4>
            <p>{users.length}</p>
          </div>
        </div>

        <div 
          className="card stat-card"
          onClick={() => setFilter('ACTIVE')}
          style={{ cursor: 'pointer', border: filter === 'ACTIVE' ? '2px solid var(--color-success)' : '1px solid var(--border-subtle)' }}
        >
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <h4>Active</h4>
            <p>{users.filter(u => !u.blocked).length}</p>
          </div>
        </div>

        <div 
          className="card stat-card"
          onClick={() => setFilter('BLOCKED')}
          style={{ cursor: 'pointer', border: filter === 'BLOCKED' ? '2px solid var(--color-danger)' : '1px solid var(--border-subtle)' }}
        >
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
            <ShieldAlert size={24} />
          </div>
          <div className="stat-info">
            <h4>Blocked</h4>
            <p>{users.filter(u => u.blocked).length}</p>
          </div>
        </div>
      </div>

      {loading && users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <RefreshCcw className="animate-spin" style={{ margin: '0 auto 1rem' }} />
          <p>Fetching user data...</p>
        </div>
      ) : (
        <UserTable
          users={filteredUsers}
          onDelete={handleDeleteClick}
          onStatusChange={handleStatusToggle}
        />
      )}

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        userId={userToDelete}
      />
    </div>
  );
};

export default UsersPage;
