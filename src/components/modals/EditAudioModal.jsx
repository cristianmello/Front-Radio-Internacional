// src/components/layout/public/home/EditAudioModal.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import useAudio from "../../hooks/UseAudio";
import { useNotification } from "../../context/NotificationContext";

const EditAudioModal = React.memo(({ audioId, onSave, onCancel, onUpdateSuccess, categories = [] }) => {
    const modalContentRef = useRef(null);
    const { showNotification } = useNotification();
    const { audio, loading: loadingAudio, error: errorAudio } = useAudio(audioId);
    const initialRef = useRef(null);

    // Estados del formulario adaptados para Audio
    const [title, setTitle] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [newAudioFile, setNewAudioFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    const filteredCategories = useMemo(() =>
        categories.filter(cat => cat.category_slug !== 'inicio'),
        [categories]
    );

    useEffect(() => {
        if (formError && modalContentRef.current) {
            modalContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [formError]);

    // Carga los datos del audio en el formulario
    useEffect(() => {
        if (audio) {
            const initialData = {
                audio_title: audio.title || "",
                audio_category_id: audio.category?.code || "",
            };
            initialRef.current = initialData;

            setTitle(initialData.audio_title);
            setCategoryId(initialData.audio_category_id);
            setNewAudioFile(null);
        }
    }, [audio]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setFormError("");

        const updates = {};

        if (title !== initialRef.current.audio_title) {
            updates.audio_title = title;
        }
        if (categoryId !== initialRef.current.audio_category_id) {
            updates.audio_category_id = categoryId;
        }

        const formData = new FormData();
        Object.entries(updates).forEach(([key, value]) => {
            formData.append(key, value);
        });

        if (newAudioFile) {
            formData.append('audio_file', newAudioFile);
        }

        if (Object.keys(updates).length === 0 && !newAudioFile) {
            showNotification("No se detectaron cambios.", "info");
            onCancel();
            return;
        }

        setIsSubmitting(true);
        const result = await onSave(formData);

        if (result && result.success) {
            showNotification('Nota de audio actualizada con éxito.', 'success');

            if (onUpdateSuccess) {
                onUpdateSuccess();
            }
            onCancel();
        } else {
            const errorMessage = result?.message || "Ocurrió un error al actualizar.";
            setFormError(errorMessage);
            showNotification(errorMessage, 'error');
        }

        setIsSubmitting(false);
    }, [title, categoryId, newAudioFile, onSave, onCancel, onUpdateSuccess, showNotification]);

    const isLoading = loadingAudio;
    const componentError = errorAudio;

    if (isLoading) {
        return <div className="modal-edit active"><div className="modal-edit-content">Cargando...</div></div>;
    }

    if (componentError) {
        return <div className="modal-edit active"><div className="modal-edit-content">Error: {componentError}</div></div>;
    }

    return (
        <div className="modal-edit active" id="editAudioModal">
            <div className="modal-edit-content" ref={modalContentRef}>
                <div className="modal-edit-title">Actualizar Nota de Audio</div>
                <form id="audioForm" onSubmit={handleSubmit} className="edit-form">

                    {formError && <p className="error-message">{formError}</p>}

                    <div className="edit-field">
                        <label>Título:</label>
                        <input type="text" value={title} required onChange={(e) => setTitle(e.target.value)} />
                    </div>

                    <div className="edit-field">
                        <label>Categoría:</label>
                        <select value={categoryId} required onChange={(e) => setCategoryId(e.target.value)}>
                            <option value="" disabled>-- Elige una --</option>
                            {filteredCategories.map((cat) => (
                                <option key={cat.category_code} value={cat.category_code}>{cat.category_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="edit-field">
                        <label>Reemplazar Archivo de Audio:</label>
                        <input type="file" accept="audio/*" onChange={e => {
                            if (e.target.files[0]) setNewAudioFile(e.target.files[0]);
                        }} />
                        <small>Sube un nuevo archivo para reemplazar el actual. Si no seleccionas nada, se conservará el audio original.</small>
                    </div>

                    <div className="edit-buttons">
                        <button type="button" className="btn-cancel" onClick={onCancel} disabled={isSubmitting}>Cancelar</button>
                        <button type="submit" className="btn-save" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <span style={{ marginLeft: '8px' }}>Actualizando...</span>
                                </>
                            ) : "Actualizar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

EditAudioModal.propTypes = {
    audioId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onUpdateSuccess: PropTypes.func,
    categories: PropTypes.array.isRequired,
};

export default EditAudioModal;