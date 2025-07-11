// src/components/layout/public/ArticleModal.jsx
import React from "react";

const ArticleModal = ({ isOpen, onClose, articleContent }) => {
    // Si no está abierto, no renderizamos nada (o bien podemos renderizar con display: none)
    if (!isOpen) return null;

    return (
        <section id="article-modal" className="article-modal open">
            <div className="article-container">
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>
                <article className="full-article">
                    {/* Aquí se inyecta dinámicamente el contenido del artículo */}
                    {articleContent}
                </article>
            </div>
        </section>
    );
};

export default ArticleModal;
