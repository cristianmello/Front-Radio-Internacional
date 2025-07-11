// src/components/layout/public/home/TrendingNews.jsx
import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import PropTypes from "prop-types";
import { useSectionEdit } from "../../../../context/SectionEditContext";
import { Link, useNavigate } from "react-router-dom";

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- 2. COMPONENTE REUTILIZABLE PARA UN ITEM ARRASTRABLE ---
const SortableNewsCard = ({ item, children }) => {
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

const TrendingNews = ({ sectionTitle = "Tendencias", data = [] }) => {
  const { canEdit, onAddItem, onRemove, onEdit, onDeleteSection, setItems, reorderItems } = useSectionEdit();
  const navigate = useNavigate()

  // --- 4. CONFIGURAR SENSORES DE DND-KIT ---
  // PointerSensor para que funcione bien en móvil y escritorio
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // --- 5. LÓGICA PARA MANEJAR EL FINAL DEL ARRASTRE ---
  const handleDragEnd = (event) => {
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
  };

  if (!data.length && !canEdit) {
    return null;
  }

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
                  article_slug,
                  title,
                  excerpt,
                  image,
                  category,
                  date,
                  url
                } = item;

                const formattedDate = date
                  ? format(new Date(date), "d 'de' MMMM, yyyy", { locale: es })
                  : "";

                return (
                  <SortableNewsCard key={item.article_code} item={item}>
                    <div className={`news-card ${!canEdit ? 'clickable' : ''}`} onClick={() => handleCardClick(item)}>
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
                            alt={category}
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
                          to={`/articulos/${article_code}/${article_slug}`}
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
                      </div>
                    </div>
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
{/*

const TrendingNews = () => {
    return (
        <section className="trending-news">
            <div className="section-header">
                <h2>Tendencias</h2>
            </div>
            <div className="news-grid">
                <div className="news-card">
                    <div className="news-image">
                        <img
                            src="https://source.unsplash.com/random/400x300/?entertainment"
                            alt="Entretenimiento"
                        />
                        <span className="category">Entretenimiento</span>
                    </div>
                    <div className="news-content">
                        <h4>Festival de cine anuncia selección oficial con sorpresas</h4>
                        <p className="excerpt">
                            Nuevos talentos y directores consagrados competirán por el
                            prestigioso premio.
                        </p>
                        <div className="article-meta">
                            <span className="date">Ayer</span>
                            <a href="#" className="read-more" data-article-id="5">
                                Leer más
                            </a>
                        </div>
                    </div>
                </div>

                <div className="news-card">
                    <div className="news-image">
                        <img
                            src="https://source.unsplash.com/random/400x300/?science"
                            alt="Ciencia"
                        />
                        <span className="category">Ciencia</span>
                    </div>
                    <div className="news-content">
                        <h4>Descubren planeta potencialmente habitable a solo 40 años luz</h4>
                        <p className="excerpt">
                            Científicos detectan condiciones similares a la Tierra en sistema
                            estelar cercano.
                        </p>
                        <div className="article-meta">
                            <span className="date">Hace 3 días</span>
                            <a href="#" className="read-more" data-article-id="6">
                                Leer más
                            </a>
                        </div>
                    </div>
                </div>

                <div className="news-card">
                    <div className="news-image">
                        <img
                            src="https://source.unsplash.com/random/400x300/?politics"
                            alt="Política"
                        />
                        <span className="category">Política</span>
                    </div>
                    <div className="news-content">
                        <h4>Elecciones anticipadas sorprenden al panorama político</h4>
                        <p className="excerpt">
                            El anuncio genera incertidumbre y realineamientos en los partidos
                            tradicionales.
                        </p>
                        <div className="article-meta">
                            <span className="date">Hace 1 día</span>
                            <a href="#" className="read-more" data-article-id="7">
                                Leer más
                            </a>
                        </div>
                    </div>
                </div>

                <div className="news-card">
                    <div className="news-image">
                        <img
                            src="https://source.unsplash.com/random/400x300/?health"
                            alt="Salud"
                        />
                        <span className="category">Salud</span>
                    </div>
                    <div className="news-content">
                        <h4>Nuevo tratamiento contra el cáncer muestra resultados prometedores</h4>
                        <p className="excerpt">
                            Ensayos clínicos revelan eficacia sin precedentes en casos
                            avanzados.
                        </p>
                        <div className="article-meta">
                            <span className="date">Hace 2 días</span>
                            <a href="#" className="read-more" data-article-id="8">
                                Leer más
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

*/}