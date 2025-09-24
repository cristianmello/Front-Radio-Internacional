import React, { useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSectionEdit } from "../../context/SectionEditContext";

import FeaturedArticle from "./FeaturedArticle";
import TopStories from "./TopStories";

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableItemWrapper = React.memo(({ item, children }) => {
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

const TopStoryItem = React.memo(({ item, onNavigate, onEditItem, onRemoveItem }) => {
    const { canEdit } = useSectionEdit();

    // Creamos handlers estables para evitar funciones inline en el JSX
    const handleNavigate = useCallback(() => onNavigate(item), [item, onNavigate]);
    const handleEdit = useCallback((e) => { e.stopPropagation(); onEditItem(item); }, [item, onEditItem]);
    const handleRemove = useCallback((e) => { e.stopPropagation(); onRemoveItem(item.article_code); }, [item.article_code, onRemoveItem]);

    return (
        <div className={`news-card small-card ${!canEdit ? 'clickable' : ''}`} onClick={handleNavigate}>
            <div className="story-image">
                {item.is_premium && <div className="badge premium">Premium</div>}
                <img src={item.image || "/placeholder.jpg"} alt={item.title} loading="lazy" />
            </div>
            <div className="story-content">
                <span className="category">{item.category_name}</span>
                <h4>{item.title}</h4>
                <p className="excerpt">{item.excerpt}</p>
                <Link to={`/articulos/${item.article_code}/${item.slug}`} className="read-more">Leer más</Link>
                {canEdit && (
                    <div className="item-actions">
                        <button className="edit-item-btn" title="Editar" onClick={handleEdit}><i className="fas fa-pen"></i></button>
                        <button className="delete-item-btn" title="Quitar" onClick={handleRemove}><i className="fas fa-trash" /></button>
                    </div>
                )}
            </div>
        </div>
        
    );
});

const BreakingNews = ({ sectionTitle, data = [] }) => {
    const { canEdit, onAddItem, onRemove, onEdit, onDeleteSection, setItems, reorderItems } = useSectionEdit();
    const navigate = useNavigate();

    // 3. Memorizamos la configuración de los sensores de DND-Kit
    const sensors = useMemo(() => useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    ), []);


    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = data.findIndex((item) => item.article_code === active.id);
            const newIndex = data.findIndex((item) => item.article_code === over.id);
            const newData = arrayMove(data, oldIndex, newIndex);
            setItems(newData);
            const orderedCodes = newData.map(item => item.article_code);
            reorderItems(orderedCodes);
        }
    }, [data, setItems, reorderItems]);

    const handleNavigateItem = useCallback((item) => {
        if (!canEdit) {
            navigate(`/articulos/${item.article_code}/${item.slug}`);
        }
    }, [canEdit, navigate]);

    if (!data.length && !canEdit) return null;

    const featuredArticleData = data[0];
    const topStoriesData = data.slice(1);
    const noTitle = !sectionTitle;

    return (
        <section className="breaking-news section-appear">
            <div className={`section-header${noTitle ? " no-title" : ""}`}>
                {sectionTitle && <h2>{sectionTitle}</h2>}
                {canEdit && (
                    <div className="section-actions">
                        {onDeleteSection && <button onClick={onDeleteSection} className="delete-section-btn" title="Eliminar sección"><i className="fas fa-trash"></i></button>}
                        {onAddItem && <button onClick={onAddItem}>+ Añadir Noticia</button>}
                    </div>
                )}
            </div>

            {/* Este div es el que tu CSS probablemente usa para el layout de 2 columnas */}
            <div className="breaking-news-content">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={data.map(item => item.article_code)} strategy={verticalListSortingStrategy}>

                        {/* El artículo principal se renderiza envuelto para ser arrastrable */}
                        {featuredArticleData && (
                            <SortableItemWrapper item={featuredArticleData}>
                                <FeaturedArticle data={featuredArticleData} />
                            </SortableItemWrapper>
                        )}

                        {/* El contenedor de TopStories recibe los ítems secundarios como hijos */}
                        <TopStories>
                            {topStoriesData.map(item => (
                                <SortableItemWrapper key={item.article_code} item={item}>
                                    {/* Aquí recreamos la tarjeta de noticia con todos sus estilos y datos */}
                                    <TopStoryItem 
                                        item={item}
                                        onNavigate={handleNavigateItem}
                                        onEditItem={onEdit}
                                        onRemoveItem={onRemove}
                                    />
                                </SortableItemWrapper>
                            ))}
                        </TopStories>

                    </SortableContext>
                </DndContext>
            </div>
        </section>
    );
};

export default BreakingNews;