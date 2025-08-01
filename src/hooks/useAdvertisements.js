import { useState, useEffect, useCallback } from 'react';
import Url from '../helpers/Url';
import useAuth from './UseAuth';

/**
 * Hook para obtener una lista de anuncios con filtros, paginación y ordenamiento.
 * @param {object} options - Opciones de consulta { page, limit, sortBy, order, type, active, search }
 */
export default function useAdvertisements(options = {}) {
    const [advertisements, setAdvertisements] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authFetch } = useAuth();

    const fetchAdvertisements = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Construye la cadena de consulta a partir de las opciones
            const queryParams = new URLSearchParams();
            Object.entries(options).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });
            const queryString = queryParams.toString();

            const res = await authFetch(`${Url.url}/api/advertisements?${queryString}`);
            const body = await res.json();

            if (!res.ok) throw new Error(body.message || 'Error al cargar los anuncios');
            
            setAdvertisements(body.advertisements || []);
            setPagination(body.pagination || null);

        } catch (err) {
            setError(err.message);
            setAdvertisements([]);
            setPagination(null);
        } finally {
            setLoading(false);
        }
    }, [authFetch, JSON.stringify(options)]); // Dependencia clave para que se recargue si las opciones cambian

    useEffect(() => {
        fetchAdvertisements();
    }, [fetchAdvertisements]);

    return {
        advertisements,
        pagination,
        loading,
        error,
        refresh: fetchAdvertisements, // Exportamos una función para refrescar manualmente
    };
}