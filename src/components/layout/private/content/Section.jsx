// src/components/layout/private/content/Section.jsx
import React, { useState, useRef, useEffect } from "react";
import NewsCard from "./NewsCard";
import Sortable from "sortablejs";

const Section = ({
  section,
  isActive,
  currentFilter,
  onSetActiveSection,
  onDeleteSection,
  onUpdateSectionName,
  onUpdateSectionStyle,
  onSelectCard,
  onEditCard,
  onDeleteCard,
  onReorderNewsWithinSection,
  selectedCardIds = [],
}) => {
  const sectionRef = useRef(null);
  const settingsPanelRef = useRef(null);
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Inicializar SortableJS para el grid de noticias
  useEffect(() => {
    if (!sectionRef.current) return;

    // Si no es la sección activa o no hay noticias, no inicializamos sortable
    if (!isActive || section.news.length === 0) return;

    const sortableInstance = Sortable.create(sectionRef.current, {
      animation: 150,
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      forceFallback: true,
      filter: "a, .section-title", // no arrastrar al hacer clic en links o el título
      preventOnFilter: true,
      onEnd: (evt) => {
        const oldIndex = evt.oldDraggableIndex;
        const newIndex = evt.newDraggableIndex;
        if (oldIndex === newIndex) return;

        onReorderNewsWithinSection(section.id, oldIndex, newIndex);
      },
    });

    return () => {
      sortableInstance.destroy();
    };
  }, [isActive, section.news, onReorderNewsWithinSection, section.id]);

  // Mostrar/ocultar panel de settings
  const toggleSettings = () => setSettingsVisible((vis) => !vis);

  // Handlers para inputs de configuración (color y fuente)
  const handleBgColorChange = (e) => {
    onUpdateSectionStyle(section.id, { backgroundColor: e.target.value });
  };
  const handleFontFamilyChange = (e) => {
    onUpdateSectionStyle(section.id, { titleFontFamily: e.target.value });
  };
  const handleTitleColorChange = (e) => {
    onUpdateSectionStyle(section.id, { titleColor: e.target.value });
  };
  const handleArticleTextColorChange = (e) => {
    onUpdateSectionStyle(section.id, { articleTextColor: e.target.value });
  };

  // Filtrar noticias según currentFilter
  const newsToRender =
    currentFilter === "all"
      ? section.news
      : section.news.filter((item) => item.category === currentFilter);

  return (
    <div
      className={`news-section-wrapper ${isActive ? "active-section" : ""}`}
      data-section-id={section.id}
      style={{ backgroundColor: section.backgroundColor }}
    >
      {/* Header de la sección */}
      <div
        className="section-header"
        onClick={(e) => {
          // Evitar click si clickeó el botón eliminar o settings:
          if (
            e.target.closest(".section-settings-toggle-btn") ||
            e.target.closest(".delete-section-btn") ||
            e.target.closest("input") ||
            e.target.closest("select")
          ) {
            return;
          }
          onSetActiveSection(section.id);
        }}
      >
        <h3
          className="section-title"
          contentEditable
          suppressContentEditableWarning={true}
          style={{
            fontFamily: section.titleFontFamily,
            color: section.titleColor,
          }}
          onBlur={(e) => {
            // Cuando pierde foco, actualizamos el nombre
            const newName = e.target.textContent.trim();
            if (newName && newName !== section.name) {
              onUpdateSectionName(section.id, newName);
            }
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        >
          {section.name}
        </h3>
        <div className="section-header-controls">
          <button
            className="section-settings-toggle-btn"
            title="Personalizar Sección"
            onClick={(e) => {
              e.stopPropagation();
              toggleSettings();
            }}
          >
            ⚙️
          </button>
          <button
            className="delete-section-btn"
            title="Eliminar Sección"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteSection(section.id);
            }}
          >
            &times;
          </button>
        </div>
      </div>

      {/* Panel de settings (color, fuente, etc.) */}
      {settingsVisible && (
        <div
          className="section-settings-panel"
          ref={settingsPanelRef}
          style={{ display: "grid" }}
        >
          <div className="settings-group">
            <label>Color de Fondo:</label>
            <input
              type="color"
              value={section.backgroundColor}
              onChange={handleBgColorChange}
            />
          </div>
          <div className="settings-group">
            <label>Fuente del Título:</label>
            <select
              value={section.titleFontFamily}
              onChange={handleFontFamilyChange}
            >
              {/** Importa PREDEFINED_FONTS desde helpers/Global.jsx */}
              {section.PREDEFINED_FONTS?.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div className="settings-group">
            <label>Color del Título:</label>
            <input
              type="color"
              value={section.titleColor}
              onChange={handleTitleColorChange}
            />
          </div>
          <div className="settings-group">
            <label>Color Texto Artículos:</label>
            <input
              type="color"
              value={section.articleTextColor}
              onChange={handleArticleTextColorChange}
            />
          </div>
        </div>
      )}

      {/* Área de grid para las noticias */}
      <div
        className="news-grid-area"
        ref={sectionRef}
        style={{ opacity: newsToRender.length === 0 ? 0.5 : 1 }}
      >
        {newsToRender.length === 0 ? (
          <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#777" }}>
            {currentFilter === "all"
              ? "Esta sección no tiene noticias. ¡Añade algunas!"
              : `No hay noticias en la categoría "${currentFilter}" en esta sección.`}
          </p>
        ) : (
          newsToRender.map((newsItem) => (
            <NewsCard
              key={newsItem.id}
              sectionId={section.id}
              newsItem={newsItem}
              articleTextColor={section.articleTextColor}
              isSelected={selectedCardIds.includes(newsItem.id)}
              onSelectCard={onSelectCard}
              onEditCard={onEditCard}
              onDeleteCard={onDeleteCard}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Section;
