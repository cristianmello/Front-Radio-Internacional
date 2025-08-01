

import { useState, useEffect, useCallback } from "react";
import Url from "../helpers/Url";
import useAuth from "./UseAuth";

export default function useAudio(audioId) {
    const { authFetch, auth } = useAuth();
    const [audio, setAudio] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- LEER (READ) ---
    // Esta función está bien, carga el audio basado en el ID del hook.
    const fetchAudio = useCallback(async (options = {}) => {
        if (audioId == null) return;
        setLoading(true);
        setError(null);
        try {
            const res = await authFetch(`${Url.url}/api/audios/${audioId}`, {
                cache: options.force ? 'no-cache' : 'default',
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || "Error obteniendo nota de audio");
            setAudio(body.audio);
            return { success: true, audio: body.audio };
        } catch (err) {
            setError(err.message);
            setAudio(null);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    }, [audioId, authFetch]);

    // --- EDITAR (UPDATE) - FUNCIÓN CORREGIDA ---
    const editAudio = useCallback(async (idToEdit, formData) => {
        // 1. AHORA ACEPTA EL ID COMO PRIMER PARÁMETRO
        if (idToEdit == null) {
            // 2. LA VALIDACIÓN AHORA USA EL PARÁMETRO, NO EL ESTADO DEL HOOK
            throw new Error("ID de audio no especificado");
        }
        setLoading(true);
        setError(null);
        try {
            const res = await authFetch(
                // 3. LA URL SE CONSTRUYE CON EL ID DEL PARÁMETRO
                `${Url.url}/api/audios/${idToEdit}`,
                { method: "PUT", body: formData }
            );
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || "Error actualizando nota de audio");

            // Si el audio editado es el que tenemos cargado en el estado, lo actualizamos.
            if (audioId === idToEdit) {
                setAudio(body.audio);
            }
            return { success: true, audio: body.audio };
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
        // 4. LA FUNCIÓN YA NO DEPENDE DEL 'audioId' DEL ESTADO DEL HOOK
    }, [authFetch]);

    // --- BORRAR (DELETE) - FUNCIÓN CORREGIDA ---
    const deleteAudio = useCallback(async (idToDelete) => {
        // Misma corrección: Acepta el ID como parámetro.
        if (idToDelete == null) {
            throw new Error("ID de audio no especificado para eliminar");
        }
        setLoading(true);
        setError(null);
        try {
            const res = await authFetch(
                `${Url.url}/api/audios/${idToDelete}`,
                { method: "DELETE" }
            );
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body.message || "Error eliminando nota de audio");

            // Si borramos el audio que teníamos cargado, limpiamos el estado.
            if (audioId === idToDelete) {
                setAudio(null);
            }
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    // --- CREAR (CREATE) - (Sin cambios, ya era correcta) ---
    const addAudio = useCallback(async (formData) => {
        setLoading(true);
        setError(null);
        try {
            if (!auth || !auth.user_code) {
                throw new Error("No se pudo identificar al autor.");
            }
            // Sanitizamos el ID del autor para evitar errores
            const authorId = parseInt(String(auth.user_code).split(',')[0], 10);
            if (isNaN(authorId)) {
                throw new Error("El ID del autor es inválido.");
            }
            // Añadimos el ID al FormData
            formData.append('audio_author_id', authorId);

            const res = await authFetch(
                `${Url.url}/api/audios`,
                { method: "POST", body: formData }
            );
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || "Error creando nota de audio");
            return { success: true, audio: body.audio };
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    }, [auth, authFetch]);

    // --- EFECTO DE CARGA INICIAL - CORREGIDO ---
    useEffect(() => {
        if (audioId) {
            fetchAudio();
        }
        // 5. AÑADIMOS fetchAudio A LAS DEPENDENCIAS PARA EVITAR "STALE CLOSURES"
    }, [audioId, fetchAudio]);

    return {
        audio,
        loading,
        error,
        refresh: () => fetchAudio({ force: true }),
        editAudio,
        deleteAudio,
        addAudio,
    };
}