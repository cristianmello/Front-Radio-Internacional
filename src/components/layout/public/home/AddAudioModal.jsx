// src/components/layout/public/home/AddAudioModal.jsx
import React from "react";
import PropTypes from "prop-types";
import useDraftAudios from "../../../../hooks/useDraftAudios";

export default function AddAudioModal({ onSelect, onCancel }) {
    // Carga borradores de audios no publicados
    const { audios, loading, error } = useDraftAudios();

    return (
        <div className="modal-edit active" id="audioModal">
            <div className="modal-edit-content">
                <div className="modal-edit-title">Seleccionar Nota de Audio</div>

                {loading && <p>Cargando audios…</p>}
                {error && <p className="form-error">{error}</p>}

                {!loading && !error && (
                    <ul className="item-list">
                        {audios.length > 0 ? (
                            audios.map(audio => (
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
                                        onClick={() => onSelect(audio.audio_code)}
                                    >
                                        Añadir
                                    </button>
                                </li>
                            ))
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
