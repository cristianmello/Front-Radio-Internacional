// src/components/editing/NewsModal.jsx
import React from "react";

const NewsModal = ({ isOpen, onClose, onSubmit }) => {
    if (!isOpen) return null;
    const handleSubmit = e => {
        e.preventDefault();
        const data = {
            title: e.target.newsTitle.value,
            category: e.target.newsCategory.value,
            image: e.target.newsImage.value,
            excerpt: e.target.newsExcerpt.value,
            author: e.target.newsAuthor.value,
            date: e.target.newsDate.value,
            readTime: e.target.newsReadTime.value,
            duration: e.target.newsDuration.value,
            views: e.target.newsViews.value,
        };
        onSubmit(data);
    };

    return (
        <div className="modal-edit open" id="newsModal">
            <div className="modal-edit-content">
                <div className="modal-edit-title">Agregar Noticia</div>
                <form className="edit-form" onSubmit={handleSubmit}>
                    {[
                        { label: "Título", id: "newsTitle", type: "text", placeholder: "Título de la noticia" },
                        { label: "Categoría", id: "newsCategory", type: "text" },
                        { label: "URL imagen", id: "newsImage", type: "text", placeholder: "https://..." },
                        { label: "Extracto", id: "newsExcerpt", type: "textarea" },
                        { label: "Autor", id: "newsAuthor", type: "text", placeholder: "Por ..." },
                        { label: "Fecha", id: "newsDate", type: "text", placeholder: "Hace ..." },
                        { label: "Tiempo lectura", id: "newsReadTime", type: "text", placeholder: "X min lectura" },
                        { label: "Duración", id: "newsDuration", type: "text", placeholder: "MM:SS" },
                        { label: "Vistas", id: "newsViews", type: "text", placeholder: "X vistas" },
                    ].map(field => (
                        <div className="edit-field" key={field.id}>
                            <label>{field.label}:</label>
                            {field.type === "textarea" ? (
                                <textarea id={field.id} placeholder={field.placeholder || ""}></textarea>
                            ) : (
                                <input
                                    type={field.type}
                                    id={field.id}
                                    placeholder={field.placeholder || ""}
                                    required={field.id === "newsTitle"}
                                />
                            )}
                        </div>
                    ))}
                    <div className="edit-buttons">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save">
                            Agregar Noticia
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewsModal;
