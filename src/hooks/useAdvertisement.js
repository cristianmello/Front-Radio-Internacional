import { useState, useEffect, useCallback } from 'react';
import Url from '../helpers/Url';
import useAuth from './useAuth';

/**
 * Hook para gestionar un único anuncio (CRUD).
 * @param {number|string|null} id - ID del anuncio a cargar para edición/lectura.
 */
export default function useAdvertisement(id) {
    const [advertisement, setAdvertisement] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { authFetch } = useAuth();

    // --- LEER (READ) ---
    const fetchAdvertisement = useCallback(async () => {
        if (id == null) {
            setAdvertisement(null);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await authFetch(`${Url.url}/api/advertisements/${id}`);
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || "Error obteniendo el anuncio");
            setAdvertisement(body.advertisement);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id, authFetch]);

    useEffect(() => {
        // Solo busca un anuncio si se proporciona un ID
        if (id) {
            fetchAdvertisement();
        }
    }, [id, fetchAdvertisement]);

    // --- CREAR (CREATE) ---
    const addAdvertisement = useCallback(async (formData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await authFetch(`${Url.url}/api/advertisements`, {
                method: 'POST',
                body: formData, // FormData se encarga de los headers automáticamente
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || "Error creando el anuncio");
            return { success: true, advertisement: body.advertisement };
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    // --- ACTUALIZAR (UPDATE) ---
    const editAdvertisement = useCallback(async (adId, formData) => {
        setLoading(true);
        setError(null);
        try {
            // Usamos PUT para la actualización
            const res = await authFetch(`${Url.url}/api/advertisements/${adId}`, {
                method: 'PUT',
                body: formData,
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || "Error actualizando el anuncio");
            setAdvertisement(body.advertisement); // Actualiza el estado local
            return { success: true, advertisement: body.advertisement };
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    // --- BORRAR (DELETE) ---
    const deleteAdvertisement = useCallback(async (adId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await authFetch(`${Url.url}/api/advertisements/${adId}`, {
                method: 'DELETE',
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || "Error eliminando el anuncio");
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    return {
        advertisement,
        loading,
        error,
        fetchAdvertisement,
        addAdvertisement,
        editAdvertisement,
        deleteAdvertisement,
    };
}