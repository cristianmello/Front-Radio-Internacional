// src/components/layout/public/home/VideoCard.jsx
import React, { useRef, useContext } from "react";
import PropTypes from "prop-types";
import { AdminModeContext } from "../PublicLayout";
import { useEditable } from "../../../../hooks/useEditable";

/**
 * Subcomponente VideoCard para VideoNews.
 * Props:
 *  - video: { id, thumb, title, duration, url, category }
 *  - isAdminMode: boolean
 *  - onPlay: función para reproducir
 *  - onDelete: función para eliminar
 *  - onUpdateField: función (id, updatedFields)
 */
const VideoCard = ({ video, isAdminMode, onPlay, onDelete, onUpdateField }) => {
    const { id, thumb, title, duration, url, category } = video;
    const { isAdminMode: globalAdmin } = useContext(AdminModeContext);
    const admin = isAdminMode;

    // Refs para editable
    const thumbRef = useRef();
    const titleRef = useRef();
    const durationRef = useRef();
    const urlRef = useRef();
    const categoryRef = useRef();

    // Construir URL de miniatura evitando caché
    const getThumbUrl = (key) =>
        key ? `https://source.unsplash.com/random/400x225/?${key}&${Date.now()}` : "";

    // Guardar cambios
    const handleSave = (field, newValues) => {
        const updated = {};
        switch (field) {
            case "thumbnail":
                updated.thumb = newValues.src;
                break;
            case "title":
                updated.title = newValues.html;
                break;
            case "duration":
                updated.duration = newValues.text;
                break;
            case "url":
                updated.url = newValues.href;
                break;
            case "category":
                updated.category = newValues.text;
                break;
            default:
                return;
        }
        onUpdateField(id, updated);
    };

    // Editable
    useEditable(
        thumbRef,
        "image",
        () => ({ src: getThumbUrl(thumb), alt: title }),
        () => ({ presets: ["conference", "interview", "documentary", "news", "video"] }),
        (vals) => handleSave("thumbnail", vals),
        { field: "thumbnail" }
    );
    useEditable(
        titleRef,
        "text",
        () => ({ html: title }),
        () => ({}),
        (vals) => handleSave("title", vals),
        { field: "title" }
    );
    useEditable(
        durationRef,
        "duration",
        () => ({ text: duration }),
        () => ({ label: "Duración:" }),
        (vals) => handleSave("duration", vals),
        { field: "duration" }
    );
    useEditable(
        urlRef,
        "link",
        () => ({ href: url }),
        () => ({ label: "URL del video" }),
        (vals) => handleSave("url", vals),
        { field: "url" }
    );
    useEditable(
        categoryRef,
        "category",
        () => ({ text: category }),
        () => ({ categories: ["Noticias", "Entrevistas", "Documentales", "Deportes", "Tecnología", "Salud"] }),
        (vals) => handleSave("category", vals),
        { field: "category" }
    );

    // Eventos de clic
    const handleThumbnailClick = (e) => {
        if (admin) {
            e.stopPropagation();
        } else {
            onPlay();
        }
    };
    const handleCardClick = () => {
        if (!admin) onPlay();
    };

    return (
        <div
            className={`video-card${admin ? " editable-container" : ""}`}
            onClick={handleCardClick}
            style={{ cursor: admin ? "default" : "pointer" }}
        >
            {admin && (
                <button
                    className="delete-item-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    aria-label="Eliminar video"
                >
                    <i className="fas fa-trash" />
                </button>
            )}

            <div className="video-thumbnail">
                <img
                    ref={thumbRef}
                    src={getThumbUrl(thumb)}
                    alt={title}
                    onClick={handleThumbnailClick}
                    className={admin ? "editable" : ""}
                />
                <div className="play-button">
                    <i className="fas fa-play" />
                </div>
            </div>

            <div className="video-info">
                <span
                    className="category"
                    ref={categoryRef}
                    style={{ cursor: admin ? "pointer" : "default" }}
                >
                    {category}
                </span>
                <h4
                    ref={titleRef}
                    className={admin ? "editable" : ""}
                    style={{ cursor: admin ? "pointer" : "default" }}
                >
                    {title}
                </h4>
                <span
                    className="duration"
                    ref={durationRef}
                    style={{ cursor: admin ? "pointer" : "default" }}
                >
                    {duration}
                </span>
                {/* Ref oculto para editar URL */}
                <span ref={urlRef} style={{ display: "none" }} />
            </div>
        </div>
    );
};

VideoCard.propTypes = {
    video: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        thumb: PropTypes.string,
        title: PropTypes.string,
        duration: PropTypes.string,
        url: PropTypes.string,
        category: PropTypes.string,
    }).isRequired,
    isAdminMode: PropTypes.bool,
    onPlay: PropTypes.func,
    onDelete: PropTypes.func,
    onUpdateField: PropTypes.func,
};

export default VideoCard;