import React from "react";

const MainControls = () => {
  return (
    <section className="controls-section">
      <div className="control-panel">
        <div className="control-group">
          <span>Tamaño:</span>
          <button data-size="small">Pequeño</button>
          <button data-size="medium">Mediano</button>
          <button data-size="large">Grande</button>
          <button data-size="extralarge">Extra Grande</button>
        </div>
        <div className="control-group">
          <span>Orientación:</span>
          <button data-orientation="vertical">Vertical</button>
          <button data-orientation="horizontal">Horizontal</button>
        </div>
        <button id="confirm-action-btn" disabled>Deseleccionar Todo</button>
      </div>

      <div className="advanced-controls">
        <button id="add-news-btn">Añadir Noticia</button>
        <button id="add-section-btn">Añadir Contenedor</button>
      </div>
    </section>
  );
};

export default MainControls;
