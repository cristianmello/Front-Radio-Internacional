// src/hooks/useAvailableArticlesForSection.js
import { useState, useEffect } from 'react';
import Url from '../helpers/Url';
import useAuth from './useAuth';

export default function useAvailableArticlesForSection(sectionSlug) {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authFetch } = useAuth();

    useEffect(() => {
        let isMounted = true;

        async function fetchAvailableArticles() {
            // ✅ 3. Si no hay un slug de sección, no hacemos nada.
            if (!sectionSlug) {
                setArticles([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const res = await authFetch(`${Url.url}/api/articles/available-for-section?section_slug=${sectionSlug}`);

                const json = await res.json();
                if (!res.ok) throw new Error(json.message || 'Error al cargar artículos disponibles');
                if (isMounted) setArticles(json.items || []);
            } catch (err) {
                if (isMounted) setError(err.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchAvailableArticles();
        return () => { isMounted = false; };

        // ✅ 5. El efecto se volverá a ejecutar cada vez que cambie el 'sectionSlug'.
    }, [sectionSlug, authFetch]);

    return { articles, loading, error };
}