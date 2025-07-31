// src/components/layout/public/home/CreateAudioModal.jsx
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useNotification } from "../../../../context/NotificationContext";

export default function CreateAudioModal({ onSave, onCancel, categories = [] }) {
    const modalContentRef = useRef(null);

    const { showNotification } = useNotification();

    // Estados del formulario, adaptados para audio
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [audioFile, setAudioFile] = useState(null); // Estado para el archivo de audio

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (formError && modalContentRef.current) {
            modalContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [formError]);

    // Generación automática del slug a partir del título
    useEffect(() => {
        const generateSlug = (text) =>
            text
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9 ]/g, "")
                .trim()
                .replace(/\s+/g, "-");
        setSlug(generateSlug(title));
    }, [title]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        // Validaciones del formulario
        if (!title || !categoryId) {
            setFormError("El Título y la Categoría son campos obligatorios.");
            return;
        }
        if (!audioFile) {
            setFormError("Debe seleccionar un archivo de audio.");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();

        // Construcción de los datos del formulario
        formData.append("audio_title", title);
        formData.append("audio_slug", slug);
        formData.append("audio_category_id", categoryId);
        formData.append("audio_file", audioFile); // Se adjunta el archivo de audio

        // Los audios siempre se crean como borradores
        formData.append("audio_is_published", "false");

        const result = (await onSave(formData)) || {};

        if (result?.success) {
            showNotification('Nota de audio creada con éxito.', 'success');
            onCancel();
        } else {
            const errorMessage = result?.message || "Ocurrió un error inesperado.";
            setFormError(errorMessage);
            showNotification(errorMessage, 'error');
        }

        setIsSubmitting(false);
    };

    // Filtramos la categoría "Inicio" para que no se pueda seleccionar
    const filteredCategories = categories.filter(cat => cat.category_slug !== 'inicio');

    return (
        <div className="modal-edit active" id="createAudioModal">
            <div className="modal-edit-content" ref={modalContentRef}>
                <div className="modal-edit-title">Crear Nueva Nota de Audio</div>
                <form onSubmit={handleSubmit} className="edit-form" encType="multipart/form-data">

                    {formError && <p className="error-message">{formError}</p>}

                    <h4>Información Básica</h4>
                    <div className="edit-field">
                        <label>Título:</label>
                        <input type="text" value={title} required onChange={(e) => setTitle(e.target.value)} disabled={isSubmitting} />
                    </div>
                    <div className="edit-field">
                        <label>Slug (auto):</label>
                        <input type="text" value={slug} readOnly disabled />
                    </div>
                    <div className="edit-field">
                        <label>Categoría:</label>
                        <select value={categoryId} required onChange={(e) => setCategoryId(e.target.value)} disabled={isSubmitting}>
                            <option value="" disabled>-- Elige una --</option>
                            {filteredCategories.map((cat) => (
                                <option key={cat.category_code} value={cat.category_code}>
                                    {cat.category_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <h4>Archivo de Audio</h4>
                    <div className="edit-field">
                        <input type="file" accept="audio/*" required onChange={(e) => setAudioFile(e.target.files[0])} disabled={isSubmitting} />
                    </div>
                    {audioFile && (
                        <div className="audio-preview" style={{ marginTop: '10px' }}>
                            <p>Archivo seleccionado: <strong>{audioFile.name}</strong></p>
                        </div>
                    )}

                    <div className="edit-buttons">
                        <button type="button" className="btn-cancel" onClick={onCancel} disabled={isSubmitting}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <span style={{ marginLeft: '8px' }}>Creando...</span>
                                </>
                            ) : "Crear Borrador"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

CreateAudioModal.propTypes = {
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    categories: PropTypes.array.isRequired,
};