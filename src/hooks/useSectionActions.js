// src/hooks/useSectionActions.js
import { useState, useEffect, useCallback } from 'react';
import Url from '../helpers/Url';
import useAuth from './useAuth';

export function useSectionActions(slug, initialItems, onDeleted) {
    const [items, setItems] = useState(initialItems || []); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { authFetch } = useAuth();

    // 3. Lógica de fetch envuelta en useCallback para estabilidad y reutilización
    const fetchItems = useCallback(async () => {
        if (!slug) return;
        setLoading(true);
        setError(null);
        try {
            const res = await authFetch(`${Url.url}/api/sections/${slug}`, { cache: 'no-cache' });
            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                throw new Error(errBody.message || 'Error al cargar los ítems de la sección');
            }
            const json = await res.json();
            setItems(json.items || []);
        } catch (err) {
            console.error(`[useSectionActions:${slug}] load:`, err);
            setError(err.message);
        } finally {
            setLoading(false); // <-- Lo desactivamos al terminar
        }
    }, [slug, authFetch]);

    /* EL QUE FUNCIONA CORRECTAMENTE  
      const addItem = async (code) => {
            try {
                const res = await authFetch(`${Url.url}/api/sections/${slug}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code })
                });
                if (!res.ok) {
                    const errBody = await res.json();
                    throw new Error(errBody.message || 'Error añadiendo ítem');
                }
                // 5. Refresca la lista completa para asegurar consistencia
                await fetchItems();
                return { success: true };
            } catch (err) {
                console.error(`[useSectionActions:${slug}] addItem:`, err);
                return { success: false, message: err.message };
            }
        };
        */

    useEffect(() => {
        setItems(initialItems || []);
    }, [initialItems]);

    const addItem = async (code) => {
        try {
            // La única línea que cambia es la URL, que ahora no incluye "/items"
            const res = await authFetch(`${Url.url}/api/sections/${slug}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });

            const body = await res.json();

            if (!res.ok) {
                return { success: false, message: body.message || 'Error al añadir el ítem.' };
            }

            await fetchItems();
            return { success: true, item: body.item };

        } catch (err) {
            console.error(`[useSectionActions:${slug}] addItem Error:`, err);
            return { success: false, message: err.message };
        }
    };

    // Eliminar un item
    const removeItem = async (code) => {
        try {
            const res = await authFetch(`${Url.url}/api/sections/${slug}/${code}`, { method: 'DELETE' });
            if (!res.ok) {
                const errBody = await res.json();
                throw new Error(errBody.message || 'Error al eliminar ítem');
            }
            // 6. Refresca la lista completa en lugar de filtrar el estado localmente
            await fetchItems();
            return { success: true };
        } catch (err) {
            console.error(`[useSectionActions:${slug}] removeItem:`, err);
            return { success: false, message: err.message };
        }
    };

    // Eliminar toda la sección
    const deleteSection = async () => {
        try {
            const res = await authFetch(`${Url.url}/api/sections/${slug}`, { method: 'DELETE' });
            if (!res.ok) {
                const errBody = await res.json();
                throw new Error(errBody.message || 'Error al eliminar la sección');
            }

            console.log(`%c[useSectionActions] Borrado en API exitoso para: ${slug}. ¿Voy a llamar a onDeleted?`, 'color: purple; font-weight: bold;', typeof onDeleted === 'function');

            if (onDeleted) onDeleted(slug);
            return { success: true };
        } catch (err) {
            console.error(`[useSectionActions:${slug}] deleteSection:`, err);
            return { success: false, message: err.message };
        }
    };

    const reorderItems = async (orderedCodes) => {
        try {
            const res = await authFetch(`${Url.url}/api/sections/${slug}/reorder`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderedCodes })
            });

            if (!res.ok) {
                const errBody = await res.json();
                throw new Error(errBody.message || 'Error al reordenar');
            }

            await fetchItems();

            return { success: true };
        } catch (err) {
            console.error(`[useSectionActions:${slug}] reorderItems:`, err);
            return { success: false, message: err.message };
        }
    };

    // 7. Se retornan los nuevos estados y la función de refresco
    return {
        items,
        setItems,
        loading,
        error,
        addItem,
        removeItem,
        deleteSection,
        reorderItems,
        refresh: fetchItems
    };
}