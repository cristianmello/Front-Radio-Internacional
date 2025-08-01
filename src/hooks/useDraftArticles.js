// src/hooks/useDraftArticles.js
import { useState, useEffect } from 'react';
import Url from '../helpers/Url';
import useAuth from './UseAuth';

export default function useDraftArticles() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authFetch } = useAuth();

    useEffect(() => {
        let isMounted = true;

        async function fetchDrafts() {
            setLoading(true);
            try {
                const res = await authFetch(`${Url.url}/api/articles/drafts`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || 'Error al cargar borradores');
                if (isMounted) setArticles(json.items || []);
            } catch (err) {
                if (isMounted) setError(err.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchDrafts();
        return () => { isMounted = false; };
    }, [authFetch]);

    return { articles, loading, error };
}
