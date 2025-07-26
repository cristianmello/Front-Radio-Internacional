// src/components/layout/public/home/NewsSidebar.jsx
import React from "react";
import PropTypes from 'prop-types';
import SidebarWidget from "./SidebarWidget";

/**
 * Componente de presentación puro que sirve como el contenedor principal 
 * para todos los widgets del sidebar.
 * @param {Array} data - Array de secciones a renderizar en el sidebar.
 * @param {Function} onSectionDeleted - Callback para refrescar al borrar.
 * @param {boolean} canEditGlobal - Flag para modo edición global.
 */
const NewsSidebar = ({
    sectionTitle = "Widgets",
    data = [],
    onSectionDeleted,
    canEditGlobal
}) => {
    if (!data.length) return null;

    return (
        <aside className="sidebar">
            <h4>{sectionTitle}</h4>
            {data.map(section => (
                <SidebarWidget
                    key={section.section_slug}
                    section={section}
                    onSectionDeleted={onSectionDeleted}
                    canEditGlobal={canEditGlobal}
                />
            ))}
        </aside>
    );
};

NewsSidebar.propTypes = {
    sectionTitle: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.object),
    onSectionDeleted: PropTypes.func,
    canEditGlobal: PropTypes.bool,
};

export default NewsSidebar;


/*// src/components/layout/public/home/NewsSidebar.jsx
import React from "react";

const NewsSidebar = ({ sectionTitle, data = [], children }) => {
    return (
        <aside className="sidebar">
            {children}
        </aside>
    );
};

export default NewsSidebar;
*/
{/*// src/components/layout/public/home/NewsSidebar.jsx
import React from "react";
import { useSectionEdit } from "../../../../context/SectionEditContext";

const NewsSidebar = ({ sectionTitle, data = [] }) => {
    const { canEdit, onAddItem, onRemove, onEdit } = useSectionEdit();

    return (
        <aside className="sidebar">
            {/*  <div className="widget popular-posts">
                <div className="widget-header">
                    <h3>{sectionTitle}</h3>
                    {canEdit && onAddItem && (
                        <button className="add-btn" onClick={onAddItem}>
                            + Añadir
                        </button>
                    )}
                </div>

              }  {data.length > 0 ? (
                    <ul className="popular-list">
                        {data.map(post => (
                            <li key={post.article_code} className="popular-item">
                                <div className="post-image">
                                    <img
                                        src={post.image || "/placeholder.jpg"}
                                        alt={post.category || post.title}
                                    />
                                </div>
                                <div className="post-info">
                                    <h5>{post.title}</h5>
                                    <span className="date">
                                        {new Date(post.date).toLocaleDateString()}
                                    </span>
                                    {canEdit && (
                                        <div className="item-actions">
                                            <button
                                                className="edit-item-btn"
                                                title="Editar artículo"
                                                onClick={() => onEdit(post.article_code)}
                                            >
                                                <i className="fas fa-pen"></i>
                                            </button>

                                            {onRemove && (
                                                <button
                                                    className="delete-item-btn"
                                                    title="Eliminar elemento"
                                                    onClick={() => onRemove(post.article_code)}
                                                >
                                                    <i className="fas fa-trash" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-items">No hay posts en esta sección.</p>
                )}
            </div>

            <div className="widget newsletter">
                <h3>Suscríbete</h3>
                <p>Recibe las noticias más importantes del día en tu correo</p>
                <form onSubmit={e => e.preventDefault()}>
                    <input
                        type="email"
                        placeholder="Tu correo electrónico"
                        required
                    />
                    <button type="submit">Suscribirse</button>
                </form>
            </div>

            <div className="widget ad-widget">
                <div className="ad-disclaimer">Publicidad</div>
                <a href="#">
                    <img
                        src="https://source.unsplash.com/random/300x250/?ad"
                        alt="Anuncio"
                    />
                </a>
            </div>

            <div className="widget tags">
                <h3>Temas Populares</h3>
                <div className="tag-cloud">
                    {[
                        "Coronavirus",
                        "Economía",
                        "Elecciones",
                        "Cambio climático",
                        "Tecnología",
                        "Deportes",
                    ].map(tag => (
                        <a key={tag} href="#" className="tag">
                            {tag}
                        </a>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default NewsSidebar;
*/}