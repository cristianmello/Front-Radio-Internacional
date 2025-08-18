// src/components/layout/public/home/MosaicNews.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSectionEdit } from "../../context/SectionEditContext";
import { isColorDark } from "../../helpers/colorUtils";
import useAuth from "../../hooks/UseAuth";
import Url from "../../helpers/Url";

// Imports de DND-Kit
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * Componente envoltorio que hace que cada ítem del mosaico sea arrastrable.
 */
const SortableMosaicItem = ({ item, children }) => {
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

const MosaicNews = ({
    sectionId,
    sectionSlug,
    sectionTitle = "Panorama Noticioso",
    initialBgColor = "#f8f9fa",
    data = [],
}) => {
    const { canEdit, onAddItem, onRemove, onDeleteSection, onEdit, setItems, reorderItems } = useSectionEdit();

    const navigate = useNavigate()
    const noTitle = !sectionTitle;
    const { authFetch } = useAuth();
    const [bgColor, setBgColor] = useState(initialBgColor);
    const isInitialMount = useRef(true);

    useEffect(() => { setBgColor(initialBgColor); }, [initialBgColor]);
    // Configuración de los sensores de DND-Kit
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
            setItems(newData);
            const orderedCodes = newData.map(item => item.article_code);
            reorderItems(orderedCodes);
        }
    };

    const colorOptions = [
        { name: "Blanco (fondo body)", hex: "#f8f9fa" },// color blanco original

        { name: "Base oscuro", hex: "#131d26" }, // color original
        { name: "Nocturno profundo", hex: "#0D161E" }, // ultra oscuro
        { name: "Azul tormenta", hex: "#0F1E29" }, // contraste frío
        { name: "Azul medianoche", hex: "#101A22" }, // balance profundo
        { name: "Brillante oceánico", hex: "#1C2F3B" }, // un punto más vivo
        { name: "Suave crepúsculo", hex: "#1A2630" }, // matiz grisáceo
        { name: "Latón opaco", hex: "#1E2B33" }, // tono apagado
        { name: "Cobalto oscuro", hex: "#16212C" }, // un poco más saturado
        { name: "Azul ceniza", hex: "#20303B" }, // grisáceo y frío
        { name: "Niebla marina", hex: "#1B2832" }, // más suave y opaco
        { name: "Océano sombrío", hex: "#0E1A24" }, // mezcla de todos
    ];



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


    const titleColor = isColorDark(bgColor) ? '#FFFFFF' : '#000000';

    // añade arriba: import Url from "../../helpers/Url";
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (!canEdit || !sectionSlug) return;

        const controller = new AbortController();
        let cancelled = false;

        const saveColor = async () => {
            try {
                const url = `${Url.url}/api/sections/${sectionSlug}`; // <-- URL correcta con slug
                const res = await authFetch(url, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ background_color: bgColor }),
                    signal: controller.signal
                });

                if (!res.ok) {
                    const text = await res.text().catch(() => null);
                    console.error('[MosaicNews] Error guardando color:', res.status, text);
                } else {
                    console.log('Color guardado:', bgColor);
                }
            } catch (err) {
                if (err.name !== 'AbortError') console.error('[MosaicNews] Excepción guardando color:', err);
            }
        };

        const timer = setTimeout(saveColor, 800);

        return () => {
            clearTimeout(timer);
            cancelled = true;
            controller.abort();
        };
    }, [bgColor, sectionSlug, canEdit, authFetch]);


    return (
        <div className="mosaic-news-bleed" style={{ backgroundColor: bgColor }}>

            {/* Selector de color en modo edición */}
            {canEdit && (
                <div className="color-picker">
                    <label>
                        Fondo:&nbsp;
                        <select
                            value={bgColor}
                            onChange={e => setBgColor(e.target.value)}
                        >
                            {colorOptions.map(opt => (
                                <option key={opt.hex} value={opt.hex}>
                                    {opt.name} ({opt.hex})
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            )}

            <section className="mosaic-news">
                {
                    !noTitle && (
                        <div className="premium-section-header">
                            <h2 style={{ color: titleColor }}>{sectionTitle}</h2>
                            {/* <p className="subtitle">Contenido Exclusivo para Suscriptores</p> */}
                        </div>
                    )
                }

                {/* Los botones de acción ahora pueden ir fuera del título para un diseño más limpio */}
                <div className="section-actions" style={{ textAlign: 'right', marginBottom: '20px' }}>
                    {canEdit && typeof onDeleteSection === "function" && (
                        <button
                            className="delete-section-btn"
                            title="Eliminar sección"
                            onClick={onDeleteSection}
                        >
                            <i className="fas fa-trash"></i>
                        </button>
                    )}
                    {canEdit && typeof onAddItem === "function" && (
                        <button onClick={onAddItem}>+ Añadir Noticia</button>
                    )}
                </div>

                {data.length > 0 ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={data.map(item => item.article_code)} strategy={rectSortingStrategy}>
                            <div className="mosaic-container">
                                {data.map((item, idx) => {
                                    const { article_code, article_slug, title, excerpt, image, category, url } = item;
                                    const modifiers = [];
                                    if (idx === 0) modifiers.push("large");
                                    if (idx === 3) modifiers.push("vertical");

                                    return (
                                        <SortableMosaicItem key={article_code} item={item}>
                                            <div
                                                className={["mosaic-item", ...modifiers, !canEdit ? 'clickable' : ''].join(" ")}
                                                key={article_code}
                                                onClick={() => handleItemClick(item)}
                                            >
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
                                                        alt={category}
                                                        loading="lazy" // Lazy load
                                                        className="news-card-image"
                                                    />
                                                </picture>

                                                <div className="mosaic-content">
                                                    <span className="category">{category}</span>
                                                    {idx === 0 ? <h3>{title}</h3> : <h4>{title}</h4>}
                                                    {excerpt && <p className="excerpt">{excerpt}</p>}

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
                                        </SortableMosaicItem>
                                    );
                                })}
                            </div>
                        </SortableContext>
                    </DndContext>
                ) : (
                    <p className="no-items-message">No hay artículos en esta sección.</p>
                )}
            </section>
        </div>
    );
};

export default MosaicNews;
