import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGoogleLogin } from '@react-oauth/google';
import './Auth.css';

export default function Login() {
  const { login, verify2FA, verifyOtp, resendOtp, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Step state: 'login' | 'unverified-otp' | '2fa'
  const [step, setStep] = useState('login');

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Status & Feedback state
  const [alertMsg, setAlertMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const otpInputRefs = useRef([]);

  // Countdown for OTP resend (only for unverified-otp step)
  useEffect(() => {
    let interval = null;
    if (step === 'unverified-otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Focus first OTP box when step changes
  useEffect(() => {
    if ((step === 'unverified-otp' || step === '2fa') && otpInputRefs.current[0]) {
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setAlertMsg({ type: 'error', text: 'Please fill in both email and password.' });
      return;
    }

    setLoading(true);
    setAlertMsg(null);

    try {
      const res = await login(email.trim().toLowerCase(), password, role);

      if (res.unverified) {
        setLoading(false);
        setStep('unverified-otp');
        setTimer(60);
        setCanResend(false);
        setAlertMsg({
          type: 'error',
          text: res.message || 'Account not verified. A fresh OTP has been sent to your email.',
        });
        return;
      }

      if (res.requires2FA) {
        setLoading(false);
        setStep('2fa');
        setOtpDigits(['', '', '', '', '', '']);
        setAlertMsg({
          type: 'success',
          text: res.message || 'A 2FA code has been sent to your email.',
        });
        return;
      }

      // Direct login (no 2FA — fallback)
      setLoading(false);
      setAlertMsg({ type: 'success', text: 'Welcome back! Login successful.' });
      setTimeout(() => {
        if (res.user?.role === 'admin' || res.user?.email === 'muhammadabbas09dec@gmail.com') {
          navigate('/admin');
        } else if (res.user?.role === 'farmer') {
          navigate('/farmer/dashboard');
        } else {
          const from = location.state?.from?.pathname || '/';
          navigate(from);
        }
      }, 1000);
    } catch (error) {
      setLoading(false);
      setAlertMsg({
        type: 'error',
        text: error.customMessage || error.response?.data?.message || 'Invalid email or password.',
      });
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.substring(value.length - 1);
    setOtpDigits(newDigits);

    if (value && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      if (otpInputRefs.current[index - 1]) {
        otpInputRefs.current[index - 1].focus();
      }
    }
  };

  // Handle 2FA OTP verification
  const handle2FAVerify = async (e) => {
    e.preventDefault();
    const otpCode = otpDigits.join('');

    if (otpCode.length !== 6) {
      setAlertMsg({ type: 'error', text: 'Please enter the 6-digit 2FA code.' });
      return;
    }

    setLoading(true);
    setAlertMsg(null);

    try {
      const res = await verify2FA(email.trim().toLowerCase(), otpCode);
      setLoading(false);
      setAlertMsg({ type: 'success', text: 'Verified! Logging you in...' });

      setTimeout(() => {
        if (res.user?.role === 'admin' || res.user?.email === 'muhammadabbas09dec@gmail.com') {
          navigate('/admin');
        } else if (res.user?.role === 'farmer') {
          navigate('/farmer/dashboard');
        } else {
          const from = location.state?.from?.pathname || '/';
          navigate(from);
        }
      }, 900);
    } catch (error) {
      setLoading(false);
      setAlertMsg({
        type: 'error',
        text: error.customMessage || error.response?.data?.message || 'Invalid or expired 2FA code.',
      });
    }
  };

  // Handle account verification OTP (unverified users)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otpDigits.join('');

    if (otpCode.length !== 6) {
      setAlertMsg({ type: 'error', text: 'Please enter the 6-digit OTP code.' });
      return;
    }

    setLoading(true);
    setAlertMsg(null);

    try {
      const res = await verifyOtp(email.trim().toLowerCase(), otpCode);
      setLoading(false);
      setAlertMsg({
        type: 'success',
        text: 'Account verified successfully! Welcome to ShopSphere.',
      });
      setTimeout(() => {
        if (res.user?.role === 'admin' || res.user?.email === 'muhammadabbas09dec@gmail.com') {
          navigate('/admin');
        } else if (res.user?.role === 'farmer') {
          navigate('/farmer/dashboard');
        } else {
          navigate('/');
        }
      }, 1000);
    } catch (error) {
      setLoading(false);
      setAlertMsg({
        type: 'error',
        text: error.customMessage || error.response?.data?.message || 'Invalid or expired OTP code.',
      });
    }
  };

  // Resend OTP from login screen
  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    setAlertMsg(null);

    try {
      await resendOtp(email.trim().toLowerCase());
      setLoading(false);
      setTimer(60);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      setAlertMsg({ type: 'success', text: 'A fresh OTP code has been sent to your email.' });
    } catch (error) {
      setLoading(false);
      setAlertMsg({
        type: 'error',
        text: error.customMessage || error.response?.data?.message || 'Failed to resend OTP.',
      });
    }
  };

  // Handle Google Login
  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    setAlertMsg(null);
    try {
      const res = await googleLogin(tokenResponse.access_token, role);
      setLoading(false);
      if (res.success) {
        setAlertMsg({ type: 'success', text: 'Google Login successful! Welcome back.' });
        setTimeout(() => {
          if (res.user?.role === 'admin' || res.user?.email === 'muhammadabbas09dec@gmail.com') navigate('/admin');
          else if (res.user?.role === 'farmer') navigate('/farmer/dashboard');
          else navigate(location.state?.from?.pathname || '/');
        }, 1000);
      }
    } catch (error) {
      setLoading(false);
      setAlertMsg({ type: 'error', text: error.response?.data?.message || 'Google Login failed.' });
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setAlertMsg({ type: 'error', text: 'Google authentication was cancelled or failed.' })
  });

  // Shared OTP inputs renderer
  const renderOtpInputs = () => (
    <div className="otp-inputs-row">
      {otpDigits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => (otpInputRefs.current[idx] = el)}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleOtpChange(idx, e.target.value)}
          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
          className="otp-digit-input"
          inputMode="numeric"
        />
      ))}
    </div>
  );

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <Link to="/" className="auth-brand-badge" title="Go to Home">
            <ShoppingBag size={24} />
          </Link>
          <h2 className="auth-title">
            {step === 'login' && 'Welcome Back'}
            {step === '2fa' && 'Two-Factor Authentication'}
            {step === 'unverified-otp' && 'Verify Your Account'}
          </h2>
          <p className="auth-subtitle">
            {step === 'login' && 'Sign in to access your orders, wishlist, and admin privileges.'}
            {step === '2fa' && `Enter the 6-digit security code sent to ${email}`}
            {step === 'unverified-otp' && `Please enter the 6-digit OTP code sent to ${email}`}
          </p>
        </div>

        {/* Alert message */}
        {alertMsg && (
          <div className={`auth-alert ${alertMsg.type}`}>
            {alertMsg.type === 'success' ? (
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            ) : (
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            )}
            <span>{alertMsg.text}</span>
          </div>
        )}

        {/* ── LOGIN FORM ── */}
        {step === 'login' && (
          <form className="auth-form" onSubmit={handleLogin}>
            {/* Account Type Selector (Customer vs Farmer) */}
            <div className="auth-field-group">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: role === 'user' ? '2px solid #10b981' : '1.5px solid #e2e8f0',
                    background: role === 'user' ? '#ecfdf5' : '#ffffff',
                    color: role === 'user' ? '#065f46' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <ShoppingBag size={17} color={role === 'user' ? '#10b981' : '#94a3b8'} />
                  <span>Customer Login</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('farmer')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: role === 'farmer' ? '2px solid #059669' : '1.5px solid #e2e8f0',
                    background: role === 'farmer' ? '#d1fae5' : '#ffffff',
                    color: role === 'farmer' ? '#047857' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {/* Note: Leaf icon needs to be dynamically imported or use ShoppingBag if not imported in Login.jsx. Looking at imports, Leaf is not imported in Login.jsx. So I'll use ShieldCheck or just text if I don't import Leaf. Wait, I will just import Leaf at the top in a text chunk or just use a standard emoji. */}
                  <span>Farmer Login</span>
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="auth-field-group">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrapper">
                <Mail size={17} className="auth-input-icon" />
                <input
                  type="email"
                  className="auth-input"
                  placeholder="admin@gmail.com or user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field-group">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrapper">
                <Lock size={17} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-toggle-pwd"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="auth-options-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="auth-forgot-link">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
            
            {/* Google Login Button */}
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                <hr style={{ flex: 1, borderColor: '#e2e8f0', margin: 0 }} />
                <span>OR</span>
                <hr style={{ flex: 1, borderColor: '#e2e8f0', margin: 0 }} />
              </div>
              <button
                type="button"
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'center', fontWeight: '600', padding: '12px' }}
                onClick={() => loginWithGoogle()}
                disabled={loading}
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: 18, height: 18, marginRight: 8 }} />
                Sign in with Google
              </button>
            </div>
          </form>
        )}

        {/* ── 2FA VERIFICATION FORM ── */}
        {step === '2fa' && (
          <form className="auth-form" onSubmit={handle2FAVerify}>
            <div className="otp-container">
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
                  color: '#7C3AED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(124,58,237,0.2)',
                }}
              >
                <ShieldAlert size={28} />
              </div>

              <p style={{ fontSize: '0.84rem', color: '#64748b', textAlign: 'center', margin: '4px 0 8px' }}>
                This code is valid for <strong>10 minutes</strong>
              </p>

              {renderOtpInputs()}
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
              disabled={loading || otpDigits.join('').length !== 6}
            >
              <span>{loading ? 'Verifying...' : 'Verify & Sign In'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>

            <button
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '0.84rem',
                cursor: 'pointer',
                marginTop: 8,
              }}
              onClick={() => {
                setStep('login');
                setOtpDigits(['', '', '', '', '', '']);
                setAlertMsg(null);
              }}
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* ── UNVERIFIED ACCOUNT OTP FORM ── */}
        {step === 'unverified-otp' && (
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <div className="otp-container">
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#ecfdf5',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={28} />
              </div>

              {renderOtpInputs()}

              <div className="otp-resend-row">
                <span>Didn't receive the code?</span>
                {canResend ? (
                  <button
                    type="button"
                    className="otp-resend-btn"
                    onClick={handleResendOtp}
                    disabled={loading}
                  >
                    Resend Code
                  </button>
                ) : (
                  <span style={{ color: '#94a3b8' }}>
                    Resend in <strong>{timer}s</strong>
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading || otpDigits.join('').length !== 6}
            >
              <span>{loading ? 'Verifying...' : 'Verify & Sign In'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>

            <button
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '0.84rem',
                cursor: 'pointer',
                marginTop: 8,
              }}
              onClick={() => {
                setStep('login');
                setAlertMsg(null);
              }}
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* Switch Link */}
        <p className="auth-switch-text">
          Don't have an account?
          <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
