// src/components/layout/public/home/AddItemModal.jsx
import React from "react";
import PropTypes from "prop-types";
import useAvailableArticlesForSection from "../../../../hooks/useAvailableArticlesForSection";

export default function AddItemModal({ section, onSelect, onCancel }) {
    const { articles, loading, error } = useAvailableArticlesForSection(section?.section_slug);

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
                            articles.map(article => (
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
                                        onClick={() => onSelect(article.article_code)}
                                    >
                                        Añadir
                                    </button>
                                </li>
                            ))
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

// ✅ 4. Actualizar los propTypes para incluir la nueva prop 'section'
AddItemModal.propTypes = {
    section: PropTypes.shape({
        section_slug: PropTypes.string,
        section_title: PropTypes.string
    }).isRequired,
    onSelect: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};


/*// src/components/layout/public/home/AddItemModal.jsx
import React from "react";
import PropTypes from "prop-types";
import useDraftArticles from "../../../../hooks/useDraftArticles";

export default function AddArticleModal({ onSelect, onCancel }) {
    const { articles, loading, error } = useDraftArticles();

    return (
        <div className="modal-edit active" id="itemModal">
            <div className="modal-edit-content">
                <div className="modal-edit-title">Seleccionar Noticia</div>

                {loading && <p>Cargando artículos…</p>}
                {error && <p className="form-error">{error}</p>}

                {!loading && !error && (
                    <ul className="item-list">
                        {articles.length > 0 ? (
                            articles.map(article => (
                                <li key={article.article_code} className="item-list-entry">
                                    <div className="item-info">
                                        <h4 className="item-title">{article.title}</h4>
                                        <small className="item-meta">
                                            {article.category} • {article.date?.slice(0, 10)}
                                        </small>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-save"
                                        onClick={() => onSelect(article.article_code)}
                                    >
                                        Añadir
                                    </button>
                                </li>
                            ))
                        ) : (
                            <li className="no-items">No hay artículos disponibles</li>
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

AddArticleModal.propTypes = {
    onSelect: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};
*/