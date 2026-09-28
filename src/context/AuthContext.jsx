import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('techwiz_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('techwiz_token') || null;
  });

  const [loading, setLoading] = useState(true);

  // Validate token and sync profile on app load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('techwiz_token');
      if (storedToken) {
        try {
          const profileData = await authService.getProfile();
          if (profileData) {
            setUser(profileData);
            localStorage.setItem('techwiz_user', JSON.stringify(profileData));
          }
        } catch (error) {
          console.warn('Session expired or invalid token:', error.message);
          // If token failed, clear credentials
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login handler — Step 1 (password verify, then 2FA OTP sent)
  const login = async (email, password, role) => {
    try {
      const res = await authService.login(email, password, role);
      // 2FA required — don't store token yet
      if (res.requires2FA) {
        return { success: false, requires2FA: true, email: res.email, message: res.message };
      }
      // Fallback: direct token (should not happen with 2FA enabled)
      if (res.token) {
        const userData = {
          _id: res._id,
          name: res.name,
          email: res.email,
          role: res.role,
          profileImage: res.profileImage,
        };
        setToken(res.token);
        setUser(userData);
        localStorage.setItem('techwiz_token', res.token);
        localStorage.setItem('techwiz_user', JSON.stringify(userData));
        try { window.dispatchEvent(new CustomEvent('techwiz:login-success')); } catch {}
        return { success: true, user: userData, token: res.token };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      if (error.response?.data?.unverified) {
        return {
          success: false,
          unverified: true,
          email: error.response.data.email || email,
          message: error.response.data.message || 'Please verify your OTP',
        };
      }
      throw error;
    }
  };

  // Google Login handler
  const googleLogin = async (credential, role) => {
    try {
      const res = await authService.googleLogin(credential, role);
      if (res.token) {
        const userData = {
          _id: res.user._id,
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
          profileImage: res.user.profileImage,
        };
        setToken(res.token);
        setUser(userData);
        localStorage.setItem('techwiz_token', res.token);
        localStorage.setItem('techwiz_user', JSON.stringify(userData));
        try { window.dispatchEvent(new CustomEvent('techwiz:login-success')); } catch {}
        return { success: true, user: userData, token: res.token };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      throw error;
    }
  };

  // Verify 2FA OTP — Step 2 (returns JWT, stores user)
  const verify2FA = async (email, otp) => {
    const res = await authService.verify2FA(email, otp);
    if (res.token) {
      const userData = {
        _id: res._id,
        name: res.name,
        email: res.email,
        role: res.role,
        profileImage: res.profileImage,
      };
      setToken(res.token);
      setUser(userData);
      localStorage.setItem('techwiz_token', res.token);
      localStorage.setItem('techwiz_user', JSON.stringify(userData));
      try { window.dispatchEvent(new CustomEvent('techwiz:login-success')); } catch {}
      return { success: true, user: userData };
    }
    return res;
  };

  // Register handler (Step 1: Triggers OTP)
  const register = async (formData) => {
    const res = await authService.register(formData);
    return res;
  };

  // Verify OTP handler (Step 2: Completes Registration & Logs In)
  const verifyOtp = async (email, otp) => {
    const res = await authService.verifyOtp(email, otp);
    if (res.token) {
      const userData = {
        _id: res._id,
        name: res.name,
        email: res.email,
        role: res.role,
        profileImage: res.profileImage,
      };
      setToken(res.token);
      setUser(userData);
      localStorage.setItem('techwiz_token', res.token);
      localStorage.setItem('techwiz_user', JSON.stringify(userData));
      try { window.dispatchEvent(new CustomEvent('techwiz:login-success')); } catch {}
      return { success: true, user: userData };
    }
    return res;
  };

  // Resend OTP handler
  const resendOtp = async (email) => {
    return await authService.resendOtp(email);
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('techwiz_token');
    localStorage.removeItem('techwiz_user');
  };

  // Update Profile Image handler
  const updateProfileImage = async (file) => {
    const res = await authService.updateProfileImage(file);
    if (res.profileImage && user) {
      const updatedUser = { ...user, profileImage: res.profileImage };
      setUser(updatedUser);
      localStorage.setItem('techwiz_user', JSON.stringify(updatedUser));
    }
    return res;
  };

  // Update local user state
  const updateLocalUser = (updatedData) => {
    if (user) {
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      localStorage.setItem('techwiz_user', JSON.stringify(updatedUser));
    }
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = isAuthenticated && (user?.role === 'admin' || user?.email === 'muhammadabbas09dec@gmail.com');
  const isFarmer = isAuthenticated && user?.role === 'farmer';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isFarmer,
        login,
        googleLogin,
        register,
        verifyOtp,
        resendOtp,
        verify2FA,
        logout,
        updateProfileImage,
        updateLocalUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
