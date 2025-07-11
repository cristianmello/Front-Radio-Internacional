// src/hooks/useEditable.jsx
```import { useContext, useEffect, useRef } from 'react';
import { AdminModeContext } from '../components/layout/public/PublicLayout';
import { useEdit } from '../context/EditContext';

/**
 * Hook para hacer un elemento editable en modo admin.
 * @param {React.RefObject} ref - ref al elemento DOM
 * @param {string} type - tipo de edición ('text', 'category', 'image', 'date', 'read-time', 'duration', etc.)
 * @param {Function} getValues - función que retorna valores iniciales para el modal
 * @param {Function} getOptions - función que retorna opciones para el modal
 * @param {Function} onSave - callback que recibe (newValues, meta) para persistir cambios
 * @param {Object} meta - información extra como id del recurso
 */
export function useEditable(ref, type, getValues, getOptions, onSave, meta = {}) {
    const { isAdminMode } = useContext(AdminModeContext);
    const { openEditModal } = useEdit();
    const savedRef = useRef();
    // Guardar listener para poder removerlo
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        // Handler click solo en modo admin
        const handleClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const values = getValues();
            const options = getOptions();
            openEditModal({ type, values, options, meta, onSave });
        };
        if (isAdminMode) {
            el.classList.add('editable');
            el.style.cursor = 'pointer';
            el.addEventListener('click', handleClick);
            savedRef.current = handleClick;
        } else {
            el.classList.remove('editable');
            el.style.cursor = '';
            if (savedRef.current) {
                el.removeEventListener('click', savedRef.current);
                savedRef.current = null;
            }
        }
        return () => {
            if (savedRef.current) {
                el.removeEventListener('click', savedRef.current);
                savedRef.current = null;
            }
        };
    }, [isAdminMode, ref, type, getValues, getOptions, openEditModal, onSave, meta]);
}```