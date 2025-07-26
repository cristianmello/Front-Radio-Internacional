/* src/hooks/useCategories.js */
import { useState, useEffect, useCallback } from 'react';
import Url from '../helpers/Url';
import useAuth from './UseAuth';

export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authFetch } = useAuth();

  // CAMBIO 1: La función ahora acepta un objeto de opciones
  const fetchCategories = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);
    try {

      const res = await fetch(`${Url.url}/api/categories`, { cache: 'no-cache' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Error al cargar categorías');
      setCategories(body.data);
    } catch (err) {
      setError(err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []); // La dependencia sigue vacía, es correcto

  // CAMBIO 3: Creamos una función de refresco que SIEMPRE fuerza la recarga
  const refreshCategories = useCallback(() => {
    fetchCategories({ force: true });
  }, [fetchCategories]);

  const addCategory = useCallback(async (data) => {
    setLoading(true);
    try {
      const res = await authFetch(`${Url.url}/api/categories`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message);
      // CAMBIO 4: Usamos la nueva función de refresco forzado
      refreshCategories();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, [authFetch, refreshCategories]); // <-- dependencia actualizada

  const deleteCategory = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await authFetch(`${Url.url}/api/categories/${id}`, {
        method: 'DELETE'
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message);
      // CAMBIO 5: Usamos la nueva función de refresco forzado
      refreshCategories();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, [authFetch, refreshCategories]); // <-- dependencia actualizada

  useEffect(() => {
    // La carga inicial no necesita forzar, así usa el caché si está disponible
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    // CAMBIO 6: Exportamos la nueva función de refresco
    refresh: refreshCategories,
    addCategory,
    deleteCategory
  };
}