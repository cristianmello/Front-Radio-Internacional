import { useState, useEffect, useCallback } from 'react';
import Url from '../helpers/Url';
import useAuth from './UseAuth';

export default function useSections() {
    const [sections, setSections] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authFetch } = useAuth();

    const fetchHomePageData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await authFetch(`${Url.url}/api/pages/home`, { cache: 'no-cache' });

            if (!res.ok) {
                throw new Error(`Error al cargar los datos de la página: ${res.statusText}`);
            }
            const json = await res.json();

            setSections(json.sections || []);
            setCategories(json.categories || []);

        } catch (err) {
            console.error('[useSections] fetchHomePageData:', err);
            setError(err.message);
            setSections([]);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        fetchHomePageData();
    }, [fetchHomePageData]);

    // La función para crear una sección se mantiene, pero ahora refresca todo.
    const createSection = useCallback(async ({ title, type }) => {
        try {
            const payload = { section_title: title, section_type: type };
            const res = await authFetch(`${Url.url}/api/sections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errorJson = await res.json();
                throw new Error(errorJson.message || 'Error al crear sección');
            }
            // Después de crear, volvemos a pedir todos los datos de la página
            await fetchHomePageData();
            return { success: true };
        } catch (err) {
            console.error('[useSections] createSection:', err);
            return { success: false, message: err.message };
        }
    }, [authFetch, fetchHomePageData]);

    return {
        sections,
        categories,
        loading,
        error,
        refresh: fetchHomePageData,
        createSection
    };
}