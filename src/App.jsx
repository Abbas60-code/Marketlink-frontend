import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import CartDrawer from './components/shared/CartDrawer.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Markets from './pages/Markets.jsx';
import Farmers from './pages/Farmers.jsx';
import Cart from './pages/Cart.jsx';
import FarmerDashboard from './pages/FarmerDashboard.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';

import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import Profile from './pages/Profile.jsx';
import Favorites from './pages/Favorites.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

import ChatLauncher from './components/chat/ChatLauncher.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { LocationProvider } from './context/LocationContext.jsx';
import { ToastProvider, LocationPermissionModal, ScrollToTop } from './components/shared/index.jsx';

// Storefront layout wrapper with Navbar and Footer
function StoreLayout({ children }) {
  return (
    <div
      className="store-layout"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100%'
      }}
    >
      <Navbar />
      <main style={{ flex: 1, width: '100%' }}>{children}</main>
      <Footer />
      {/* Sliding Cart Drawer */}
      <CartDrawer />
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Exception caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0f172a',
            color: '#ffffff',
            padding: 24,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              maxWidth: 480,
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 16,
              padding: 32,
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}
          >
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f87171', marginBottom: 12 }}>
              Something went wrong loading this view
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: 20 }}>
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                style={{
                  background: '#334155',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LocationProvider>
          <CartProvider>
            <ToastProvider>
              <BrowserRouter>
                {/* Global Chat Launcher -- placed outside particular layouts so position: fixed works across all pages without containing block issues */}
                <ChatLauncher />
                <LocationPermissionModal />
                <ScrollToTop />
                <Routes>
                  {/* Public Storefront Routes */}
                  <Route path="/" element={<StoreLayout><Home /></StoreLayout>} />
                  <Route path="/products" element={<StoreLayout><Products /></StoreLayout>} />
                  <Route path="/products/:id" element={<StoreLayout><ProductDetails /></StoreLayout>} />
                  <Route path="/markets" element={<StoreLayout><Markets /></StoreLayout>} />
                  <Route path="/markets/:id" element={<StoreLayout><Products /></StoreLayout>} />
                  <Route path="/farmers" element={<StoreLayout><Farmers /></StoreLayout>} />
                  <Route path="/farmers/:id" element={<StoreLayout><Products /></StoreLayout>} />
                  <Route path="/cart" element={<StoreLayout><Cart /></StoreLayout>} />
                  <Route path="/favorites" element={<StoreLayout><Favorites /></StoreLayout>} />
                  {/* Farmer Portal & Management Routes */}
                  <Route path="/farmer-dashboard" element={<StoreLayout><FarmerDashboard /></StoreLayout>} />
                  <Route path="/farmer/dashboard" element={<StoreLayout><FarmerDashboard /></StoreLayout>} />
                  <Route path="/farmer/profile" element={<StoreLayout><FarmerDashboard /></StoreLayout>} />
                  <Route path="/farmer/products" element={<StoreLayout><FarmerDashboard /></StoreLayout>} />
                  <Route path="/farmer/products/create" element={<StoreLayout><FarmerDashboard /></StoreLayout>} />
                  <Route path="/farmer/orders" element={<StoreLayout><FarmerDashboard /></StoreLayout>} />
                  <Route path="/farmer/reviews" element={<StoreLayout><FarmerDashboard /></StoreLayout>} />
                  <Route path="/farmer/weekly-stock" element={<StoreLayout><FarmerDashboard /></StoreLayout>} />
                  <Route path="/about" element={<StoreLayout><About /></StoreLayout>} />
                  <Route path="/contact" element={<StoreLayout><Contact /></StoreLayout>} />

                  {/* Authentication Routes */}
                  <Route path="/login" element={<StoreLayout><Login /></StoreLayout>} />
                  <Route path="/register" element={<StoreLayout><Register /></StoreLayout>} />
                  <Route path="/forgot-password" element={<StoreLayout><ForgotPassword /></StoreLayout>} />
                  <Route path="/reset-password" element={<StoreLayout><ResetPassword /></StoreLayout>} />
                  <Route path="/profile" element={<StoreLayout><Profile /></StoreLayout>} />

                  {/* Dedicated Admin Dashboard Route */}
                  <Route
                    path="/admin/*"
                    element={
                      <ErrorBoundary>
                        <div
                          className="app-container"
                          style={{
                            width: '100%',
                            maxWidth: '100%',
                            minHeight: '100vh',
                            display: 'flex',
                            flexDirection: 'column',
                            flex: 1,
                            overflowX: 'hidden'
                          }}
                        >
                          <AdminDashboard />
                        </div>
                      </ErrorBoundary>
                    }
                  />

                  {/* Fallback redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </ToastProvider>
          </CartProvider>
        </LocationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
