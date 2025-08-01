// src/hooks/useDraftAudios.js
import { useState, useEffect, useCallback } from 'react'; // 1. Importamos useCallback
import useAuth from './UseAuth';
import Url from '../helpers/Url';

/**
 * Hook para cargar borradores de audios con paginación opcional.
 *
 * @param {object} options
 * @param {number} options.page  — página actual (default: 1)
 * @param {number} options.limit — cantidad por página (default: 10)
 */
export default function useDraftAudios({ page = 1, limit = 6 } = {}) {
    const [audios, setAudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { authFetch } = useAuth();

    // 2. Envolvemos la lógica del fetch en un useCallback.
    // Esto la memoriza y solo la vuelve a crear si sus dependencias (page, limit, etc.) cambian.
    const fetchDrafts = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await authFetch(
                `${Url.url}/api/audios/drafts?page=${page}&limit=${limit}`,
                {
                    headers: { 'Accept': 'application/json' }
                }
            );

            if (!res.ok) {
                const errJson = await res.json().catch(() => ({}));
                throw new Error(errJson.message || res.statusText);
            }

            const json = await res.json();
            const items = json.items || [];
            setAudios(items);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [page, limit, authFetch]);


    // 3. El useEffect ahora es más simple. Solo depende de la función fetchDrafts.
    // Se ejecutará la primera vez y cada vez que la paginación cambie.
    useEffect(() => {
        fetchDrafts();
    }, [fetchDrafts]);


    // 4. Retornamos el estado y la función para refrescar.
    return { audios, loading, error, refresh: fetchDrafts };
}