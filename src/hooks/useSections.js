import { useState, useEffect, useCallback } from 'react';
import Url from '../helpers/Url';
import useAuth from './UseAuth';

export default function useSections() {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { authFetch } = useAuth();

    const fetchSections = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {

            const res = await authFetch(`${Url.url}/api/sections`, { cache: 'no-cache' });
            // ===============================================================

            if (!res.ok) {
                throw new Error(`Error al cargar secciones: ${res.statusText}`);
            }
            const json = await res.json();
            const data = json.sections || json.items || [];
            data.sort((a, b) => a.section_position - b.section_position);
            setSections(data);
        } catch (err) {
            console.error('[useSections] fetchSections:', err);
            setError(err.message);
            setSections([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        fetchSections();
        // El sistema de eventos sigue siendo útil si quieres que otros componentes
        // que no sean hijos directos puedan forzar una recarga.
        const handler = () => fetchSections();
        window.addEventListener('sectionsUpdated', handler);
        return () => window.removeEventListener('sectionsUpdated', handler);
    }, [fetchSections]);

    const createSection = useCallback(async ({ title, type }) => {
        try {
            const payload = { section_title: title, section_type: type };
            const res = await authFetch(`${Url.url}/api/sections`, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errorJson = await res.json();
                throw new Error(errorJson.message || 'Error al crear sección');
            }
            // Después de crear, disparamos el evento para que la lista se refresque.
         //   window.dispatchEvent(new Event('sectionsUpdated'));
            return { success: true };
        } catch (err) {
            console.error('[useSections] createSection:', err);
            throw err;
        }
    }, [authFetch]);

    return { sections, setSections, loading, error, refresh: fetchSections, createSection };
}