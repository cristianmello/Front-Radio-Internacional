// src/components/editing/SectionModal.jsx
import React from "react";

const SectionModal = ({ isOpen, onClose, onCreate }) => {
    if (!isOpen) return null;
    const handleSubmit = e => {
        e.preventDefault();
        onCreate({
            title: e.target.sectionTitle.value,
            type: e.target.sectionType.value
        });
    };

    return (
        <div className="modal-edit open" id="sectionModal">
            <div className="modal-edit-content">
                <div className="modal-edit-title">Crear Nueva Sección</div>
                <form className="edit-form" onSubmit={handleSubmit}>
                    <div className="edit-field">
                        <label htmlFor="sectionTitle">
                            Título de la Sección:
                            <span className="optional-label">(Opcional)</span>
                        </label>
                        <input
                            type="text"
                            id="sectionTitle"
                            placeholder="Dejar vacío para predeterminado"
                        />
                    </div>
                    <div className="edit-field">
                        <label htmlFor="sectionType">Tipo de Sección:</label>
                        <select id="sectionType" defaultValue="custom">
                            <option value="custom">Personalizada</option>
                            <option value="breaking-news">Últimas Noticias</option>
                            <option value="trending-news">Tendencias</option>
                            <option value="featured-news">Destacados</option>
                            <option value="video-news">Vídeo</option>
                            <option value="shorts-section">Shorts</option>
                            <option value="mosaic-news">Panorama Noticioso</option>
                        </select>
                    </div>
                    <div className="edit-buttons">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save">
                            Crear
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SectionModal;
