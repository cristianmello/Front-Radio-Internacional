// src/components/layout/public/home/FeaturedNews.jsx
import React from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { useSectionEdit } from "../../../../context/SectionEditContext";


// Imports de DND-Kit
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableArticle = ({ item, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.article_code });
    const { canEdit } = useSectionEdit();

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: canEdit ? 'grab' : 'default',
    };

    const dndListeners = canEdit ? listeners : {};

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...dndListeners}>
            {children}
        </div>
    );
};


const FeaturedNews = ({ sectionTitle = "Destacados", data = [] }) => {
    const { canEdit, onAddItem, onRemove, onDeleteSection, onEdit, setItems, reorderItems } = useSectionEdit();
    const navigate = useNavigate();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    // Lógica que se ejecuta al terminar de arrastrar
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = data.findIndex((item) => item.article_code === active.id);
            const newIndex = data.findIndex((item) => item.article_code === over.id);
            const newData = arrayMove(data, oldIndex, newIndex);
            setItems(newData); // Actualización visual instantánea
            const orderedCodes = newData.map(item => item.article_code);
            reorderItems(orderedCodes); // Persistir en el backend
        }
    };

    const noTitle = !sectionTitle;

    const handleItemClick = (item) => {
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
        <section className="featured-news">
            <div className={`section-header${noTitle ? " no-title" : ""}`}>
                {sectionTitle && <h2>{sectionTitle}</h2>}

                {/* contenedor de acciones */}
                {canEdit && (

                    <div className="section-actions">
                        {onDeleteSection && (<button onClick={onDeleteSection} className="delete-section-btn" title="Eliminar sección"><i className="fas fa-trash"></i>
                        </button>)}

                        {onAddItem && (<button onClick={onAddItem}>+ Añadir Noticia</button>)}

                    </div>
                )}
            </div>
            {data.length > 0 ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={data.map(item => item.article_code)} strategy={rectSortingStrategy}>
                        <div className="news-list">
                            {data.map((item) => {
                                const {
                                    article_code,
                                    article_slug,
                                    image,
                                    category,
                                    title,
                                    excerpt,
                                    author,
                                    date,
                                    url = "#"
                                } = item;

                                return (
                                    <SortableArticle key={item.article_code} item={item}>
                                        <article
                                            className={`news-item ${!canEdit ? 'clickable' : ''}`}
                                            key={article_code}
                                            onClick={() => handleItemClick(item)}
                                        >
                                            <div className="news-item-image">
                                                <picture>
                                                    <source
                                                        srcSet={`${image}?width=600&height=400&fit=cover 600w, ${image}?width=1200&height=800&fit=cover 1200w, ${image}?width=1800&height=1200&fit=cover 1800w`}
                                                        sizes="(max-width: 600px) 600px, (max-width: 1200px) 1200px, 1800px"
                                                        type="image/webp"
                                                    />
                                                    <source
                                                        srcSet={`${image}?width=600&height=400&fit=cover 600w, ${image}?width=1200&height=800&fit=cover 1200w, ${image}?width=1800&height=1200&fit=cover 1800w`}
                                                        sizes="(max-width: 600px) 600px, (max-width: 1200px) 1200px, 1800px"
                                                        type="image/jpeg"
                                                    />
                                                    <img
                                                        src={image || "/placeholder.jpg"}
                                                        alt={title}
                                                        data-editable-id={`img-${article_code}`}
                                                        loading="lazy" // Lazy load
                                                        className="news-card-image"
                                                    />
                                                </picture>
                                            </div>

                                            <div className="news-item-content">
                                                <span className="category">{category}</span>
                                                <h3>{title}</h3>
                                                <p className="excerpt">{excerpt}</p>
                                                <div className="article-meta">
                                                    {/*} <span className="author">Por {author}</span>*/}
                                                    <span className="date">{date}</span>
                                                </div>
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
                                            </div>

                                            {canEdit && (
                                                <div className="item-actions">
                                                    {/* Botón editar artículo */}
                                                    <button
                                                        className="edit-item-btn"
                                                        title="Editar artículo"
                                                        onClick={() => onEdit(item)}
                                                    >
                                                        <i className="fas fa-pen"></i>
                                                    </button>

                                                    {/* Botón eliminar artículo */}
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
                                        </article>
                                    </SortableArticle >
                                );
                            })}
                        </div>
                    </SortableContext>
                </DndContext>
            ) : (
                <p className="no-items-message">No hay artículos en esta sección.</p>
            )}
        </section >
    );
};

FeaturedNews.propTypes = {
    sectionTitle: PropTypes.string,
    data: PropTypes.arrayOf(
        PropTypes.shape({
            article_code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            image: PropTypes.string,
            category: PropTypes.string,
            title: PropTypes.string,
            excerpt: PropTypes.string,
            author: PropTypes.string,
            date: PropTypes.string,
            url: PropTypes.string
        })
    ),
};

export default FeaturedNews;
