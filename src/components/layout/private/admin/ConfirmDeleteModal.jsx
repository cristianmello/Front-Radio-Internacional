// src/components/layout/private/admin/ConfirmDeleteModal.jsx
import React from 'react';

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title, message, loading }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h3>{title}</h3>
                <p>{message}</p>
                
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
                        Cancelar
                    </button>
                    <button className="btn btn-delete" onClick={onConfirm} disabled={loading}>
                        {loading ? 'Eliminando...' : 'Confirmar y Eliminar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;