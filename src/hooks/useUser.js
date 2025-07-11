// src/hooks/useUser.js
import { useState, useCallback, useEffect } from 'react';
import Url from '../helpers/Url';
import useAuth from './UseAuth';

export default function useUser() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Solo necesitamos 'authFetch' del contexto de autenticación
    const { authFetch } = useAuth();

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await authFetch(`${Url.url}/api/users/profile`);
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || "Error al obtener el perfil.");
            setProfile(body.data); // Correcto: usa body.data
        } catch (err) {
            setError(err.message);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    const updateUserProfile = useCallback(async (dataToUpdate) => {
        setLoading(true);
        setError(null);
        try {
            const res = await authFetch(`${Url.url}/api/users/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToUpdate),
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || "Error al actualizar el perfil.");

            // Actualiza solo el estado local del hook
            setProfile(prevProfile => ({ ...prevProfile, ...dataToUpdate }));

            return { success: true, message: body.message };
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    const updateUserImage = useCallback(async (imageFile) => {
        setLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append('image', imageFile);
        try {
            const res = await authFetch(`${Url.url}/api/users/update-image`, {
                method: 'PUT',
                body: formData,
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || "Error al actualizar la imagen.");
            const { imageUrl } = body;

            // Actualiza solo el estado local del hook
            setProfile(prevProfile => ({ ...prevProfile, user_image: imageUrl }));

            return { success: true, imageUrl };
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return {
        profile,
        loading,
        error,
        updateUserProfile,
        updateUserImage,
        refreshProfile: fetchProfile,
    };
}