import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Camera,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Leaf,
  Store
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGoogleLogin } from '@react-oauth/google';
import './Auth.css';

export default function Register() {
  const { register, verifyOtp, resendOtp, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Registration Form State
  const [role, setRole] = useState('user'); // 'user' | 'farmer'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Verification Step State
  const [step, setStep] = useState('register'); // 'register' | 'otp'
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Status & Feedback State
  const [alertMsg, setAlertMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const otpInputRefs = useRef([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Handle image file selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Step 1: Handle registration submit
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !password || !confirmPassword) {
      setAlertMsg({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    if (password.length < 6) {
      setAlertMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    if (password !== confirmPassword) {
      setAlertMsg({ type: 'error', text: 'Passwords do not match. Please re-check.' });
      return;
    }

    if (role === 'farmer' && (!country || !city || !streetAddress)) {
      setAlertMsg({ type: 'error', text: 'Please fill in all the location fields for your farm.' });
      return;
    }

    if (!agreeTerms) {
      setAlertMsg({ type: 'error', text: 'You must agree to the Terms and Conditions.' });
      return;
    }

    setLoading(true);
    setAlertMsg(null);

    try {
      // Build FormData for multipart request
      const formData = new FormData();
      formData.append('name', fullName.trim());
      formData.append('email', email.trim().toLowerCase());
      formData.append('password', password);
      formData.append('role', role);
      if (phone.trim()) {
        formData.append('phone', phone.trim());
      }
      if (role === 'farmer') {
        if (country.trim()) formData.append('country', country.trim());
        if (city.trim()) formData.append('city', city.trim());
        if (streetAddress.trim()) formData.append('street', streetAddress.trim());
      }
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }

      const res = await register(formData);
      setLoading(false);
      setStep('otp');
      setTimer(60);
      setCanResend(false);
      setAlertMsg({
        type: 'success',
        text: res.message || 'OTP sent! Please check your email inbox.',
      });
      // Focus first OTP input
      setTimeout(() => {
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }
      }, 300);
    } catch (error) {
      setLoading(false);
      setAlertMsg({
        type: 'error',
        text: error.customMessage || error.response?.data?.message || 'Registration failed. Please try again.',
      });
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.substring(value.length - 1);
    setOtpDigits(newDigits);

    // Auto move to next input
    if (value && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  // Handle Backspace on OTP digits
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      if (otpInputRefs.current[index - 1]) {
        otpInputRefs.current[index - 1].focus();
      }
    }
  };

  // Step 2: Handle OTP verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otpDigits.join('');

    if (otpCode.length !== 6) {
      setAlertMsg({ type: 'error', text: 'Please enter the complete 6-digit OTP code.' });
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
      }, 1200);
    } catch (error) {
      setLoading(false);
      setAlertMsg({
        type: 'error',
        text: error.customMessage || error.response?.data?.message || 'Invalid or expired OTP. Please try again.',
      });
    }
  };

  // Resend OTP
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
      if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
    } catch (error) {
      setLoading(false);
      setAlertMsg({
        type: 'error',
        text: error.customMessage || error.response?.data?.message || 'Failed to resend OTP.',
      });
    }
  };

  // Handle Google OAuth
  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    setAlertMsg(null);
    try {
      const res = await googleLogin(tokenResponse.access_token, role);
      setLoading(false);
      if (res.success) {
        setAlertMsg({ type: 'success', text: 'Google Sign-up successful! Welcome.' });
        setTimeout(() => {
          if (res.user?.role === 'admin' || res.user?.email === 'muhammadabbas09dec@gmail.com') navigate('/admin');
          else if (res.user?.role === 'farmer') navigate('/farmer/dashboard');
          else navigate('/');
        }, 1200);
      }
    } catch (error) {
      setLoading(false);
      setAlertMsg({ type: 'error', text: error.response?.data?.message || 'Google registration failed.' });
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setAlertMsg({ type: 'error', text: 'Google authentication was cancelled or failed.' })
  });

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        {/* Header */}
        <div className="auth-header">
          <Link to="/" className="auth-brand-badge" title="Go to Home">
            <ShoppingBag size={24} />
          </Link>
          <h2 className="auth-title">
            {step === 'register' ? 'Create an Account' : 'Verify Email Address'}
          </h2>
          <p className="auth-subtitle">
            {step === 'register'
              ? 'Join ShopSphere to get personalized recommendations and member discounts.'
              : `We sent a 6-digit verification code to ${email}.`}
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

        {/* ── STEP 1: REGISTRATION FORM ── */}
        {step === 'register' ? (
          <form className="auth-form" onSubmit={handleRegister}>
            {/* Account Type Selector (Customer vs Farmer) */}
            <div className="auth-field-group">
              <label className="auth-label">I want to join MarketLink as a:</label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                  marginBottom: 6,
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
                  <span>Shopper / Customer</span>
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
                  <Leaf size={17} color={role === 'farmer' ? '#059669' : '#94a3b8'} />
                  <span>Local Farmer / Grower</span>
                </button>
              </div>
              <small style={{ fontSize: '0.74rem', color: '#64748b', marginLeft: 2 }}>
                {role === 'farmer'
                  ? 'Sell fresh produce, manage market stall pickup windows, and track pre-orders.'
                  : 'Browse organic produce, place weekend market pre-orders, and leave reviews.'}
              </small>
            </div>

            {/* Profile Avatar Upload (Optional) */}
            <div className="auth-field-group">
              <label className="auth-label">Profile / Farm Logo Photo (Optional)</label>
              <div
                className="auth-file-upload-box"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="auth-avatar-thumb" />
                ) : (
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                    }}
                  >
                    <Camera size={20} />
                  </div>
                )}
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                    {profileImageFile ? profileImageFile.name : 'Upload your photo'}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                    JPG, PNG or WEBP (Max 5MB)
                  </p>
                </div>
                <button
                  type="button"
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Choose
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageSelect}
              />
            </div>

            {/* Full Name */}
            <div className="auth-field-group">
              <label className="auth-label">Full Name</label>
              <div className="auth-input-wrapper">
                <User size={17} className="auth-input-icon" />
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="auth-form-row">
              <div className="auth-field-group">
                <label className="auth-label">Email Address</label>
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

              <div className="auth-field-group">
                <label className="auth-label">Phone (Optional)</label>
                <div className="auth-input-wrapper">
                  <Phone size={17} className="auth-input-icon" />
                  <input
                    type="tel"
                    className="auth-input"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Farmer Location Fields */}
            {role === 'farmer' && (
              <>
                <div className="auth-form-row">
                  <div className="auth-field-group">
                    <label className="auth-label">Country *</label>
                    <div className="auth-input-wrapper">
                      <input type="text" className="auth-input" placeholder="e.g. USA" value={country} onChange={(e) => setCountry(e.target.value)} style={{ paddingLeft: '14px' }} required />
                    </div>
                  </div>
                  <div className="auth-field-group">
                    <label className="auth-label">City *</label>
                    <div className="auth-input-wrapper">
                      <input type="text" className="auth-input" placeholder="e.g. Seattle" value={city} onChange={(e) => setCity(e.target.value)} style={{ paddingLeft: '14px' }} required />
                    </div>
                  </div>
                </div>
                <div className="auth-field-group">
                  <label className="auth-label">Street Address *</label>
                   <div className="auth-input-wrapper">
                      <input type="text" className="auth-input" placeholder="123 Homestead Route" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} style={{ paddingLeft: '14px' }} required />
                   </div>
                </div>
              </>
            )}

            {/* Password */}
            <div className="auth-field-group">
              <label className="auth-label">Password</label>
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

            {/* Confirm Password */}
            <div className="auth-field-group">
              <label className="auth-label">Confirm Password</label>
              <div className="auth-input-wrapper">
                <Lock size={17} className="auth-input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Repeat your password"
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

            {/* Agree to terms */}
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                required
              />
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                I agree to the{' '}
                <a href="#terms" style={{ color: '#10b981', fontWeight: 600 }}>
                  Terms of Service
                </a>{' '}
                &{' '}
                <a href="#privacy" style={{ color: '#10b981', fontWeight: 600 }}>
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            {/* Submit */}
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              <span>{loading ? 'Creating Account & Sending OTP...' : 'Continue to Verification'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
            
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
                Sign up with Google
              </button>
            </div>
          </form>
        ) : (
          /* ── STEP 2: OTP VERIFICATION FORM ── */
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

              <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0 }}>
                Enter the 6-digit verification code sent to <strong>{email}</strong>.
              </p>

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
              <span>{loading ? 'Verifying OTP...' : 'Verify & Complete Registration'}</span>
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
                setStep('register');
                setAlertMsg(null);
              }}
            >
              ← Edit Registration Details
            </button>
          </form>
        )}

        {/* Switch Link */}
        <p className="auth-switch-text">
          Already have an account?
          <Link to="/login">Sign in instead</Link>
        </p>
      </div>
    </div>
  );
}
