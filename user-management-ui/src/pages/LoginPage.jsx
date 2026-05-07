import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { Shield, Eye, EyeOff, LogIn, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      return toast.error('Please fill in all fields');
    }
    setLoading(true);
    try {
      const res = await authService.login(formData);
      // Backend returns { token, refreshToken }
      if (res.data && res.data.token) {
        login(res.data.token, res.data.refreshToken);
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error('Invalid response from server');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data || 'Login failed';
      toast.error(typeof msg === 'string' ? msg : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-sidebar">
        <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', marginBottom: '1.5rem' }}>
            <Shield size={32} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', lineHeight: '1.2' }}>Simplify your insurance journey with SmartSure.</h1>
          <p style={{ fontSize: '1.125rem', opacity: '0.8' }}>
            Manage your claims, track policies, and protect what matters most with our streamlined platform.
          </p>
        </div>
      </div>
      
      <div className="auth-content">
        <div className="auth-form-container">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
            <p className="text-muted">Sign in to manage your policies.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember" className="text-sm text-muted">Remember me</label>
              </div>
              <Link to="/forgot-password" className="text-sm font-semibold text-primary">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? <Loader className="animate-spin" size={20} /> : (
                <>
                  <span>Sign In</span>
                  <LogIn size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-8">
            Don't have an account? <Link to="/register" className="font-semibold text-primary">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
