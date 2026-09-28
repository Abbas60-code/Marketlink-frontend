import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import authService from '../../services/authService.js';
import './Auth.css';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || '');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const otpInputRefs = useRef([]);

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

  const handleReset = async (e) => {
    e.preventDefault();
    const otpCode = otpDigits.join('');

    if (!email.trim()) {
      setAlertMsg({ type: 'error', text: 'Please enter your registered email address.' });
      return;
    }

    if (otpCode.length !== 6) {
      setAlertMsg({ type: 'error', text: 'Please enter the complete 6-digit OTP code.' });
      return;
    }

    if (!password || !confirmPassword) {
      setAlertMsg({ type: 'error', text: 'Please fill in both password fields.' });
      return;
    }

    if (password.length < 6) {
      setAlertMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    if (password !== confirmPassword) {
      setAlertMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    setAlertMsg(null);

    try {
      const res = await authService.resetPassword(
        email.trim().toLowerCase(),
        otpCode,
        password
      );
      setLoading(false);
      setAlertMsg({
        type: 'success',
        text: res.message || 'Your password has been reset! Redirecting to login...',
      });
      setTimeout(() => {
        navigate('/login');
      }, 1400);
    } catch (err) {
      setLoading(false);
      setAlertMsg({
        type: 'error',
        text: err.customMessage || err.response?.data?.message || 'Invalid or expired OTP code.',
      });
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-header">
          <div
            className="auth-brand-badge"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            <ShieldCheck size={24} />
          </div>
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">
            Enter the 6-digit OTP sent to your email and set your new password.
          </p>
        </div>

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

        <form className="auth-form" onSubmit={handleReset}>
          {/* Email */}
          <div className="auth-field-group">
            <label className="auth-label">Account Email</label>
            <div className="auth-input-wrapper">
              <Mail size={17} className="auth-input-icon" />
              <input
                type="email"
                className="auth-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* 6-Digit OTP */}
          <div className="otp-container">
            <label className="auth-label" style={{ alignSelf: 'center', marginBottom: -4 }}>
              6-Digit OTP Code
            </label>

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
                  autoFocus={idx === 0}
                />
              ))}
            </div>
          </div>

          {/* New Password */}
          <div className="auth-field-group">
            <label className="auth-label">New Password</label>
            <div className="auth-input-wrapper">
              <Lock size={17} className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="At least 6 characters"
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

          {/* Confirm New Password */}
          <div className="auth-field-group">
            <label className="auth-label">Confirm New Password</label>
            <div className="auth-input-wrapper">
              <Lock size={17} className="auth-input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="auth-toggle-pwd"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            <span>{loading ? 'Updating Password...' : 'Verify OTP & Reset Password'}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="auth-switch-text">
          Remember your credentials?
          <Link to="/login">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
