// src/hooks/usePublicArticle.js
import { useState, useEffect, useCallback } from "react";
import Url from "../helpers/Url";

// Este hook solo obtiene datos, no necesita 'useAuth'.
export default function usePublicArticle(id, slug) {
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchArticle = useCallback(async () => {
        if (id == null || slug == null) {
            setArticle(null);
            setLoading(false); // Detenemos la carga si no hay id/slug
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Se usa el fetch normal de navegador
            const res = await fetch(`${Url.url}/api/articles/${id}/${slug}`, {
                cache: 'no-cache',
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || "Error obteniendo artículo");
            setArticle(body.article);
        } catch (err) {
            setError(err.message);
            setArticle(null);
        } finally {
            setLoading(false);
        }
    }, [id, slug]);

    // Llama al fetch inicial cuando el id o el slug cambian
    useEffect(() => {
        fetchArticle();
    }, [fetchArticle]);

    // Retorna solo los datos del artículo y una función para refrescar
    return { article, loading, error, refresh: fetchArticle };
}