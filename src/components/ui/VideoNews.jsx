// src/components/layout/public/home/VideoNews.jsx
import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useSectionEdit } from "../../context/SectionEditContext";

const VideoNews = ({ sectionTitle = "En Video", data = [] }) => {
    const { canEdit, onAddItem, onRemove, onDeleteSection } = useSectionEdit();

    const noTitle = !sectionTitle;

    return (
        <section className="video-news section-appear">
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
                <div className="video-grid">
                    {data.map((item, idx) => {
                        const {
                            article_code,
                            title,
                            thumbnail,
                            category,
                            duration,
                            url
                        } = item;

                        const cardClasses =
                            idx === 0 ? "video-card main-video" : "video-card";

                        return (
                            <div className={cardClasses} key={article_code}>
                                <Link to={url} className="video-thumbnail">
                                    <img
                                        src={thumbnail || "/placeholder.jpg"}
                                        alt={category}
                                    />
                                    <div className="play-button" aria-hidden="true">
                                        <i className="fas fa-play"></i>
                                    </div>
                                </Link>
                                <div className="video-info">
                                    <span className="category">{category}</span>
                                    <h4>{title}</h4>
                                    <span className="duration">{duration}</span>
                                </div>
                                {canEdit && onRemove && (
                                    <button
                                        className="delete-item-btn"
                                        title="Eliminar elemento"
                                        onClick={() => onRemove(article_code)}
                                    >
                                        <i className="fa-solid fa-trash" />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="no-items-message">No hay vídeos en esta sección.</p>
            )}
        </section>
    );
};

VideoNews.propTypes = {
    sectionTitle: PropTypes.string,
    data: PropTypes.arrayOf(
        PropTypes.shape({
            article_code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            thumbnail: PropTypes.string,
            category: PropTypes.string,
            title: PropTypes.string,
            duration: PropTypes.string,
            url: PropTypes.string
        })
    ),
};

export default VideoNews;


{/*
const VideoNews = () => {

    // Ajusta la altura de las tarjetas según ancho de pantalla
    const adjustVideoLayout = () => {
        if (window.innerWidth <= 768) {
            document.querySelectorAll(".video-card:not(.main-video)").forEach(card => {
                card.style.height = "auto";
            });
        } else {
            document.querySelectorAll(".video-card").forEach(card => {
                card.style.height = "";
            });
        }
    };

    useEffect(() => {
        // Al montar y cada resize
        adjustVideoLayout();
        window.addEventListener("resize", adjustVideoLayout);
        return () => window.removeEventListener("resize", adjustVideoLayout);
    }, []);

    return (
        <section className="video-news">
            <div className="section-header">
                <h2>En Video</h2>
            </div>
            <div className="video-grid">
                <div className="video-card main-video">
                    <div className="video-thumbnail">
                        <img
                            src="https://source.unsplash.com/random/800x450/?conference"
                            alt="Conferencia"
                        />
                        <div className="play-button">
                            <i className="fas fa-play"></i>
                        </div>
                    </div>
                    <div className="video-info">
                        <span className="category">Internacional</span>
                        <h4>Cumbre mundial aborda crisis climática con nuevos compromisos</h4>
                        <span className="duration">15:42</span>
                    </div>
                </div>

                <div className="video-card">
                    <div className="video-thumbnail">
                        <img
                            src="https://source.unsplash.com/random/400x225/?interview"
                            alt="Entrevista"
                        />
                        <div className="play-button">
                            <i className="fas fa-play"></i>
                        </div>
                    </div>
                    <div className="video-info">
                        <span className="category">Cultura</span>
                        <h4>Entrevista exclusiva con el autor del bestseller del año</h4>
                        <span className="duration">8:27</span>
                    </div>
                </div>

                <div className="video-card">
                    <div className="video-thumbnail">
                        <img
                            src="https://source.unsplash.com/random/400x225/?documentary"
                            alt="Documental"
                        />
                        <div className="play-button">
                            <i className="fas fa-play"></i>
                        </div>
                    </div>
                    <div className="video-info">
                        <span className="category">Historia</span>
                        <h4>Documental revela hallazgos arqueológicos inéditos</h4>
                        <span className="duration">22:15</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VideoNews;
*/}