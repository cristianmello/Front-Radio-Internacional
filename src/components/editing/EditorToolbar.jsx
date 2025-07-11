// src/components/editing/EditorToolbar.jsx
import React from "react";

const EditorToolbar = ({
    onSave, onDiscard, onAddSection
}) => (
    <div className="edit-toolbar" id="editToolbar">
        <div className="toolbar-title">Herramientas de Edición</div>
        <div className="edit-actions">
            <button onClick={onSave} id="saveChangesBtn">Guardar Cambios</button>
            <button onClick={onDiscard} id="discardChangesBtn">Descartar Cambios</button>
            <button onClick={onAddSection} id="addSectionBtn">Añadir Sección</button>
        </div>
    </div>
);

export default EditorToolbar;