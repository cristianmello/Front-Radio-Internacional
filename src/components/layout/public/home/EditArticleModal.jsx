// src/components/layout/public/home/EditArticleModal.jsx
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import usePublicArticle from "../../../../hooks/usePublicArticle";
import { compressImage } from "../../../../helpers/ImageCompressor.js";
import { useNotification } from '../../../../context/NotificationContext';

export default function EditArticleModal({ article: articleToEdit, onSave, onCancel, onUpdateSuccess, categories = [] }) {
    const modalContentRef = useRef(null);
    const { showNotification } = useNotification();

    const { article, loading: loadingArticle, error: errorArticle } = usePublicArticle(articleToEdit?.id, articleToEdit?.slug);

    const initialRef = useRef(null);

    // Estados del formulario
    const [title, setTitle] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [image, setImage] = useState(null); // Puede ser una URL (string) o un File
    const [excerpt, setExcerpt] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (formError && modalContentRef.current) {
            modalContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [formError]);
    // Carga los datos del artículo en el formulario cuando el hook los obtiene
    useEffect(() => {
        if (article) {
            const initialData = {
                article_title: article.article_title || "",
                article_category_id: article.category?.category_code || article.article_category_id || "",
                article_image_url: article.article_image_url || "",
                article_excerpt: article.article_excerpt || "",
                //article_is_published: article.article_is_published || false,
                // article_is_premium: article.article_is_premium || false,
            };
            initialRef.current = initialData; // Guarda el estado inicial

            // Llena los estados del formulario
            setTitle(initialData.article_title);
            setCategoryId(initialData.article_category_id);
            setImage(initialData.article_image_url); // Inicialmente es la URL de la imagen
            setExcerpt(initialData.article_excerpt);
            //setIsPublished(initialData.article_is_published);
            // setIsPremium(initialData.article_is_premium);
        }
    }, [article]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFormError('');
        setIsSubmitting(true); // Bloquear botones mientras se comprime
        try {
            const compressedBlob = await compressImage(file);
            const compressedFile = new File(
                [compressedBlob],
                file.name,
                { type: compressedBlob.type }
            );
            setImage(compressedFile); // Guardar el archivo comprimido en el estado
        } catch (err) {
            console.error("Error al comprimir la imagen:", err);
            setFormError('Error al procesar la imagen, se usará la original.');
            setImage(file); // Fallback: usar el archivo original
        } finally {
            setIsSubmitting(false); // Desbloquear botones
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        const updates = {};

        // 1. Compara cada campo con su valor inicial y añade solo los que cambiaron
        if (title !== initialRef.current.article_title) {
            updates.article_title = title;
        }
        if (categoryId !== initialRef.current.article_category_id) {
            updates.article_category_id = categoryId;
        }
        if (excerpt !== initialRef.current.article_excerpt) {
            updates.article_excerpt = excerpt;
        }
        //if (isPublished !== initialRef.current.article_is_published) {
        //    updates.article_is_published = isPublished;
        //}
        /*
        if (isPremium !== initialRef.current.article_is_premium) {
            updates.article_is_premium = isPremium;
        }
        */

        const formData = new FormData();
        Object.entries(updates).forEach(([key, value]) => {
            formData.append(key, value);
        });

        // 2. Si 'image' es un objeto File, significa que el usuario subió una nueva imagen.
        if (image instanceof File) {
            // El nombre del campo debe coincidir con el que espera multer en el backend
            formData.append('article_image_url', image);
        }

        // Si no hay cambios ni en texto ni en imagen, no se hace nada.
        if (Object.keys(updates).length === 0 && !(image instanceof File)) {
            showNotification("No se detectaron cambios.", "info");
            onCancel();
            return;
        }

        setIsSubmitting(true);

        // 3. Llama a la función onSave (que usa editArticle del hook)
        const result = await onSave(formData);

        if (result && result.success) {
            showNotification('Artículo actualizado con éxito.', 'success');
            if (onUpdateSuccess) {
                onUpdateSuccess();
            } onCancel(); // Cierra el modal
        } else {
            const errorMessage = result?.message || "Ocurrió un error al actualizar.";
            setFormError(errorMessage);
            showNotification(errorMessage, 'error');
        }

        setIsSubmitting(false);
    };

    const isLoading = loadingArticle;
    const componentError = errorArticle;

    if (isLoading) {
        return <div className="modal-edit active"><div className="modal-edit-content">Cargando...</div></div>;
    }

    if (componentError) {
        return <div className="modal-edit active"><div className="modal-edit-content">Error: {componentError}</div></div>;
    }

    const filteredCategories = categories.filter(cat => cat.category_slug !== 'inicio');

    return (
        <div className="modal-edit active" id="editArticleModal">
            <div className="modal-edit-content" ref={modalContentRef}>
                <div className="modal-edit-title">Actualizar Artículo</div>
                <form id="newsForm" onSubmit={handleSubmit} className="edit-form">

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
                        <label>Extracto:</label>
                        <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
                    </div>

                    <div className="edit-field">
                        <label>Imagen:</label>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                            disabled={isSubmitting}
                        />
                        <small>Sube una nueva imagen para reemplazar la actual.</small>
                    </div>

                    {/* Vista previa de la imagen */}
                    <div className="image-preview" style={{ marginTop: '10px' }}>
                        {image && <img src={image instanceof File ? URL.createObjectURL(image) : image} alt="Vista previa" />}
                    </div>

                    {/*}  <div className="edit-field checkbox-field">
                        <label>
                            <input type="checkbox" checked={isPublished} onChange={() => setIsPublished(!isPublished)} />
                            Publicado
                        </label>
                    </div>
*/}
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
}

EditArticleModal.propTypes = {
    article: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        slug: PropTypes.string.isRequired,
    }).isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onUpdateSuccess: PropTypes.func,
};