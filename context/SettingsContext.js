import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getItem, setItem } from '../utils/storage';

const SettingsContext = createContext(null);
const KEY = '@chamoy_control/settings';

const DEFAULTS = {
  businessName: '',
  currency: 'MXN',
  aperturaDefault: 0,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [onboarded, setOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await getItem(KEY, null);
      if (stored) {
        setSettings({ ...DEFAULTS, ...stored });
        setOnboarded(!!stored.onboarded);
      }
      setLoading(false);
    })();
  }, []);

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      setItem(KEY, { ...next, onboarded: true });
      return next;
    });
  }, []);

  const completeOnboarding = useCallback(async (initial) => {
    const next = { ...DEFAULTS, ...initial, onboarded: true };
    await setItem(KEY, next);
    setSettings(next);
    setOnboarded(true);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, onboarded, updateSettings, completeOnboarding }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings debe usarse dentro de SettingsProvider');
  return ctx;
}
