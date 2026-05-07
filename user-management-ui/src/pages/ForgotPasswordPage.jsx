import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Loader, Mail } from 'lucide-react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setSubmitted(true);
      toast.success('Password reset instructions sent!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', animation: 'modalEnter 0.3s ease' }}>
        <div className="text-center mb-8">
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-600)', borderRadius: '14px', marginBottom: '1.5rem' }}>
            <Shield size={28} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Forgot Password?</h1>
          <p className="text-muted text-sm">No worries, we'll send you reset instructions.</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="Enter your email"
                />
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full mt-6">
              {loading ? <Loader className="animate-spin" size={20} /> : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: 'var(--border-radius-lg)', marginBottom: '1rem', fontSize: 'var(--font-size-sm)' }}>
              An email has been sent to <strong>{email}</strong> with instructions to reset your password.
            </div>
            <p className="text-muted text-xs">Didn't receive the email? Check your spam folder or try again.</p>
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/login" className="btn btn-ghost text-sm font-medium">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
