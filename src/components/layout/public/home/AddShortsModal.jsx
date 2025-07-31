// src/components/layout/public/home/AddShortsModal.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import useDraftShorts from "../../../../hooks/useDraftShorts";
import { useNotification } from "../../../../context/NotificationContext";

export default function AddShortsModal({ onSelect, onCancel }) {
    // obtenemos los shorts no publicados
    const { shorts, loading, error } = useDraftShorts();
    const { showNotification } = useNotification();
    const [itemStates, setItemStates] = useState({});

    const handleSelect = async (shortCode) => {
        setItemStates(prev => ({ ...prev, [shortCode]: { status: 'loading' } }));

        try {
            const result = await onSelect(shortCode);

            if (result.success) {
                showNotification('Short añadido a la sección!', 'success');
                onCancel();
            } else {
                const errorMessage = result.message || 'No se pudo añadir el short.';
                showNotification(errorMessage, 'error');
                setItemStates(prev => ({ ...prev, [shortCode]: { status: 'error', message: errorMessage } }));
            }
        } catch (err) {
            const errorMessage = err.message || 'Error inesperado.';
            showNotification(errorMessage, 'error');
            setItemStates(prev => ({ ...prev, [shortCode]: { status: 'error', message: errorMessage } }));
        }
    };

    return (
        <div className="modal-edit active" id="shortModal">
            <div className="modal-edit-content">
                <div className="modal-edit-title">Seleccionar Short</div>

                {loading && <p>Cargando shorts…</p>}
                {error && <p className="form-error">{error}</p>}

                {!loading && !error && (
                    <ul className="item-list">
                        {shorts.length > 0 ? (
                            shorts.map(short => {
                                const itemState = itemStates[short.short_code]; // <-- 6. Obtener estado del item
                                return (
                                    <li key={short.short_code} className="item-list-entry">
                                        <div className="item-info">
                                            <h4 className="item-title">{short.title}</h4>
                                            <small className="item-meta">
                                                {short.category} • {short.duration}
                                            </small>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn-save"
                                            onClick={() => onSelect(short.short_code)}
                                            disabled={itemState?.status === 'loading'}
                                        >
                                            {itemState?.status === 'loading' ? (
                                                <i className="fas fa-spinner fa-spin"></i>
                                            ) : (
                                                'Añadir'
                                            )}
                                        </button>
                                    </li>
                                )
                            })
                        ) : (
                            <li className="no-items">No hay shorts disponibles</li>
                        )}
                    </ul>
                )}

                <div className="edit-buttons">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={onCancel}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}

AddShortsModal.propTypes = {
    onSelect: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};
