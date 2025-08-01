// src/components/layout/public/home/AddAudioModal.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import useDraftAudios from "../../hooks/useDraftAudios";
import { useNotification } from "../../context/NotificationContext";

export default function AddAudioModal({ onSelect, onCancel }) {
    // Carga borradores de audios no publicados
    const { audios, loading, error } = useDraftAudios();
    const { showNotification } = useNotification();
    const [itemStates, setItemStates] = useState({});

    const handleSelect = async (audioCode) => {
        setItemStates(prev => ({ ...prev, [audioCode]: { status: 'loading' } }));

        try {
            const result = await onSelect(audioCode);

            if (result.success) {
                showNotification('Nota de audio añadida correctamente.', 'success');
                onCancel();
            } else {
                const errorMessage = result.message || 'No se pudo añadir la nota de audio.';
                showNotification(errorMessage, 'error');
                setItemStates(prev => ({ ...prev, [audioCode]: { status: 'error', message: errorMessage } }));
            }
        } catch (err) {
            const errorMessage = err.message || 'Error inesperado.';
            showNotification(errorMessage, 'error');
            setItemStates(prev => ({ ...prev, [audioCode]: { status: 'error', message: errorMessage } }));
        }
    };

    return (
        <div className="modal-edit active" id="audioModal">
            <div className="modal-edit-content">
                <div className="modal-edit-title">Seleccionar Nota de Audio</div>

                {loading && <p>Cargando audios…</p>}
                {error && <p className="form-error">{error}</p>}

                {!loading && !error && (
                    <ul className="item-list">
                        {audios.length > 0 ? (
                            audios.map(audio => {
                                const itemState = itemStates[audio.audio_code];

                                return (
                                    <li key={audio.audio_code} className="item-list-entry">
                                        <div className="item-info">
                                            <h4 className="item-title">
                                                {audio.audio_title || audio.title}
                                            </h4>
                                            <small className="item-meta">
                                                {audio.audio_category_name || audio.category} •{" "}
                                                {Math.floor(audio.audio_duration / 60)}:
                                                {String(audio.audio_duration % 60).padStart(2, "0")}
                                            </small>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn-save"
                                            onClick={() => handleSelect(audio.audio_code)}
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
                            <li className="no-items">
                                No hay notas de audio disponibles
                            </li>
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

AddAudioModal.propTypes = {
    onSelect: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};
