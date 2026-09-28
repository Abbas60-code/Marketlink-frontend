import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import authService from '../../services/authService.js';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('request'); // 'request' | 'verify_and_reset'

  // OTP and New Password state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Timer for resend
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Loading and alerts
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  const otpInputRefs = useRef([]);
  const navigate = useNavigate();

  // Countdown timer
  useEffect(() => {
    let interval = null;
    if (step === 'verify_and_reset' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Step 1: Send OTP to Email
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setAlertMsg({ type: 'error', text: 'Please enter your registered email address.' });
      return;
    }

    setLoading(true);
    setAlertMsg(null);

    try {
      const res = await authService.forgotPassword(email.trim().toLowerCase());
      setLoading(false);
      // Use the email returned by server (confirmed address in DB)
      const confirmedEmail = res.email || email.trim().toLowerCase();
      setEmail(confirmedEmail); // update email to confirmed one from DB
      setStep('verify_and_reset');
      setTimer(60);
      setCanResend(false);
      setAlertMsg({
        type: 'success',
        text: `OTP sent to ${confirmedEmail}. Check your inbox AND spam/junk folder.`,
      });
      setTimeout(() => {
        if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
      }, 300);
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || err.customMessage || 'Failed to send reset OTP.';
      setAlertMsg({
        type: 'error',
        text: errMsg,
      });
    }
  };

  // OTP Digits Handling
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

  // Step 2: Verify OTP & Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const otpCode = otpDigits.join('');

    if (otpCode.length !== 6) {
      setAlertMsg({ type: 'error', text: 'Please enter the complete 6-digit verification code.' });
      return;
    }

    if (!newPassword || !confirmPassword) {
      setAlertMsg({ type: 'error', text: 'Please fill in both password fields.' });
      return;
    }

    if (newPassword.length < 6) {
      setAlertMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlertMsg({ type: 'error', text: 'Passwords do not match. Please re-enter.' });
      return;
    }

    setLoading(true);
    setAlertMsg(null);

    try {
      const res = await authService.resetPassword(
        email.trim().toLowerCase(),
        otpCode,
        newPassword
      );
      setLoading(false);
      setAlertMsg({
        type: 'success',
        text: res.message || 'Password reset successful! Redirecting to login...',
      });
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setLoading(false);
      setAlertMsg({
        type: 'error',
        text: err.customMessage || err.response?.data?.message || 'Invalid or expired OTP code.',
      });
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    setAlertMsg(null);

    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setLoading(false);
      setTimer(60);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      setAlertMsg({ type: 'success', text: 'A fresh OTP code has been sent to your email.' });
      if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
    } catch (err) {
      setLoading(false);
      setAlertMsg({
        type: 'error',
        text: err.customMessage || err.response?.data?.message || 'Failed to resend OTP.',
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
            {step === 'request' ? <KeyRound size={24} /> : <ShieldCheck size={24} />}
          </div>
          <h2 className="auth-title">
            {step === 'request' ? 'Forgot Password?' : 'Reset Your Password'}
          </h2>
          <p className="auth-subtitle">
            {step === 'request'
              ? "Enter your account email and we'll send you a 6-digit OTP verification code."
              : (
                <>
                  OTP sent to <strong>{email}</strong>.<br />
                  <span style={{ fontSize: '0.8rem', color: '#f59e0b' }}>
                    Not in inbox? Check your <strong>Spam / Junk</strong> folder.
                  </span>
                </>
              )}
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

        {step === 'request' ? (
          /* ── STEP 1: EMAIL REQUEST FORM ── */
          <form className="auth-form" onSubmit={handleRequestOtp}>
            <div className="auth-field-group">
              <label className="auth-label">Registered Email Address</label>
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

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              <span>{loading ? 'Sending OTP Code...' : 'Send Verification OTP'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        ) : (
          /* ── STEP 2: ENTER OTP & NEW PASSWORD ── */
          <form className="auth-form" onSubmit={handleResetPassword}>
            {/* 6-Digit OTP */}
            <div className="otp-container">
              <label className="auth-label" style={{ alignSelf: 'center', marginBottom: -4 }}>
                Enter 6-Digit Verification Code
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

              <div className="otp-resend-row">
                <span>Didn't receive code?</span>
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

            {/* New Password */}
            <div className="auth-field-group">
              <label className="auth-label">New Password</label>
              <div className="auth-input-wrapper">
                <Lock size={17} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

            {/* Confirm Password */}
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
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading || otpDigits.join('').length !== 6}
            >
              <span>{loading ? 'Resetting Password...' : 'Verify OTP & Reset Password'}</span>
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
                marginTop: 6,
                textAlign: 'center',
              }}
              onClick={() => {
                setStep('request');
                setAlertMsg(null);
              }}
            >
              ← Change Email Address
            </button>
          </form>
        )}

        <p className="auth-switch-text" style={{ marginTop: 24 }}>
          <Link
            to="/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b' }}
          >
            <ArrowLeft size={15} />
            <span>Back to Sign In</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
