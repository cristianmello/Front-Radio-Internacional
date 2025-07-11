import React from "react";
import PropTypes from "prop-types";

/**
 * Componente de presentación. Sirve como el contenedor visual para
 * las noticias secundarias (Top Stories).
 */
const TopStories = ({ children }) => {
    // Si no se le pasan hijos, no renderiza nada.
    if (!children || React.Children.count(children) === 0) {
        return null;
    }

    return (
        <div className="top-stories">
            {children}
        </div>
    );
};

TopStories.propTypes = {
    children: PropTypes.node,
};

export default TopStories;

{/* FUNCIONANDOOOO ANTES DE DRAG AND DROP
    // src/components/layout/public/home/TopStories.jsx
    import React from "react";
    import { Link, useNavigate } from "react-router-dom";
    import PropTypes from "prop-types";
    import { useSectionEdit } from "../../../../context/SectionEditContext";
    
    
    const TopStories = ({ data = [] }) => {
        const { canEdit, onRemove, onEdit } = useSectionEdit();
    
        const navigate = useNavigate()
    
        if (!data.length) return null;
    
        const handleCardClick = (item) => {
            if (canEdit) return;
    
            navigate(`/articulos/${item.article_code}/${item.article_slug}`, {
                state: {
                    article: {
                        ...item,
                        article_published_at: item.date,
                    },
                },
            });
        };
    
        return (
            <div className="top-stories">
                {data.map((item) => {
                    const {
                        article_code,
                        article_slug,
                        title,
                        excerpt,
                        image,
                        category,
                        url,
                        is_premium,
                    } = item;
    
                    return (
                        <div
                            className={`news-card ${!canEdit ? 'clickable' : ''}`}
                            key={article_code}
                            onClick={() => handleCardClick(item)}
                        >
                            <div className="story-image">
                                {is_premium && <div className="badge premium">Premium</div>}
                                <picture>
                                    <source
                                        srcSet={`${item.image}?width=600&height=400&fit=cover 600w, ${item.image}?width=1200&height=800&fit=cover 1200w, ${item.image}?width=1800&height=1200&fit=cover 1800w`}
                                        sizes="(max-width: 600px) 600px, (max-width: 1200px) 1200px, 1800px"
                                        type="image/webp"
                                    />
                                    <source
                                        srcSet={`${item.image}?width=600&height=400&fit=cover 600w, ${item.image}?width=1200&height=800&fit=cover 1200w, ${item.image}?width=1800&height=1200&fit=cover 1800w`}
                                        sizes="(max-width: 600px) 600px, (max-width: 1200px) 1200px, 1800px"
                                        type="image/jpeg"
                                    />
                                    <img
                                        src={item.image || "/placeholder.jpg"}
                                        alt={item.category || item.title}
                                        loading="lazy" // Lazy load
                                    />
                                </picture>
    
                            </div>
    
                            <div className="story-content">
                                <span
                                    className="category"
                                    data-editable-id={`cat-${article_code}`}
                                >
                                    {category}
                                </span>
    
                                <h4 data-editable-id={`title-${article_code}`}>{title}</h4>
    
                                <p
                                    className="excerpt"
                                    data-editable-id={`excerpt-${article_code}`}
                                >
                                    {excerpt}
                                </p>
    
                                <Link
                                    to={`/articulos/${article_code}/${article_slug}`}
                                    className="read-more"
                                    state={{
                                        article: {
                                            ...item,
                                            article_published_at: item.date,
                                        },
                                    }}
                                >
                                    Leer más
                                </Link>
    
                                {canEdit && (
                                    <div className="item-actions">
                                        <button
                                            className="edit-item-btn"
                                            title="Editar artículo"
                                            onClick={() => onEdit(item)}
                                        >
                                            <i className="fas fa-pen"></i>
                                        </button>
    
                                        {onRemove && (
                                            <button
                                                className="delete-item-btn"
                                                title="Eliminar elemento"
                                                onClick={() => onRemove(article_code)}
                                            >
                                                <i className="fas fa-trash" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };
    
    TopStories.propTypes = {
        data: PropTypes.arrayOf(
            PropTypes.shape({
                article_code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
                title: PropTypes.string,
                excerpt: PropTypes.string,
                image: PropTypes.string,
                category: PropTypes.string,
                url: PropTypes.string,
                is_premium: PropTypes.bool,
            })
        ),
    };
    
    export default TopStories;
    */}