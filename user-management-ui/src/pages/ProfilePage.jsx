import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { User, Mail, Shield, Lock, Save, Eye, EyeOff, Loader, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [profileForm, setProfileForm] = useState({ username: '', email: '', name: '', phone: '', address: '' });
  const [profileSaving, setProfileSaving] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdErrors, setPwdErrors] = useState({});

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await authService.getUser(user.username);
      setProfile(res.data);
      setProfileForm({ 
        username: res.data.username, 
        email: res.data.email,
        name: res.data.name || '',
        phone: res.data.phone || '',
        address: res.data.address || ''
      });
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileForm.username.trim() || !profileForm.email.trim() || !profileForm.name.trim()) {
      toast.error('Name, Username, and Email are required');
      return;
    }
    setProfileSaving(true);
    try {
      await authService.updateProfile(user.username, profileForm);
      toast.success('Profile updated! Please log in again.');
      // Username might have changed — need to re-login
      setTimeout(() => logout(), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || 'Update failed');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!passwordForm.oldPassword) errs.oldPassword = 'Required';
    if (!passwordForm.newPassword) errs.newPassword = 'Required';
    else if (!/^(?=.*[A-Z])(?=.*[0-9]).{8,}$/.test(passwordForm.newPassword))
      errs.newPassword = 'Min 8 chars, 1 uppercase, 1 digit';
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    setPwdErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setPasswordSaving(true);
    try {
      await authService.changePassword(user.username, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || 'Password change failed');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}><Loader className="animate-spin" style={{ margin: '0 auto 1rem' }} /> Loading profile...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 1024 ? '1fr 2fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Profile Card */}
        <div className="card text-center" style={{ padding: '2rem' }}>
          <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700, margin: '0 auto 1.5rem' }}>
            {profile?.username?.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{profile?.name || profile?.username}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{profile?.email}</p>
          {profile?.phone && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{profile.phone}</p>}
          
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <span className={`badge ${profile?.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>
              {profile?.role}
            </span>
            <span className={`badge ${profile?.blocked ? 'badge-expired' : 'badge-active'}`}>
              {profile?.blocked ? 'Blocked' : 'Active'}
            </span>
          </div>
        </div>

        {/* Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Update Profile */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={20} /> Update Profile</h3>
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-input" value={profileForm.username}
                  onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 640 ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="form-input" value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary mt-2" disabled={profileSaving}>
                {profileSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Lock size={20} /> Change Password</h3>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="form-input" style={{ borderColor: pwdErrors.oldPassword ? 'var(--color-danger)' : undefined }}
                    type={showOldPwd ? 'text' : 'password'} value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    placeholder="Enter current password" />
                  <button type="button" onClick={() => setShowOldPwd(!showOldPwd)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                    {showOldPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {pwdErrors.oldPassword && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{pwdErrors.oldPassword}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="form-input" style={{ borderColor: pwdErrors.newPassword ? 'var(--color-danger)' : undefined }}
                    type={showNewPwd ? 'text' : 'password'} value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Min 8 chars, 1 uppercase, 1 digit" />
                  <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                    {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {pwdErrors.newPassword && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{pwdErrors.newPassword}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="form-input" style={{ borderColor: pwdErrors.confirmPassword ? 'var(--color-danger)' : undefined }}
                  type="password" value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password" />
                {pwdErrors.confirmPassword && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{pwdErrors.confirmPassword}</span>}
              </div>
              <button type="submit" className="btn btn-primary mt-2" disabled={passwordSaving}>
                {passwordSaving ? <Loader size={16} className="animate-spin" /> : <Lock size={16} />}
                Change Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
