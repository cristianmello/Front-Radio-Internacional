// src/context/EditContext.jsx
import React, { createContext, useState, useContext, useCallback } from 'react';

// Context para controlar el modal de edición global
const EditContext = createContext();

export const EditProvider = ({ children }) => {
    // Estado del modal de edición
    const [editState, setEditState] = useState({
        isOpen: false,
        type: null,
        values: null,
        options: {},
        meta: null,
        onSaveCallback: null,
    });

    const openEditModal = useCallback(({ type, values, options = {}, meta = {}, onSave }) => {
        setEditState({
            isOpen: true,
            type,
            values,
            options,
            meta,
            onSaveCallback: onSave,
        });
    }, []);

    const closeEditModal = useCallback(() => {
        setEditState(prev => ({ ...prev, isOpen: false }));
    }, []);

    // Handler de guardar desde el modal
    const handleSave = useCallback((newValues) => {
        if (editState.onSaveCallback) {
            try {
                editState.onSaveCallback(newValues, editState.meta);
            } catch (err) {
                console.error('Error en onSaveCallback:', err);
            }
        }
        closeEditModal();
    }, [editState, closeEditModal]);

    return (
        <EditContext.Provider value={{ editState, openEditModal, closeEditModal, handleSave }}>
            {children}
        </EditContext.Provider>
    );
};

export const useEdit = () => {
    const context = useContext(EditContext);
    if (!context) {
        throw new Error('useEdit debe usarse dentro de un EditProvider');
    }
    return context;
};