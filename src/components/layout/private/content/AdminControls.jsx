// src/components/layout/private/content/AdminControls.jsx
import React from "react";

const AdminControls = ({
  onSizeChange,
  onOrientationChange,
  onDeselectAll,
  onAddSection,
  onAddNews,
  disableDeselectAll = true,
}) => {
  return (
    <section className="controls-section">
      <div className="control-group">
        <span>Tamaño:</span>
        <button onClick={() => onSizeChange("small")}>Pequeño</button>
        <button onClick={() => onSizeChange("medium")}>Mediano</button>
        <button onClick={() => onSizeChange("large")}>Grande</button>
        <button onClick={() => onSizeChange("extralarge")}>Extra Grande</button>
      </div>
      <div className="control-group">
        <span>Orientación:</span>
        <button onClick={() => onOrientationChange("vertical")}>Vertical</button>
        <button onClick={() => onOrientationChange("horizontal")}>Horizontal</button>
      </div>
      <button
        id="confirm-action-btn"
        disabled={disableDeselectAll}
        onClick={onDeselectAll}
      >
        Deseleccionar Todo
      </button>
      <button id="add-news-btn" onClick={onAddNews}>
        Añadir Noticia
      </button>
      <button id="add-section-btn" onClick={onAddSection}>
        Añadir Sección
      </button>
    </section>
  );
};

export default AdminControls;




/*import React from "react";
import MainControls from "./MainControls";
import useAuth from "../../../../hooks/UseAuth";

const AdminControls = () => {
  const { roles } = useAuth();
  const isAdmin = roles.includes("admin") || roles.includes("superadmin");

  if (!isAdmin) return null;

  return (
    <main>
      <MainControls />
    </main>
  );
};

export default AdminControls;
*/