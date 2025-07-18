// src/components/layout/public/home/EditContentArticleModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import useDraftArticles from '../../../../hooks/useDraftArticles';

export default function EditContentArticleModal({ onSelect, onCancel }) {
  const { articles, loading, error } = useDraftArticles();

  return (
    <div className="modal-edit active">
      <div className="modal-edit-content">
        <div className="modal-edit-title">Seleccionar Artículo (Borrador)</div>

        {loading && <p>Cargando borradores…</p>}
        {error && <p className="form-error">{error}</p>}

        {!loading && !error && (
          <ul className="item-list">
            {articles.length > 0 ? (
              articles.map(a => {
                // El controlador mapea la fecha a `date`
                const pubDate = a.date;
                const formatted = pubDate
                  ? new Date(pubDate).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })
                  : '–';

                return (
                  <li key={a.article_code} className="item-list-entry">
                    <div className="item-info">
                      <h4 className="item-title">{a.title}</h4>
                      <small className="item-meta">
                        <strong>Categoría:</strong> {a.category} •{' '}
                        <strong>Fecha:</strong> {formatted}
                        {a.excerpt && (
                          <> • <em>{a.excerpt.slice(0, 40)}…</em></>
                        )}
                      </small>
                    </div>
                    <button
                      type="button"
                      className="btn-save"
                      onClick={() => onSelect(a.article_code, a.article_slug)}
                    >
                      Editar
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="no-items">No hay borradores disponibles</li>
            )}
          </ul>
        )}

        <div className="edit-buttons">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

EditContentArticleModal.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};
