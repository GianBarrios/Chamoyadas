import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getItem, setItem } from '../utils/storage';

const CategoriesContext = createContext(null);
const KEY = '@chamoy_control/categorias_gasto';
const DEFAULTS = ['Insumos', 'Transporte', 'Empaque', 'Renta', 'Otros'];

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await getItem(KEY, null);
      if (stored && stored.length) setCategories(stored);
      else await setItem(KEY, DEFAULTS);
      setLoading(false);
    })();
  }, []);

  const addCategory = useCallback((name) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    setCategories((prev) => {
      if (prev.includes(trimmed)) return prev;
      const next = [...prev, trimmed];
      setItem(KEY, next);
      return next;
    });
  }, []);

  const removeCategory = useCallback((name) => {
    setCategories((prev) => {
      const next = prev.filter((c) => c !== name);
      setItem(KEY, next);
      return next;
    });
  }, []);

  return (
    <CategoriesContext.Provider value={{ categories, loading, addCategory, removeCategory }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error('useCategories debe usarse dentro de CategoriesProvider');
  return ctx;
}
