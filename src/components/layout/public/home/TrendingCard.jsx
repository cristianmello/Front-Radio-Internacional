// src/components/layout/public/home/TrendingCard.jsx
import React, { useState, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import { AdminModeContext } from "../PublicLayout";
import { useEditable } from "../../../../hooks/useEditable";

/**
 * Componente para cada tarjeta de noticia en TrendingNews.
 * Props:
 *  - item: { id, imageUrl, alt, category, title, excerpt, date, linkUrl }
 *  - isAdminMode: boolean
 *  - onUpdate: función (id, updatedFields)
 *  - onDelete: función (id)
 */
const TrendingCard = ({ item, isAdminMode, onUpdate, onDelete }) => {
    const { id } = item;

    // Estados locales desde props
    const [localImageUrl, setLocalImageUrl] = useState(item.imageUrl);
    const [localAlt, setLocalAlt] = useState(item.alt || "");
    const [localCategory, setLocalCategory] = useState(item.category);
    const [localTitle, setLocalTitle] = useState(item.title);
    const [localExcerpt, setLocalExcerpt] = useState(item.excerpt || "");
    const [localDate, setLocalDate] = useState(item.date);
    const [localLinkUrl, setLocalLinkUrl] = useState(item.linkUrl || "#");

    // Refs para useEditable
    const imgRef = useRef();
    const categoryRef = useRef();
    const titleRef = useRef();
    const excerptRef = useRef();
    const dateRef = useRef();
    const linkRef = useRef();

    // Lógica para guardar cambios
    const handleSaveField = (field, newValues) => {
        const updated = {};
        switch (field) {
            case "image":
                setLocalImageUrl(newValues.src);
                setLocalAlt(newValues.alt || "");
                updated.imageUrl = newValues.src;
                updated.alt = newValues.alt;
                break;
            case "category":
                setLocalCategory(newValues.text);
                updated.category = newValues.text;
                break;
            case "title":
                setLocalTitle(newValues.html);
                updated.title = newValues.html;
                break;
            case "excerpt":
                setLocalExcerpt(newValues.html);
                updated.excerpt = newValues.html;
                break;
            case "date":
                setLocalDate(newValues.text);
                updated.date = newValues.text;
                break;
            case "link":
                setLocalLinkUrl(newValues.href);
                updated.linkUrl = newValues.href;
                break;
            default:
                return;
        }
        if (Object.keys(updated).length) onUpdate(id, updated);
    };

    // useEditable for each field (solo en modo admin agrega la clase editable)
    useEditable(
        imgRef,
        "image",
        () => ({ src: localImageUrl, alt: localAlt }),
        () => ({ presets: ["entertainment", "science", "politics", "health", "trending"] }),
        vals => handleSaveField("image", vals),
        { field: "image" }
    );
    useEditable(
        categoryRef,
        "text",
        () => ({ html: localCategory }),
        () => ({ label: "Categoría" }),
        vals => handleSaveField("category", vals),
        { field: "category" }
    );
    useEditable(
        titleRef,
        "text",
        () => ({ html: localTitle }),
        () => ({ label: "Título" }),
        vals => handleSaveField("title", vals),
        { field: "title" }
    );
    useEditable(
        excerptRef,
        "text",
        () => ({ html: localExcerpt }),
        () => ({ label: "Extracto" }),
        vals => handleSaveField("excerpt", vals),
        { field: "excerpt" }
    );
    useEditable(
        dateRef,
        "date",
        () => ({ text: localDate }),
        () => ({ label: "Fecha", quickDates: ["Ahora", "Ayer", "Hace 1 día", "Hace 2 días", "Hace 1 semana"] }),
        vals => handleSaveField("date", vals),
        { field: "date" }
    );
    useEditable(
        linkRef,
        "link",
        () => ({ href: localLinkUrl }),
        () => ({ label: "URL del artículo" }),
        vals => handleSaveField("link", vals),
        { field: "link" }
    );

    return (
        <div className="news-card">
            {isAdminMode && (
                <button className="delete-btn" onClick={() => onDelete(id)} aria-label="Eliminar noticia">
                    🗑
                </button>
            )}
            <div className="news-image" style={{ position: "relative" }}>
                <div ref={imgRef} className={isAdminMode ? "editable" : ""}>
                    <Link to={localLinkUrl} onClick={e => isAdminMode && e.preventDefault()}>
                        <img src={localImageUrl} alt={localAlt} />
                    </Link>
                </div>
                <span ref={categoryRef} className={isAdminMode ? "editable category" : "category"}>
                    {localCategory}
                </span>
            </div>
            <div className="news-content">
                <h4 ref={titleRef} className={isAdminMode ? "editable" : ""}>{localTitle}</h4>
                <p ref={excerptRef} className={isAdminMode ? "editable excerpt" : "excerpt"}>{localExcerpt}</p>
                <div className="article-meta">
                    <span ref={dateRef} className={isAdminMode ? "editable date" : "date"}>{localDate}</span>
                    <Link ref={linkRef} to={localLinkUrl} className={isAdminMode ? "editable read-more" : "read-more"} onClick={e => isAdminMode && e.preventDefault()}>
                        Leer más
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TrendingCard;