// src/components/layout/private/content/NewsCard.jsx
import React from "react";

const NewsCard = ({
    newsItem,
    sectionId,
    articleTextColor,
    isSelected,
    onSelectCard,
    onEditCard,
    onDeleteCard,
}) => {
    // Construir clases según tamaño y orientación:
    const sizeClass = `card-${newsItem.size || "small"}`;
    const orientationClass =
        newsItem.size !== "extralarge"
            ? `card-${newsItem.orientation || "vertical"}`
            : "";
    const overlayClass =
        ["large", "extralarge"].includes(newsItem.size) ? "overlay-card" : "";

    return (
        <article
            className={`news-card ${sizeClass} ${orientationClass} ${overlayClass} ${isSelected ? "card-selected" : ""
                }`}
            data-news-id={newsItem.id}
            onClick={() => onSelectCard(sectionId, newsItem.id)}
        >
            <div className="news-card-image">
                <img
                    src={newsItem.imageUrl}
                    alt={newsItem.title}
                    loading="lazy"
                />
            </div>
            <div className="news-card-content">
                <span className="category">{newsItem.category}</span>
                <h3
                    style={
                        overlayClass
                            ? {}
                            : { color: articleTextColor || "inherit" }
                    }
                >
                    {newsItem.title}
                </h3>
                <p
                    style={
                        overlayClass
                            ? {}
                            : { color: articleTextColor || "inherit" }
                    }
                >
                    {newsItem.summary}
                </p>
                <div className="news-card-footer">
                    <a
                        href={newsItem.link || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Leer más
                    </a>
                    <div className="footer-buttons">
                        <button
                            className="edit-news-btn"
                            title="Editar Noticia"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditCard(sectionId, newsItem);
                            }}
                        >
                            ✏️
                        </button>
                        <button
                            className="delete-news-btn"
                            title="Eliminar Noticia"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteCard(sectionId, newsItem.id);
                            }}
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default NewsCard;
