import { useState, useEffect } from 'react';
import Url from '../helpers/Url';

export default function useDraftShorts({ page = 1, limit = 10 } = {}) {
    const [shorts, setShorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch(`${Url.url}/api/shorts/drafts?page=${page}&limit=${limit}`)
            .then(res => {
                if (!res.ok) throw new Error('Error cargando borradores');
                return res.json();
            })
            .then(json => {
                if (json.status !== 'success') {
                    throw new Error(json.message || 'Error en la respuesta');
                }
                setShorts(json.items);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [page, limit]);

    return { shorts, loading, error };
}
