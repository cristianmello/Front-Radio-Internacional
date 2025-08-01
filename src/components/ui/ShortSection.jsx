// src/components/layout/public/home/ShortsSection.jsx
import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useSectionEdit } from "../../context/SectionEditContext";

const ShortsSection = ({ sectionTitle = "Shorts", data = [], }) => {

    const { canEdit, onAddItem, onRemove, onDeleteSection, onEdit } = useSectionEdit();

    return (
        <section className="shorts-section section-appear">
            <div className="section-header">
                <h2>{sectionTitle}</h2>

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
                <div className="shorts-container">
                    {data.map((item) => {
                        const {
                            short_code,
                            title,
                            thumbnail,
                            duration,
                            views,
                            url
                        } = item;

                        return (
                            <div className="short" key={short_code}>
                                <Link to={url} className="short-thumbnail">
                                    <img
                                        src={thumbnail || "/placeholder.jpg"}
                                        alt={item.title}
                                    />
                                    <div className="short-duration">{duration}</div>
                                    <div className="short-play-button" aria-hidden="true">
                                        <i className="fas fa-play"></i>
                                    </div>
                                </Link>
                                <div className="short-info">
                                    <h4>{title}</h4>
                                    <span className="short-views">{views}</span>
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
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="no-items-message">No hay shorts en esta sección.</p>
            )}
        </section>
    );
};

ShortsSection.propTypes = {
    sectionTitle: PropTypes.string,
    data: PropTypes.arrayOf(
        PropTypes.shape({
            short_code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            title: PropTypes.string,
            thumbnail: PropTypes.string,
            duration: PropTypes.string,
            views: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            url: PropTypes.string
        })
    ),

};

export default ShortsSection;



{/*
const ShortsSection = () => {
    return (
        <section className="shorts-section">
            <div className="section-header">
                <h2>Shorts</h2>
            </div>
            <div className="shorts-container">
                <div className="short">
                    <div className="short-thumbnail">
                        <img
                            src="https://source.unsplash.com/random/400x600/?news-event"
                            alt="Short 1"
                        />
                        <div className="short-duration">0:45</div>
                        <div className="short-play-button">
                            <i className="fas fa-play"></i>
                        </div>
                    </div>
                    <div className="short-info">
                        <h4>Manifestación pacífica reúne a miles en la capital</h4>
                        <span className="short-views">24K vistas</span>
                    </div>
                </div>

                <div className="short">
                    <div className="short-thumbnail">
                        <img
                            src="https://source.unsplash.com/random/400x600/?trending"
                            alt="Short 2"
                        />
                        <div className="short-duration">0:30</div>
                        <div className="short-play-button">
                            <i className="fas fa-play"></i>
                        </div>
                    </div>
                    <div className="short-info">
                        <h4>Inundaciones repentinas sorprenden a residentes</h4>
                        <span className="short-views">18K vistas</span>
                    </div>
                </div>

                <div className="short">
                    <div className="short-thumbnail">
                        <img
                            src="https://source.unsplash.com/random/400x600/?quick-news"
                            alt="Short 3"
                        />
                        <div className="short-duration">0:55</div>
                        <div className="short-play-button">
                            <i className="fas fa-play"></i>
                        </div>
                    </div>
                    <div className="short-info">
                        <h4>Robot asistente sorprende en feria tecnológica</h4>
                        <span className="short-views">42K vistas</span>
                    </div>
                </div>

                <div className="short">
                    <div className="short-thumbnail">
                        <img
                            src="https://source.unsplash.com/random/400x600/?viral"
                            alt="Short 4"
                        />
                        <div className="short-duration">0:25</div>
                        <div className="short-play-button">
                            <i className="fas fa-play"></i>
                        </div>
                    </div>
                    <div className="short-info">
                        <h4>Celebración inesperada tras victoria deportiva</h4>
                        <span className="short-views">31K vistas</span>
                    </div>
                </div>

                <div className="short">
                    <div className="short-thumbnail">
                        <img
                            src="https://source.unsplash.com/random/400x600/?moment"
                            alt="Short 5"
                        />
                        <div className="short-duration">0:40</div>
                        <div className="short-play-button">
                            <i className="fas fa-play"></i>
                        </div>
                    </div>
                    <div className="short-info">
                        <h4>Momento emotivo durante rescate de fauna silvestre</h4>
                        <span className="short-views">57K vistas</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ShortsSection;
*/}