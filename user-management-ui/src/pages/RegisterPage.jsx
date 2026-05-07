import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { Shield, Eye, EyeOff, UserPlus, Loader, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = { FORM: 'FORM', OTP: 'OTP' };

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(STEPS.FORM);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Validate form and send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (formData.password.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }
    if (!/^(?=.*[A-Z])(?=.*[0-9]).{8,}$/.test(formData.password)) {
      return toast.error('Password must have at least 1 uppercase letter and 1 digit');
    }

    setOtpSending(true);
    try {
      await authService.sendOtp({ email: formData.email });
      toast.success('OTP sent to your email! Please check your inbox.');
      setStep(STEPS.OTP);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data || err.response?.data?.message || 'Failed to send OTP';
      toast.error(typeof msg === 'string' ? msg : 'Failed to send OTP');
    } finally {
      setOtpSending(false);
    }
  };

  // Step 2: Verify OTP and complete registration
  const handleRegister = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      return toast.error('Please enter the 6-digit OTP');
    }

    setLoading(true);
    try {
      const registerData = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || null,
        address: formData.address || null,
        role: 'USER',
        otp: otp,
      };
      const res = await authService.register(registerData);

      // Backend returns { token, refreshToken } — auto-login the user
      if (res.data && res.data.token) {
        login(res.data.token, res.data.refreshToken);
        toast.success('Account created successfully! Welcome to SmartSure.');
        navigate('/dashboard');
      } else {
        toast.success('Registration successful! Please login.');
        navigate('/login');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data || 'Registration failed';
      toast.error(typeof msg === 'string' ? msg : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpSending(true);
    try {
      await authService.sendOtp({ email: formData.email });
      toast.success('New OTP sent to your email!');
    } catch (err) {
      toast.error('Failed to resend OTP');
    } finally {
      setOtpSending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-sidebar" style={{ background: 'linear-gradient(135deg, var(--color-slate-900), var(--color-primary-900))' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', marginBottom: '1.5rem' }}>
            <Shield size={32} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', lineHeight: '1.2' }}>Your journey to smart insurance starts here.</h1>
          <p style={{ fontSize: '1.125rem', opacity: '0.8' }}>
            Create an account in minutes and get full access to policy management, claim tracking, and premium coverage.
          </p>

          {/* Step Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, backgroundColor: step === STEPS.FORM ? 'var(--color-primary-500)' : 'rgba(255,255,255,0.2)', color: 'white' }}>
                {step === STEPS.OTP ? <CheckCircle size={16} /> : '1'}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, opacity: step === STEPS.FORM ? 1 : 0.6 }}>Your Details</span>
            </div>
            <div style={{ width: '40px', height: '2px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, backgroundColor: step === STEPS.OTP ? 'var(--color-primary-500)' : 'rgba(255,255,255,0.2)', color: 'white' }}>
                2
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, opacity: step === STEPS.OTP ? 1 : 0.6 }}>Verify Email</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-content">
        <div className="auth-form-container" style={{ maxWidth: '440px' }}>
          {step === STEPS.FORM ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Create Account</h2>
                <p className="text-muted">Fill in your details to get started with SmartSure.</p>
              </div>

              <form onSubmit={handleSendOtp}>
                {/* Full Name */}
                <div className="form-group">
                  <label className="form-label">Full Name <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Priya Sharma"
                  />
                </div>

                {/* Username */}
                <div className="form-group">
                  <label className="form-label">Username <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input
                    type="text"
                    name="username"
                    required
                    minLength={3}
                    maxLength={30}
                    value={formData.username}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Choose a unique username"
                  />
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="form-label">Email Address <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="email@example.com"
                  />
                </div>

                {/* Phone & Address row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="City, State"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="form-group">
                  <label className="form-label">Password <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Min 8 chars, 1 uppercase, 1 digit"
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

                {/* Confirm Password */}
                <div className="form-group">
                  <label className="form-label">Confirm Password <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Repeat your password"
                  />
                </div>

                <button type="submit" disabled={otpSending} className="btn btn-primary w-full mt-6">
                  {otpSending ? <Loader className="animate-spin" size={20} /> : (
                    <>
                      <span>Continue</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* OTP Verification Step */}
              <div className="text-center mb-8">
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', backgroundColor: 'rgba(99,102,241,0.1)', borderRadius: '16px', marginBottom: '1.5rem' }}>
                  <Mail size={32} color="var(--color-primary-500)" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Verify Your Email</h2>
                <p className="text-muted">
                  We sent a 6-digit OTP to <strong style={{ color: 'var(--text-primary)' }}>{formData.email}</strong>
                </p>
              </div>

              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label className="form-label">Enter OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="form-input"
                    placeholder="Enter 6-digit code"
                    style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem', fontWeight: 700 }}
                    autoFocus
                  />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary w-full mt-4">
                  {loading ? <Loader className="animate-spin" size={20} /> : (
                    <>
                      <span>Create Account</span>
                      <UserPlus size={18} />
                    </>
                  )}
                </button>

                <div className="text-center mt-6">
                  <p className="text-sm text-muted">
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpSending}
                      style={{ color: 'var(--color-primary-500)', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 'inherit' }}
                    >
                      {otpSending ? 'Sending...' : 'Resend OTP'}
                    </button>
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep(STEPS.FORM)}
                    style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit', fontSize: '0.875rem' }}
                  >
                    ← Back to details
                  </button>
                </div>
              </form>
            </>
          )}

          <p className="text-center text-sm text-muted mt-8">
            Already have an account? <Link to="/login" className="font-semibold text-primary">Sign in instead</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
