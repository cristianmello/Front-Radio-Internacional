import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useSectionEdit } from '../../../../context/SectionEditContext';

const SidebarArticleList = ({ sectionTitle, data = [] }) => {
    const { canEdit, onAddItem, onRemove, onEdit, onDeleteSection } = useSectionEdit();

    return (
        <>
            {/* 
        <div className="widget">
            <div className="section-header">
                {sectionTitle && <h2>{sectionTitle}</h2>}
                {canEdit && (
                    <div className="section-actions">
                        {onDeleteSection && (
                            <button onClick={onDeleteSection} className="delete-section-btn" title="Eliminar sección">
                                <i className="fas fa-trash"></i>
                            </button>
                        )}
                        {onAddItem && (
                            <button onClick={onAddItem}>+ Añadir</button>
                        )}
                    </div>
                )}
            </div>
            <ul className="sidebar-article-list">
                {data.map(item => (
                    <li key={item.article_code}>
                        <Link to={`/articulos/${item.article_code}/${item.article_slug}`}>
                            {item.title}
                        </Link>
                        {canEdit && (
                            <div className="item-actions-inline">
                                <button onClick={() => onEdit(item)} className="edit-item-btn-inline" title="Editar Artículo"><i className="fas fa-pen"></i></button>
                                <button onClick={() => onRemove(item.article_code)} className="delete-item-btn-inline" title="Quitar Artículo"><i className="fas fa-trash"></i></button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>*/}</>
    );
};

SidebarArticleList.propTypes = {
    sectionTitle: PropTypes.string,
    data: PropTypes.array,
};

export default SidebarArticleList;