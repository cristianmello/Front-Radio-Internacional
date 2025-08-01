// src/components/layout/public/home/AddSectionModal.jsx
import React, { useState } from "react";
import { useNotification } from '../../context/NotificationContext';
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
    const [isLoading, setIsLoading] = useState(false);
    const { showNotification } = useNotification();

    const handleSubmit = async e => {
        e.preventDefault();
        if (title.trim() !== "" && title.trim().length < 3) {
            setError("El título debe tener al menos 3 caracteres");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const payload = { type };
            if (title.trim() !== "") {
                payload.title = title.trim();
            }
            const result = await onConfirm(payload); // Llama a la función del padre

            if (result.success) {
                showNotification('¡Sección creada exitosamente!', 'success');
                // El padre se encarga de cerrar el modal, así que no llamamos a onCancel() aquí.
            } else {
                const errorMessage = result.message || 'No se pudo crear la sección.';
                setError(errorMessage);
                showNotification(errorMessage, 'error');
            }
        } catch (err) {
            const errorMessage = err.message || 'Error inesperado.';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
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
                            disabled={isLoading}
                        />
                    </div>
                    <div className="edit-field">
                        <label htmlFor="sectionType">Tipo de Sección:</label>
                        <select
                            id="sectionType"
                            value={type}
                            onChange={e => setType(e.target.value)}
                            disabled={isLoading}
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
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save" id="createSectionBtn" disabled={isLoading}>
                            {isLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
