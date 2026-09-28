import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService.js';

const LocationContext = createContext(null);

const STORAGE_KEY = 'techwiz_user_location';
const DISMISS_KEY = 'techwiz_location_dismissed_at';
const DISMISS_WINDOW_MS = 24 * 60 * 60 * 1000;

const EARTH_RADIUS_KM = 6371;
const toRad = (deg) => (deg * Math.PI) / 180;

export const getDistanceKm = (from, to) => {
  if (!from || !to) return null;
  const lat1 = Number(from.lat);
  const lng1 = Number(from.lng);
  const lat2 = Number(to.lat);
  const lng2 = Number(to.lng);
  if ([lat1, lng1, lat2, lng2].some(v => Number.isNaN(v))) return null;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [permissionStatus, setPermissionStatus] = useState(() => {
    if (typeof navigator === 'undefined' || !navigator.permissions) return 'prompt';
    return 'prompt';
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [promptGeneration, setPromptGeneration] = useState(0);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((status) => {
          setPermissionStatus(status.state);
          status.onchange = () => setPermissionStatus(status.state);
        })
        .catch(() => setPermissionStatus('prompt'));
    }
  }, []);

  const saveToStorage = useCallback((loc) => {
    if (loc) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...loc, savedAt: Date.now() }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const saveLocationToBackend = useCallback(async (lat, lng) => {
    const token = localStorage.getItem('techwiz_token');
    if (!token) return null;
    try {
      const res = await authService.saveLocation(lat, lng);
      return res;
    } catch (err) {
      console.warn('Could not save location to backend:', err?.message || err);
      return null;
    }
  }, []);

  const requestLocation = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setPermissionStatus('unsupported');
      setError('Location is not supported by this browser or insecure context.');
      return { ok: false, error: 'unsupported' };
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const loc = { lat, lng, accuracy: position.coords.accuracy, savedAt: Date.now() };
          setUserLocation(loc);
          saveToStorage(loc);
          setPermissionStatus('granted');
          setLoading(false);
          await saveLocationToBackend(lat, lng);
          resolve({ ok: true, location: loc });
        },
        (err) => {
          setLoading(false);
          let msg = 'Unable to retrieve your location.';
          if (err?.code === 1) {
            setPermissionStatus('denied');
            msg = 'Location permission was denied. You can enable it in your browser settings.';
          } else if (err?.code === 2) {
            msg = 'Your position could not be determined.';
          } else if (err?.code === 3) {
            msg = 'Location request timed out.';
          }
          setError(msg);
          resolve({ ok: false, error: err?.code || 'unknown', message: msg });
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      );
    });
  }, [saveToStorage, saveLocationToBackend]);

  const clearLocation = useCallback(() => {
    setUserLocation(null);
    saveToStorage(null);
    setError(null);
  }, [saveToStorage]);

  const markDismissed = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  }, []);

  const resetDismissFlag = useCallback(() => {
    localStorage.removeItem(DISMISS_KEY);
  }, []);

  const triggerPrompt = useCallback(() => {
    resetDismissFlag();
    setPromptGeneration((g) => g + 1);
  }, [resetDismissFlag]);

  useEffect(() => {
    const onLogin = () => triggerPrompt();
    window.addEventListener('techwiz:login-success', onLogin);
    return () => window.removeEventListener('techwiz:login-success', onLogin);
  }, [triggerPrompt]);

  const shouldPrompt = useCallback(({ force = false } = {}) => {
    if (userLocation) return false;
    if (permissionStatus === 'granted') return false;
    if (force) return true;
    if (permissionStatus === 'denied') return false;

    // Keep the prompt visible on first load and after a reload when the user has not
    // explicitly granted access yet. The 24h dismiss flag should not permanently hide
    // the request when the user is simply opening the site again without a saved location.
    const lastDismissed = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (lastDismissed && Date.now() - lastDismissed < DISMISS_WINDOW_MS && permissionStatus !== 'prompt') {
      return false;
    }
    return true;
  }, [permissionStatus, userLocation]);

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        permissionStatus,
        loading,
        error,
        requestLocation,
        clearLocation,
        saveLocationToBackend,
        markDismissed,
        resetDismissFlag,
        triggerPrompt,
        promptGeneration,
        shouldPrompt,
        getDistanceKm,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
};

export default LocationContext;
