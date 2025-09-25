// src/components/layout/public/home/NewsMain.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useSectionEdit } from "../../context/SectionEditContext";

// Imports de DND-Kit
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const ArticleContent = React.memo(({ item, onItemClick, onEditItem, onRemoveItem }) => {
    const { canEdit } = useSectionEdit();
    const { article_code, article_slug, image, category_name, title, excerpt, date } = item;

    // Memorizamos cálculos y handlers
    const formattedDate = useMemo(() =>
        date ? format(new Date(date), "d 'de' MMMM, yyyy", { locale: es }) : "Fecha no disponible",
        [date]
    );

    const srcSetWebp = useMemo(() => `${image}?width=600&height=400&fit=contain 600w, ${image}?width=1200&height=800&fit=contain 1200w`, [image]);
    const srcSetJpeg = useMemo(() => `${image}?width=600&height=400&fit=contain 600w, ${image}?width=1200&height=800&fit=contain 1200w`, [image]);

    const handleClick = useCallback(() => onItemClick(item), [item, onItemClick]);
    const handleEdit = useCallback((e) => { e.stopPropagation(); onEditItem(item); }, [item, onEditItem]);
    const handleRemove = useCallback((e) => { e.stopPropagation(); onRemoveItem(article_code); }, [article_code, onRemoveItem]);

    return (
        <article
            className={`news-item ${!canEdit ? 'clickable' : ''}`}
            key={item.article_code}
            onClick={handleClick}                                        >
            <div className="news-item-image">
                <picture>
                    <source
                        srcSet={srcSetWebp}
                        sizes="(max-width: 600px) 600px, (max-width: 1200px) 1200px, 1800px"
                        type="image/webp"
                    />
                    <source
                        srcSet={srcSetJpeg}
                        sizes="(max-width: 600px) 600px, (max-width: 1200px) 1200px, 1800px"
                        type="image/jpeg"
                    />
                    <img src={image || "/placeholder.jpg"} alt={title || "Imagen de la noticia"} loading="lazy" />

                </picture>
            </div>
            <div className="news-item-content">
                {item.category_name && <span className="category">{item.category_name}</span>}
                <h3>
                    {item.title}
                </h3>
                <p className="excerpt">{item.excerpt}</p>
                <div className="article-meta">
                    <span className="date">{formattedDate}</span>
                    <Link
                        to={`/articulos/${item.article_code}/${item.article_slug}`}
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
                        <button
                            className="edit-item-btn"
                            title="Editar artículo"
                            onClick={handleEdit}
                        >
                            <i className="fas fa-pen"></i>
                        </button>
                        {onRemoveItem && (
                            <button
                                className="delete-item-btn"
                                title="Eliminar elemento"
                                onClick={handleRemove}
                            >
                                <i className="fas fa-trash" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
});

/**
 * Componente envoltorio que hace que cada artículo sea arrastrable.
 */
const SortableArticleItem = React.memo(({ item, children }) => {
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
});

const ITEMS_PER_PAGE = 8;

const NewsMain = ({ sectionTitle, data = [], categoryFilter }) => {
    const { canEdit, onAddItem, onRemove, onEdit, setItems, reorderItems } = useSectionEdit();
    const [currentPage, setCurrentPage] = useState(1);
    const sectionRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        setCurrentPage(1);
    }, [categoryFilter]);


    // Configuración de DND-Kit
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );
    
    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            // Esta lógica funciona sobre el array 'data' completo, no solo la página actual
            const oldIndex = data.findIndex((item) => item.article_code === active.id);
            const newIndex = data.findIndex((item) => item.article_code === over.id);

            const newData = arrayMove(data, oldIndex, newIndex);
            setItems(newData);

            const orderedCodes = newData.map(item => item.article_code);
            reorderItems(orderedCodes);
        }
    }, [data, setItems, reorderItems]);

    const filteredItems = useMemo(() =>
        categoryFilter && categoryFilter !== 'inicio'
            ? data.filter(item => item.category_slug === categoryFilter)
            : data,
        [data, categoryFilter]
    );

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const pageItems = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredItems.slice(startIndex, endIndex);
    }, [filteredItems, currentPage]);

    const handlePageChange = useCallback((page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            // Después de cambiar de página, hacemos scroll suave al inicio de la sección.
            if (sectionRef.current) {
                sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    }, [totalPages]);

    const handleItemClick = useCallback((item) => {
        if (canEdit) return;

        navigate(`/articulos/${item.article_code}/${item.slug}`, {
            state: {
                article: {
                    ...item,
                    article_published_at: item.date,
                },
            },
        });
    }, [canEdit, navigate]);

    return (
        // Asignamos la referencia al elemento <section>
        <section className="main-content" ref={sectionRef}>
            <div className="section-header">
                <h2>{sectionTitle}</h2>
                {canEdit && onAddItem && (
                    <div className="section-actions">
                        <button onClick={onAddItem}>+ Añadir Noticia</button>
                    </div>
                )}
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                {/* OJO: El SortableContext debe recibir el array COMPLETO de datos, no solo los de la página actual */}
                <SortableContext items={data.map(item => item.article_code)} strategy={rectSortingStrategy}>
                    <div className="news-list">
                        {filteredItems.length > 0 ? (
                            pageItems.map(item => {
                                const formattedDate = item.date
                                    ? format(new Date(item.date), "d 'de' MMMM, yyyy", { locale: es })
                                    : "Fecha no disponible";

                                return (
                                    <SortableArticleItem key={item.article_code} item={item}>
                                        <ArticleContent
                                            item={item}
                                            onItemClick={handleItemClick}
                                            onEditItem={onEdit}
                                            onRemoveItem={onRemove}
                                        />
                                    </SortableArticleItem >

                                );
                            })

                        ) : (
                            <p className="no-items">No hay artículos en esta sección.</p>
                        )}
                    </div>
                </SortableContext>
            </DndContext>
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        ←
                    </button>

                    {/* Lógica de renderizado de botones de página */}
                    {[...Array(totalPages).keys()].map(pageNumber => (
                        <button
                            key={pageNumber + 1}
                            className={`pagination-btn ${currentPage === pageNumber + 1 ? 'active' : ''}`}
                            onClick={() => handlePageChange(pageNumber + 1)}
                        >
                            {pageNumber + 1}
                        </button>
                    ))}

                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        →
                    </button>
                </div>
            )}
        </section >
    );
};

export default NewsMain;