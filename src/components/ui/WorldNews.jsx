// src/components/layout/public/home/WorldNews.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import { useSectionEdit } from "../../context/SectionEditContext";

const CONTINENTS = [
  { key: "europa", label: "Europa" },
  { key: "norteamerica", label: "Norteamérica" },
  { key: "asia", label: "Asia" },
  { key: "africa", label: "África" },
  { key: "sudamerica", label: "Sudamérica" },
  { key: "oceania", label: "Oceanía" },
];

const WorldNews = ({ sectionTitle = "Noticias del Mundo", data = {} }) => {

  const [activeContinent, setActiveContinent] = useState(CONTINENTS[0].key);
  const items = Array.isArray(data[activeContinent]) ? data[activeContinent] : [];

  const { canEdit, onAddItem, onRemove, onDeleteSection } = useSectionEdit();

  const noTitle = !sectionTitle;

  return (
    <section className="world-news section-appear">
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

      {/* Mapa interactivo */}
      <div className="world-map-news">
        <div className="world-map">
          {CONTINENTS.map(({ key, label }) => (
            <div
              key={key}
              className={`news-marker ${key} ${activeContinent === key ? "active" : ""}`}
              data-continent={key}
              onClick={() => setActiveContinent(key)}
            >
              <div className="marker-dot" />
              <div className="marker-pulse" />
              <div className="marker-preview">
                <h5>{label}</h5>
                <p>{data[key]?.[0]?.excerpt || "Sin noticias aún"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pestañas de continentes */}
      <div className="continent-tabs">
        {CONTINENTS.map(({ key, label }) => (
          <button
            key={key}
            className={`continent-tab${activeContinent === key ? " active" : ""}`}
            onClick={() => setActiveContinent(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Contenido del continente seleccionado */}
      <div className="continent-content" id={`${activeContinent}-news`}>
        <div className="continent-news-grid">
          {items.length > 0 ? (
            items.map((item) => (
              <div className="continent-news-item" key={item.article_code}>
                <img
                  src={item.image || "/placeholder.jpg"}
                  alt={item.title}
                />
                <h5>{item.title}</h5>
                <p className="excerpt">{item.excerpt}</p>
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
            ))
          ) : (
            <p className="no-items-message">
              No hay noticias disponibles para {CONTINENTS.find(c => c.key === activeContinent).label}.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

WorldNews.propTypes = {
  sectionTitle: PropTypes.string,
  data: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        article_code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        image: PropTypes.string,
        title: PropTypes.string,
        excerpt: PropTypes.string,
      })
    )
  ),
};

export default WorldNews;



{/*
const WorldNews = () => {
  // Estado para la pestaña activa ("europa", "norteamerica", etc.)
  const [activeContinent, setActiveContinent] = useState("europa");

  // Datos estáticos de ejemplo; puedes reemplazarlos por props o datos cargados
  const continentData = {
    europa: [
      {
        img: "https://source.unsplash.com/random/300x200/?europe",
        title:
          "Acuerdo climático europeo entra en nueva fase de implementación",
        excerpt:
          "Las naciones europeas refuerzan sus compromisos para reducir emisiones antes de 2030.",
      },
      {
        img: "https://source.unsplash.com/random/300x200/?europe-politics",
        title:
          "Tensiones comerciales amenazan estabilidad del mercado común",
        excerpt:
          "Negociaciones maratónicas buscan resolver disputas entre estados miembros.",
      },
      {
        img: "https://source.unsplash.com/random/300x200/?europe-culture",
        title:
          "Festival cultural transfronterizo celebra diversidad regional",
        excerpt:
          "Artistas de toda Europa participan en iniciativa para fortalecer lazos culturales.",
      },
    ],
    norteamerica: [],
    asia: [],
    africa: [],
    sudamerica: [],
    oceania: [],
  };

  return (
    <section className="world-news">
      <div className="section-header">
        <h2>Noticias del Mundo</h2>
      </div>

      <div className="world-map-news">
        <div className="world-map">
          <div
            className="news-marker europe"
            data-continent="europa"
            onClick={() => setActiveContinent("europa")}
          >
            <div className="marker-dot"></div>
            <div className="marker-pulse"></div>
            <div className="marker-preview">
              <h5>Europa</h5>
              <p>Crisis energética afecta a múltiples países</p>
            </div>
          </div>

          <div
            className="news-marker northamerica"
            data-continent="norteamerica"
            onClick={() => setActiveContinent("norteamerica")}
          >
            <div className="marker-dot"></div>
            <div className="marker-pulse"></div>
            <div className="marker-preview">
              <h5>Norteamérica</h5>
              <p>Avances en política ambiental generan esperanza</p>
            </div>
          </div>

          <div
            className="news-marker asia"
            data-continent="asia"
            onClick={() => setActiveContinent("asia")}
          >
            <div className="marker-dot"></div>
            <div className="marker-pulse"></div>
            <div className="marker-preview">
              <h5>Asia</h5>
              <p>Crecimiento económico supera las expectativas</p>
            </div>
          </div>

          <div
            className="news-marker africa"
            data-continent="africa"
            onClick={() => setActiveContinent("africa")}
          >
            <div className="marker-dot"></div>
            <div className="marker-pulse"></div>
            <div className="marker-preview">
              <h5>África</h5>
              <p>Innovaciones en agricultura transforman comunidades</p>
            </div>
          </div>

          <div
            className="news-marker southamerica"
            data-continent="sudamerica"
            onClick={() => setActiveContinent("sudamerica")}
          >
            <div className="marker-dot"></div>
            <div className="marker-pulse"></div>
            <div className="marker-preview">
              <h5>Sudamérica</h5>
              <p>Acuerdo comercial histórico entre naciones vecinas</p>
            </div>
          </div>

          <div
            className="news-marker oceania"
            data-continent="oceania"
            onClick={() => setActiveContinent("oceania")}
          >
            <div className="marker-dot"></div>
            <div className="marker-pulse"></div>
            <div className="marker-preview">
              <h5>Oceanía</h5>
              <p>Medidas pioneras contra el cambio climático</p>
            </div>
          </div>
        </div>
      </div>

      <div className="continent-tabs">
        {["europa", "norteamerica", "asia", "africa", "sudamerica", "oceania"].map(
          (continent) => (
            <button
              key={continent}
              className={`continent-tab ${
                activeContinent === continent ? "active" : ""
              }`}
              onClick={() => setActiveContinent(continent)}
            >
              {(() => {
                switch (continent) {
                  case "europa":
                    return "Europa";
                  case "norteamerica":
                    return "Norteamérica";
                  case "asia":
                    return "Asia";
                  case "africa":
                    return "África";
                  case "sudamerica":
                    return "Sudamérica";
                  case "oceania":
                    return "Oceanía";
                  default:
                    return "";
                }
              })()}
            </button>
          )
        )}
      </div>

      <div className="continent-content active" id={`${activeContinent}-news`}>
        <div className="continent-news-grid">
          {continentData[activeContinent].length > 0 ? (
            continentData[activeContinent].map((item, idx) => (
              <div className="continent-news-item" key={idx}>
                <img src={item.img} alt={item.title} />
                <h5>{item.title}</h5>
                <p className="excerpt">{item.excerpt}</p>
              </div>
            ))
          ) : (
            <p>No hay noticias disponibles para este continente.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default WorldNews;
*/}