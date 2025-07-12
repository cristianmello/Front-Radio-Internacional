/* FUNCIONANDO ACTUAL EN PRODUCTION
import React from 'react';
import PropTypes from 'prop-types';
import { useSectionEdit } from '../../../../context/SectionEditContext';

const AdBanner = ({ section, sectionTitle, data = [] }) => {
    // 1. Obtenemos TODAS las funciones del contexto, igual que en TrendingNews.jsx
    const { canEdit, onAddItem, onRemove, onEdit, onDeleteSection } = useSectionEdit();

    if (!data.length && !canEdit) {
        return null;
    }

    // El placeholder ahora incluye el botón para añadir un anuncio directamente
    const renderPlaceholder = () => (
        <div className="widget ad-widget-placeholder">
            <p>Espacio para Anuncio ({section.section_type}).</p>
            {canEdit && onAddItem && (
                <button className="btn-add-item-placeholder" onClick={onAddItem}>
                    + Añadir Publicidad
                </button>
            )}
        </div>
    );

    // Si no hay anuncios, mostramos el placeholder y terminamos.
    if (!data.length) {
        return (
            <section className="ad-section">
                {sectionTitle && <h2>{sectionTitle}</h2>}
                {canEdit && onDeleteSection && (
                    <div className="section-actions">
                        <button onClick={onDeleteSection} className="delete-section-btn" title="Eliminar sección">
                            <i className="fas fa-trash"></i>
                        </button>
                    </div>
                )}
                {renderPlaceholder()}
            </section>
        );
    }

    const ad = data[0];

    // Contenido del anuncio con los botones de acción para editar y quitar
    const adContent = (
        <>
            <div className="ad-disclaimer">Publicidad</div>
            <a href={ad.ad_target_url} target="_blank" rel="noopener noreferrer sponsored">
                <img src={ad.ad_image_url} alt={ad.ad_name} loading="lazy" />
            </a>

            {canEdit && (
                <div className="item-actions">
                    <button
                        className="edit-item-btn"
                        title="Editar Anuncio (abre el modal de edición)"
                        onClick={() => onEdit(ad)} // onEdit espera el objeto 'ad' completo
                    >
                        <i className="fas fa-pen"></i>
                    </button>
                    <button
                        className="delete-item-btn"
                        title="Quitar este anuncio de la sección"
                        onClick={() => onRemove(ad.ad_id)}
                    >
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            )}
        </>
    );

    // El 'switch' sigue decidiendo el contenedor, pero ahora todo está dentro de un layout común
    const renderAdContainer = () => {
        switch (section.section_type) {
            case 'ad-banner':
                return <div className="ad-container ad-banner-container">{adContent}</div>;
            case 'ad-skyscraper':
                return <div className="widget ad-skyscraper-container">{adContent}</div>;
            case 'ad-large':
                return <div className="widget ad-large-container">{adContent}</div>;
            case 'ad-small':
                return <div className="widget ad-small-container">{adContent}</div>;
            case 'ad-biglarge':
                return <div className="widget ad-biglarge-container">{adContent}</div>;
            case 'ad-verticalsm':
                return <div className="widget ad-verticalsm-container">{adContent}</div>;
            default:
                return null;
        }
    };

    return (
        <section className="ad-section-wrapper">
            {sectionTitle && <h2>{sectionTitle}</h2>}
            {canEdit && (
                <div className="section-actions">
                    {onDeleteSection && (
                        <button onClick={onDeleteSection} className="delete-section-btn" title="Eliminar sección">
                            <i className="fas fa-trash"></i>
                        </button>
                    )}
                    {onAddItem && (
                        <button onClick={onAddItem}>+ Añadir Publicidad</button>
                    )}
                </div>
            )}
            {renderAdContainer()}
        </section>
    );
};

AdBanner.propTypes = {
    section: PropTypes.shape({
        section_type: PropTypes.string.isRequired,
    }).isRequired,
    sectionTitle: PropTypes.string,
    data: PropTypes.arrayOf(
        PropTypes.shape({
            ad_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            ad_name: PropTypes.string,
        })
    ),
};

export default AdBanner;
*/
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSectionEdit } from '../../../../context/SectionEditContext';
import ManageAdsModal from './ManageAdsModal';

const AdBanner = ({ section, sectionTitle, data = [] }) => {
    const { canEdit, onAddItem, onRemove, onEdit, onDeleteSection } = useSectionEdit();
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);

    // Placeholder que se muestra cuando no hay anuncios en modo edición
    const renderPlaceholder = () => (
        <div className="widget ad-widget-placeholder">
            <p>Espacio para Publicidad ({section.section_type}).</p>
            {canEdit && onAddItem && (
                <button className="btn-add-item-placeholder" onClick={onAddItem}>
                    + Añadir Publicidad
                </button>
            )}
        </div>
    );

    // Si no hay datos (anuncios) para mostrar
    if (!data || data.length === 0) {
        // Y estamos en modo edición, mostramos la sección vacía con sus controles
        if (canEdit) {
            return (
                <section className="ad-section-wrapper section-appear">
                    <div className="section-header">
                        {sectionTitle && <h2>{sectionTitle}</h2>}
                        <div className="section-actions">
                            {onDeleteSection && (
                                <button onClick={onDeleteSection} className="delete-section-btn" title="Eliminar sección"><i className="fas fa-trash"></i></button>
                            )}
                            <button onClick={() => setIsManageModalOpen(true)}>Gestionar</button>
                        </div>
                    </div>
                    {renderPlaceholder()}
                    <ManageAdsModal
                        isOpen={isManageModalOpen}
                        onClose={() => setIsManageModalOpen(false)}
                        section={section}
                    />
                </section>
            );
        }
        // Si no estamos en modo edición, no renderizamos nada
        return null;
    }

    // Si llegamos aquí, es porque hay al menos un anuncio para mostrar
    const ad = data[0];

    const adContent = (
        <>
            <div className="ad-disclaimer">Publicidad</div>
            <a href={ad.ad_target_url} target="_blank" rel="noopener noreferrer sponsored">
                <img src={ad.ad_image_url} alt={ad.ad_name} loading="lazy" />
            </a>
            {canEdit && (
                <div className="item-actions">
                    <button className="edit-item-btn" title="Editar Anuncio" onClick={() => onEdit(ad)}><i className="fas fa-pen"></i></button>
                    <button className="delete-item-btn" title="Quitar este anuncio" onClick={() => onRemove(ad.ad_id)}><i className="fas fa-trash"></i></button>
                </div>
            )}
        </>
    );

    // Función para renderizar el contenedor correcto según el tipo
    const renderAdContainer = () => {
        const containerClass = `widget ad-${section.section_type}-container`;
        return <div className={containerClass}>{adContent}</div>;
    };

    return (
        <section className="ad-section-wrapper section-appear">
            <div className="section-header">
                {sectionTitle && <h2>{sectionTitle}</h2>}
                {canEdit && (
                    <div className="section-actions">
                        {onDeleteSection && (<button onClick={onDeleteSection} className="delete-section-btn" title="Eliminar sección"><i className="fas fa-trash"></i></button>)}
                        <button onClick={() => setIsManageModalOpen(true)}>Gestionar</button>
                    </div>
                )}
            </div>
            {renderAdContainer()}
            <ManageAdsModal
                isOpen={isManageModalOpen}
                onClose={() => setIsManageModalOpen(false)}
                section={section}
            />
        </section>
    );
};


AdBanner.propTypes = {
    section: PropTypes.shape({
        section_type: PropTypes.string.isRequired,
    }).isRequired,
    sectionTitle: PropTypes.string,
    data: PropTypes.arrayOf(
        PropTypes.shape({
            ad_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            ad_name: PropTypes.string,
        })
    ),
};

export default AdBanner;