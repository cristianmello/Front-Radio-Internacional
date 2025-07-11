// src/components/editing/ConfirmDeleteModal.jsx
import React from 'react';

export default function ConfirmDeleteModal({ isOpen, type, onCancel, onConfirm }) {
    if (!isOpen) return null;
    return (
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3>Confirmar eliminación</h3>
                <p>¿Está seguro de que desea eliminar este {type}? Esta acción no se puede deshacer.</p>
                <button onClick={onCancel}>Cancelar</button>
                <button onClick={onConfirm}>Eliminar</button>
            </div>
        </div>
    );
}
