// src/hooks/useCategoryActions.js
import { useState, useCallback } from 'react';
import Url from '../helpers/Url';
import useAuth from './UseAuth';

/**
 * Hook que provee funciones para crear y eliminar categorías.
 * No gestiona el estado de la lista de categorías, solo realiza las acciones
 * y llama a un callback cuando una acción es exitosa.
 * @param {function} onActionSuccess - Callback a ejecutar para refrescar los datos.
 */
export default function useCategoryActions(onActionSuccess) {
    const [isActionLoading, setIsActionLoading] = useState(false);
    const { authFetch } = useAuth();

    const addCategory = useCallback(async (data) => {
        setIsActionLoading(true);
        try {
            const res = await authFetch(`${Url.url}/api/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message);
            
            // Si la acción fue exitosa, llama al callback para refrescar
            if (onActionSuccess) onActionSuccess();
            return { success: true };

        } catch (err) {
            return { success: false, message: err.message };
        } finally {
            setIsActionLoading(false);
        }
    }, [authFetch, onActionSuccess]);

    const deleteCategory = useCallback(async (id) => {
        setIsActionLoading(true);
        try {
            const res = await authFetch(`${Url.url}/api/categories/${id}`, {
                method: 'DELETE'
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message);
            
            // Si la acción fue exitosa, llama al callback para refrescar
            if (onActionSuccess) onActionSuccess();
            return { success: true };

        } catch (err) {
            return { success: false, message: err.message };
        } finally {
            setIsActionLoading(false);
        }
    }, [authFetch, onActionSuccess]);

    return {
        addCategory,
        deleteCategory,
        isActionLoading // Estado de carga específico para estas acciones
    };
}