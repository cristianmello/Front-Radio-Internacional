// src/hooks/useArticleActions.js
import { useState, useCallback } from "react";
import Url from "../helpers/Url";
import useAuth from "./UseAuth";

// Este hook solo proporciona funciones que necesitan autenticación.
export default function useArticleActions() {
    const { authFetch, auth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const addArticle = useCallback(
        async (data) => {
            setLoading(true);
            setError(null);
            try {
                if (!auth?.user_code) throw new Error("No se pudo identificar al autor.");
                const authorId = parseInt(String(auth.user_code).split(',')[0], 10);
                if (isNaN(authorId)) throw new Error("El ID del autor es inválido.");

                const options = { method: "POST" };
                if (data instanceof FormData) {
                    data.append('article_author_id', authorId);
                    options.body = data;
                } else {
                    options.body = JSON.stringify({ ...data, article_author_id: authorId });
                    options.headers = { "Content-Type": "application/json" };
                }
                const res = await authFetch(`${Url.url}/api/articles`, options);
                const body = await res.json();
                if (!res.ok) throw new Error(body.message || "Error creando artículo");
                return { success: true, article: body.article };
            } catch (err) {
                setError(err.message);
                return { success: false, message: err.message };
            } finally {
                setLoading(false);
            }
        },
        [authFetch, auth]
    );

    const editArticle = useCallback(async (articleId, formData) => {
        if (articleId == null) {
            return { success: false, message: "ID de artículo no especificado." };
        }
        setLoading(true);
        setError(null);

        try {
            // --- Lógica para elegir la URL correcta ---

            // 1. Por defecto, usamos la URL principal (para el modal de edición).
            let url = `${Url.url}/api/articles/${articleId}`;

            // 2. Revisamos las claves que vienen en el formData.
            const keys = [...formData.keys()];

            // 3. Si la única clave es 'article_content', cambiamos a la URL específica.
            if (keys.length === 1 && keys[0] === 'article_content') {
                url = `${Url.url}/api/articles/${articleId}/content`;
            }
            // --- Fin de la lógica ---

            const res = await authFetch(url, {
                method: 'PUT',
                body: formData,
            });

            const body = await res.json();
            if (!res.ok) {
                throw new Error(body.message || "Error actualizando el artículo");
            }
            return { success: true, article: body.article };

        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    const deleteArticle = useCallback(
        async (articleId) => {
            setLoading(true);
            setError(null);
            try {
                const res = await authFetch(`${Url.url}/api/articles/${articleId}`, { method: 'DELETE' });
                if (!res.ok) {
                    const body = await res.json();
                    throw new Error(body.message || 'Error eliminando artículo');
                }
                return { success: true };
            } catch (err) {
                setError(err.message);
                return { success: false, message: err.message };
            } finally {
                setLoading(false);
            }
        },
        [authFetch]
    );

    // Retorna solo las funciones de acción y sus estados de carga/error
    return { addArticle, editArticle, deleteArticle, loading, error };
}

/*FUNCIONANDOOOOO// src/hooks/useArticleActions.js
import { useState, useCallback } from "react";
import Url from "../helpers/Url";
import useAuth from "./UseAuth";

// Este hook solo proporciona funciones que necesitan autenticación.
export default function useArticleActions() {
    const { authFetch, auth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const addArticle = useCallback(
        async (data) => {
            setLoading(true);
            setError(null);
            try {
                if (!auth?.user_code) throw new Error("No se pudo identificar al autor.");
                const authorId = parseInt(String(auth.user_code).split(',')[0], 10);
                if (isNaN(authorId)) throw new Error("El ID del autor es inválido.");
                
                const options = { method: "POST" };
                if (data instanceof FormData) {
                    data.append('article_author_id', authorId);
                    options.body = data;
                } else {
                    options.body = JSON.stringify({ ...data, article_author_id: authorId });
                    options.headers = { "Content-Type": "application/json" };
                }
                const res = await authFetch(`${Url.url}/api/articles`, options);
                const body = await res.json();
                if (!res.ok) throw new Error(body.message || "Error creando artículo");
                return { success: true, article: body.article };
            } catch (err) {
                setError(err.message);
                return { success: false, message: err.message };
            } finally {
                setLoading(false);
            }
        },
        [authFetch, auth]
    );

    const editArticle = useCallback(async (articleId, formData) => {
        if (articleId == null) return { success: false, message: "ID de artículo no especificado."};
        setLoading(true);
        setError(null);
        try {
            const res = await authFetch(`${Url.url}/api/articles/${articleId}`, {
                method: 'PUT',
                body: formData,
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || "Error actualizando el artículo");
            return { success: true, article: body.article };
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    const deleteArticle = useCallback(
        async (articleId) => {
            setLoading(true);
            setError(null);
            try {
                const res = await authFetch(`${Url.url}/api/articles/${articleId}`, { method: 'DELETE' });
                if (!res.ok) {
                    const body = await res.json();
                    throw new Error(body.message || 'Error eliminando artículo');
                }
                return { success: true };
            } catch (err) {
                setError(err.message);
                return { success: false, message: err.message };
            } finally {
                setLoading(false);
            }
        },
        [authFetch]
    );

    // Retorna solo las funciones de acción y sus estados de carga/error
    return { addArticle, editArticle, deleteArticle, loading, error };
}
    */
