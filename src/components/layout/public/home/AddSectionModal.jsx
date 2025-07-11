// src/components/layout/public/home/AddSectionModal.jsx
import React, { useState } from "react";

const SECTION_TYPES = [
    { value: "breaking", label: "Últimas Noticias" },
    { value: "trending", label: "Tendencias" },
    { value: "featured", label: "Destacados" },
    //{ value: "world", label: "Noticias del Mundo" },
    { value: "mosaic", label: "Panorama Noticioso" },
    { value: "ad-large", label: "Publicidad Larga" },
    { value: "ad-small", label: "Publicidad Pequeña" },
    { value: "ad-skyscraper", label: "Publicidad Rascacielos" },
    { value: "ad-biglarge", label: "Publicidad Horizontal más ancha" },
    { value: "ad-verticalsm", label: "Publicidad Vertical" },


    //{ value: "ad-banner", label: "Publicidad Banner (ej: 728x90)" },
    //{value: "video", label: "Vídeo" },
    //{ value: "shorts", label: "Shorts" },
    //{ value: "popular", label: "Más Leídos" },
    //{ value: "newsletter", label: "Suscripción Newsletter" },

    //{ value: "tags", label: "Temas Populares" },
    //{ value: "gallery", label: "Galería de imágenes" },
    //{ value: "weather", label: "Widget de Clima" },
];

export default function AddSectionModal({ onConfirm, onCancel }) {
    const [title, setTitle] = useState("");
    const [type, setType] = useState(SECTION_TYPES[0].value);
    const [error, setError] = useState("");

    const handleSubmit = e => {
        e.preventDefault();
        // Validar título solo si se escribió algo
        if (title.trim() !== "" && title.trim().length < 3) {
            setError("El título debe tener al menos 3 caracteres");
            return;
        }
        // Construir payload: incluir type siempre, título solo si no vacío
        const payload = { type };
        if (title.trim() !== "") {
            payload.title = title.trim();
        }
        onConfirm(payload);
    };

    return (
        <div className="modal-edit active" id="sectionModal">
            <div className="modal-edit-content">
                <div className="modal-edit-title">Crear Nueva Sección</div>
                <form id="sectionForm" className="edit-form" onSubmit={handleSubmit}>
                    {error && <p className="form-error">{error}</p>}
                    <div className="edit-field">
                        <label htmlFor="sectionTitle">
                            Título de la Sección: <span className="optional-label">(Opcional)</span>
                        </label>
                        <input
                            type="text"
                            id="sectionTitle"
                            placeholder="Dejar vacío para título predeterminado"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="edit-field">
                        <label htmlFor="sectionType">Tipo de Sección:</label>
                        <select
                            id="sectionType"
                            value={type}
                            onChange={e => setType(e.target.value)}
                        >
                            {SECTION_TYPES.map(({ value, label }) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="edit-buttons">
                        <button
                            type="button"
                            className="btn-cancel"
                            id="cancelSectionBtn"
                            onClick={onCancel}
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save" id="createSectionBtn">
                            Crear
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
