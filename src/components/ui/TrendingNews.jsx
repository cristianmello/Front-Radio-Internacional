// src/components/layout/public/home/TrendingNews.jsx
import React, { useCallback, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import PropTypes from "prop-types";
import { useSectionEdit } from "../../context/SectionEditContext";
import { Link, useNavigate } from "react-router-dom";

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TrendingNewsCardContent = React.memo(({ item, onCardClick, onEditItem, onRemoveItem }) => {
  const { canEdit } = useSectionEdit();
  const { article_code, slug, title, excerpt, image, category_name, date } = item;

  // Memorizamos la fecha formateada para no recalcularla en cada render
  const formattedDate = useMemo(() =>
    date ? format(new Date(date), "d 'de' MMMM, yyyy", { locale: es }) : "",
    [date]
  );

  // Creamos handlers estables para los clicks
  const handleCardClick = useCallback(() => onCardClick(item), [item, onCardClick]);
  const handleEdit = useCallback(() => onEditItem(item), [item, onEditItem]);
  const handleRemove = useCallback(() => onRemoveItem(article_code), [article_code, onRemoveItem]);

  return (
    <div className={`news-card ${!canEdit ? 'clickable' : ''}`} onClick={handleCardClick}>
      <div className="news-image">
        <picture>
          <source
            srcSet={`${image}?width=600&height=400&fit=contain 600w, ${image}?width=1200&height=800&fit=contain 1200w, ${image}?width=1800&height=1200&fit=contain 1800w`}
            sizes="(max-width: 600px) 600px, (max-width: 1200px) 1200px, 1800px"
            type="image/webp"
          />
          <source
            srcSet={`${image}?width=600&height=400&fit=contain 600w, ${image}?width=1200&height=800&fit=contain 1200w, ${image}?width=1800&height=1200&fit=contain 1800w`}
            sizes="(max-width: 600px) 600px, (max-width: 1200px) 1200px, 1800px"
            type="image/jpeg"
          />
          <img
            src={image || "/placeholder.jpg"}
            alt={title}
            loading="lazy" // Lazy load
            className="news-card-image"
          />
        </picture>

      </div>
      <div className="news-content">

        <h4>{title}</h4>
        <p className="excerpt">{excerpt}</p>
        <div className="article-meta">
          <span className="date">{formattedDate}</span>

        </div>
        <Link
          to={`/articulos/${article_code}/${slug}`}
          className="read-more"
          state={{
            article: {
              ...item, // Copia todas las propiedades originales de 'item'
              article_published_at: item.date, // Añade la propiedad que ArticlePage necesita, usando el valor de 'item.date'
            },
          }}
        >
          Leer mas
        </Link>

        {canEdit && (
          <div className="item-actions">
            {/* Botón editar artículo */}
            <button className="edit-item-btn" title="Editar artículo" onClick={handleEdit}>
              <i className="fas fa-pen"></i>
            </button>

            {/* Botón eliminar artículo */}
            {onRemoveItem && (
              <button className="delete-item-btn" title="Eliminar elemento" onClick={handleRemove}>
                <i className="fas fa-trash" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

const SortableNewsCard = React.memo(({ item, children }) => {
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

const TrendingNews = ({ sectionTitle = "Tendencias", data = [] }) => {
  const { canEdit, onAddItem, onRemove, onEdit, onDeleteSection, setItems, reorderItems } = useSectionEdit();
  const navigate = useNavigate()

  const sensors = useMemo(() => useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  ), []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = data.findIndex((item) => item.article_code === active.id);
      const newIndex = data.findIndex((item) => item.article_code === over.id);

      // Reordenamos el array localmente para una respuesta visual instantánea
      const newData = arrayMove(data, oldIndex, newIndex);
      setItems(newData);

      // Extraemos solo los códigos en el nuevo orden
      const orderedCodes = newData.map(item => item.article_code);

      // Llamamos a la función del hook para persistir en el backend
      reorderItems(orderedCodes);
    }
  }, [data, setItems, reorderItems]);

  const handleCardClick = useCallback((item) => {
    if (canEdit) return;
    navigate(`/articulos/${item.article_code}/${item.slug}`, {
      state: { article: { ...item, article_published_at: item.date } },
    });
  }, [canEdit, navigate]);

  if (!data.length && !canEdit) {
    return null;
  }

  const noTitle = !sectionTitle;

  return (
    <section className="trending-news section-appear">

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
        // --- 6. ENVOLVER LA LISTA CON LOS CONTEXTOS DE DND-KIT ---
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={data.map(item => item.article_code)} strategy={rectSortingStrategy}>
            <div className="news-grid">
              {data.map((item) => {
                const {
                  article_code,
                  slug,
                  title,
                  excerpt,
                  image,
                  category_name,
                  date,
                  url
                } = item;

                const formattedDate = date
                  ? format(new Date(date), "d 'de' MMMM, yyyy", { locale: es })
                  : "";

                return (
                  <SortableNewsCard key={item.article_code} item={item}>
                    <TrendingNewsCardContent
                      item={item}
                      onCardClick={handleCardClick}
                      onEditItem={onEdit}
                      onRemoveItem={onRemove}
                    />

                  </SortableNewsCard>

                );
              })}
            </div>
          </SortableContext>
        </DndContext>

      ) : (
        <p className="no-items-message">No hay artículos en esta sección.</p>
      )}
    </section>
  );
};

TrendingNews.propTypes = {
  sectionTitle: PropTypes.string,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      article_code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string,
      excerpt: PropTypes.string,
      image: PropTypes.string,
      category: PropTypes.string,
      date: PropTypes.string,
      url: PropTypes.string
    })
  ),

};

export default TrendingNews;