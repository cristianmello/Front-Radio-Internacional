// src/hooks/useRoles.js
import { useState, useEffect, useCallback } from 'react';
import useAuth from './UseAuth';
import Url from '../helpers/Url';

export default function useRoles() {
    const { authFetch } = useAuth();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await authFetch(`${Url.url}/api/users/roles`);
            const data = await response.json();
            if (!response.ok) throw new Error('No se pudieron cargar los roles.');
            setRoles(data.roles);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    return { roles, loading };
}