import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import API from '../../services/api.js';

// Load Stripe (Using a demo public key for development if none provided in env)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

const CheckoutForm = ({ amount, clientSecret, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setProcessing(true);
    setError(null);
    
    // Real implementation connecting to backend
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      }
    });

    if (stripeError) {
      setError(stripeError.message);
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setProcessing(false);
      onSuccess({ paymentId: paymentIntent.id });
    } else {
      setError('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
      <div style={{ padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc', marginBottom: '16px' }}>
        <CardElement options={{
          style: {
            base: {
              fontSize: '15px',
              color: '#334155',
              fontFamily: 'Inter, sans-serif',
              '::placeholder': { color: '#94a3b8' },
            },
            invalid: { color: '#ef4444' },
          }
        }} />
      </div>
      
      {error && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="button" onClick={onCancel} className="btn btn-ghost" disabled={processing} style={{ flex: 1 }}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={!stripe || !clientSecret || processing} style={{ flex: 1 }}>
          {processing ? 'Processing Payment...' : `Pay Now`}
        </button>
      </div>
    </form>
  );
};

export default function StripeCheckoutWrapper({ amount, onSuccess, onCancel }) {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [setupError, setSetupError] = useState(null);

  useEffect(() => {
    const getClientSecret = async () => {
      try {
        const response = await API.post('/orders/create-payment-intent', { amount });
        if (response.data?.clientSecret) {
          setClientSecret(response.data.clientSecret);
        } else {
          setSetupError('Failed to initialize payment gateway.');
        }
      } catch (err) {
        setSetupError(err.response?.data?.message || 'Error connecting to payment provider.');
      } finally {
        setLoading(false);
      }
    };
    getClientSecret();
  }, [amount]);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Initializing secure payment...</div>;
  }

  if (setupError) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ color: '#ef4444', marginBottom: '10px' }}>{setupError}</div>
        <button type="button" onClick={onCancel} className="btn btn-outline">Go Back</button>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm amount={amount} clientSecret={clientSecret} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}
