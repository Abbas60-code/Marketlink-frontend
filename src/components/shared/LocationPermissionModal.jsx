import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, X, AlertTriangle, CheckCircle, ShieldCheck, Navigation } from 'lucide-react';
import { useLocation } from '../../context/LocationContext.jsx';
import './LocationPermissionModal.css';

export default function LocationPermissionModal() {
  const {
    userLocation,
    permissionStatus,
    loading,
    error,
    requestLocation,
    markDismissed,
    resetDismissFlag,
    shouldPrompt,
    clearLocation,
    promptGeneration,
  } = useLocation();

  const [visible, setVisible] = useState(false);
  const [stage, setStage] = useState('prompt');
  const [triggeredBy, setTriggeredBy] = useState(null);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (!mounted) return;
      if (userLocation || permissionStatus === 'granted' || permissionStatus === 'denied') return;
      if (shouldPrompt()) {
        setStage('prompt');
        setVisible(true);
      }
    }, 250);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [permissionStatus, shouldPrompt, userLocation]);

  useEffect(() => {
    if (userLocation || permissionStatus === 'granted' || permissionStatus === 'denied') return;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('techwiz_user_location');
      if (!saved) {
        setStage('prompt');
        setVisible(true);
      }
    }
  }, [permissionStatus, userLocation]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = visible ? 'hidden' : previousOverflow;
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  useEffect(() => {
    if (promptGeneration === 0) return;
    const t = setTimeout(() => {
      if (permissionStatus === 'granted') return;
      resetDismissFlag();
      setTriggeredBy('login');
      if (permissionStatus === 'denied' || permissionStatus === 'prompt') {
        setStage('prompt');
      } else if (error) {
        setStage('error');
      } else {
        setStage('prompt');
      }
      setVisible(true);
    }, 250);
    return () => clearTimeout(t);
  }, [promptGeneration, permissionStatus, resetDismissFlag, error]);

  useEffect(() => {
    if (!visible) return;
    if (error) setStage('error');
    else if (userLocation && stage === 'requesting') setStage('granted');
  }, [error, userLocation, visible, stage]);

  if (!visible) return null;

  const handleAllow = async () => {
    setStage('requesting');
    const res = await requestLocation();
    if (res.ok) {
      setTimeout(() => closeModal(), 1400);
    } else if (res.error === 'unsupported') {
      setStage('unsupported');
    }
  };

  const handleRetry = () => {
    setStage('prompt');
    handleAllow();
  };

  const closeModal = () => {
    markDismissed();
    setVisible(false);
  };

  const modalContent = (
    <div className="loc-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="loc-modal-title">
      <div className={`loc-modal-card loc-modal-${stage}`}>
        <button
          type="button"
          className="loc-modal-close"
          onClick={closeModal}
          aria-label="Close location permission"
        >
          <X size={18} />
        </button>

        {stage === 'prompt' && (
          <>
            <div className="loc-modal-icon-wrap loc-icon-prompt">
              <MapPin size={28} />
            </div>
            <h3 id="loc-modal-title" className="loc-modal-title">
              Share your location
            </h3>
            <p className="loc-modal-text">
              We need your location to automatically show nearby <strong>farmers</strong> and <strong>markets</strong> on the map.
            </p>
            <div className="loc-modal-privacy">
              <ShieldCheck size={16} />
              <span>
                Used only to show nearby results — never shared publicly.
              </span>
            </div>
            <div className="loc-modal-actions">
              <button type="button" className="loc-btn loc-btn-ghost" onClick={closeModal}>
                Not now
              </button>
              <button
                type="button"
                className="loc-btn loc-btn-primary"
                onClick={handleAllow}
                disabled={loading}
              >
                <Navigation size={16} /> Allow location
              </button>
            </div>
          </>
        )}

        {stage === 'requesting' && (
          <>
            <div className="loc-modal-icon-wrap loc-icon-requesting">
              <div className="loc-spinner" />
            </div>
            <h3 id="loc-modal-title" className="loc-modal-title">
              Requesting location access...
            </h3>
            <p className="loc-modal-text">
              Click <strong>"Allow"</strong> in the browser popup so we can get your current location.
            </p>
          </>
        )}

        {stage === 'granted' && (
          <>
            <div className="loc-modal-icon-wrap loc-icon-granted">
              <CheckCircle size={30} />
            </div>
            <h3 id="loc-modal-title" className="loc-modal-title">
              Location saved!
            </h3>
            <p className="loc-modal-text">
              Now <strong>{userLocation ? 'nearby' : 'local'}</strong> farmers and markets will
              <strong> automatically appear on the map</strong>, sorted by distance.
            </p>
            <div className="loc-modal-coords">
              <MapPin size={14} />
              <span>
                {userLocation
                  ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                  : 'Coordinates received'}
              </span>
            </div>
            <div className="loc-modal-actions" style={{ marginTop: 16 }}>
              <button
                type="button"
                className="loc-btn loc-btn-ghost"
                onClick={() => {
                  clearLocation();
                  setStage('prompt');
                }}
              >
                Reset
              </button>
              <button type="button" className="loc-btn loc-btn-primary" onClick={closeModal}>
                Got it
              </button>
            </div>
          </>
        )}

        {stage === 'denied' && (
          <>
            <div className="loc-modal-icon-wrap loc-icon-denied">
              <AlertTriangle size={28} />
            </div>
            <h3 id="loc-modal-title" className="loc-modal-title">
              Permission denied
            </h3>
            <p className="loc-modal-text">
              You can still find farmers and markets using the <strong>search / city</strong> field.
              To enable location, click the location icon in your browser's address bar.
            </p>
            <div className="loc-modal-actions">
              <button type="button" className="loc-btn loc-btn-ghost" onClick={closeModal}>
                Okay
              </button>
              <button type="button" className="loc-btn loc-btn-primary" onClick={handleRetry}>
                Try again
              </button>
            </div>
          </>
        )}

        {stage === 'error' && (
          <>
            <div className="loc-modal-icon-wrap loc-icon-denied">
              <AlertTriangle size={28} />
            </div>
            <h3 id="loc-modal-title" className="loc-modal-title">
              Could not get location
            </h3>
            <p className="loc-modal-text">{error || 'We couldn\'t get your location due to a technical issue.'}</p>
            <div className="loc-modal-actions">
              <button type="button" className="loc-btn loc-btn-ghost" onClick={closeModal}>
                Close
              </button>
              <button type="button" className="loc-btn loc-btn-primary" onClick={handleRetry}>
                Retry
              </button>
            </div>
          </>
        )}

        {stage === 'unsupported' && (
          <>
            <div className="loc-modal-icon-wrap loc-icon-denied">
              <AlertTriangle size={28} />
            </div>
            <h3 id="loc-modal-title" className="loc-modal-title">
              Browser not supported
            </h3>
            <p className="loc-modal-text">
              This browser or connection (insecure HTTP) doesn't support the location API.
              You can still search by entering a city in the search bar.
            </p>
            <div className="loc-modal-actions">
              <button type="button" className="loc-btn loc-btn-primary" onClick={closeModal}>
                Okay
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
