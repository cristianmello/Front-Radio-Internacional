// src/components/layout/public/home/AddItemModal.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import useAvailableArticlesForSection from "../../hooks/useAvailableArticlesForSection";
import { useNotification } from "../../context/NotificationContext";

export default function AddItemModal({ section, onSelect, onCancel }) {
    const { articles, loading, error } = useAvailableArticlesForSection(section?.section_slug);
    const { showNotification } = useNotification();
    const [itemStates, setItemStates] = useState({});


    const handleSelect = async (articleCode) => {
        // Poner este botón en estado de 'cargando'
        setItemStates(prev => ({ ...prev, [articleCode]: { status: 'loading' } }));

        try {
            const result = await onSelect(articleCode);

            if (result.success) {
                showNotification('Artículo añadido a la sección!, Recargue la pagina, ', 'success');
                onCancel(); // Cierra el modal si todo fue bien
            } else {
                // Si la API devuelve un error controlado, lo mostramos
                const errorMessage = result.message || 'No se pudo añadir el artículo.';
                showNotification(errorMessage, 'error');
                setItemStates(prev => ({ ...prev, [articleCode]: { status: 'error', message: errorMessage } }));
            }
        } catch (err) {
            // Si ocurre un error inesperado (ej. de red)
            const errorMessage = err.message || 'Error inesperado.';
            showNotification(errorMessage, 'error');
            setItemStates(prev => ({ ...prev, [articleCode]: { status: 'error', message: errorMessage } }));
        }
    };

    return (
        <div className="modal-edit active" id="itemModal">
            <div className="modal-edit-content">
                <div className="modal-edit-title">
                    Añadir Noticia a "{section?.section_title || 'la sección'}"
                </div>

                {loading && <p>Cargando artículos disponibles…</p>}
                {error && <p className="form-error">{error}</p>}

                {!loading && !error && (
                    <ul className="item-list">
                        {articles.length > 0 ? (
                            articles.map(article => {

                                const itemState = itemStates[article.article_code];
                                return (

                                    <li key={article.article_code} className="item-list-entry">
                                        <div className="item-info">
                                            <h4 className="item-title">{article.title}</h4>
                                            <small className="item-meta">
                                                {article.category} • {article.date?.slice(0, 10) || 'Sin fecha'}
                                            </small>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn-save"
                                            onClick={() => handleSelect(article.article_code)}
                                            disabled={itemState?.status === 'loading'}

                                        >
                                            {itemState?.status === 'loading' ? (
                                                <i className="fas fa-spinner fa-spin"></i>
                                            ) : (
                                                'Añadir'
                                            )}
                                        </button>
                                    </li>
                                )
                            })
                        ) : (
                            <li className="no-items">No hay más artículos disponibles para añadir a esta sección.</li>
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

AddItemModal.propTypes = {
    section: PropTypes.shape({
        section_slug: PropTypes.string,
        section_title: PropTypes.string
    }).isRequired,
    onSelect: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};