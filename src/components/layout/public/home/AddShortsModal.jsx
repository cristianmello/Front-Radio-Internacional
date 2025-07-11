// src/components/layout/public/home/AddShortsModal.jsx
import React from "react";
import PropTypes from "prop-types";
import useDraftShorts from "../../../../hooks/useDraftShorts";

export default function AddShortsModal({ onSelect, onCancel }) {
    // obtenemos los shorts no publicados
    const { shorts, loading, error } = useDraftShorts();

    return (
        <div className="modal-edit active" id="shortModal">
            <div className="modal-edit-content">
                <div className="modal-edit-title">Seleccionar Short</div>

                {loading && <p>Cargando shorts…</p>}
                {error && <p className="form-error">{error}</p>}

                {!loading && !error && (
                    <ul className="item-list">
                        {shorts.length > 0 ? (
                            shorts.map(short => (
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
                                    >
                                        Añadir
                                    </button>
                                </li>
                            ))
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
