// src/components/layout/private/content/SectionsAdminList.jsx
import React from "react";
import Section from "./Section";

const SectionsAdminList = ({
    sections,
    activeSectionId,
    currentFilter,
    selectedCardIdsPerSection,
    onSetActiveSection,
    onDeleteSection,
    onUpdateSectionName,
    onUpdateSectionStyle,
    onSelectCard,
    onEditCard,
    onDeleteCard,
    onReorderNewsWithinSection,
}) => {
    if (sections.length === 0) {
        return (
            <div
                id="sections-display-area"
                className="sections-sortable-area"
                style={{ textAlign: "center", color: "#777" }}
            >
                No hay secciones. ¡Añade una para empezar!
            </div>
        );
    }

    return (
        <div id="sections-display-area" className="sections-sortable-area">
            {sections.map((sec) => (
                <Section
                    key={sec.id}
                    section={sec}
                    isActive={sec.id === activeSectionId}
                    currentFilter={currentFilter}
                    selectedCardIds={selectedCardIdsPerSection[sec.id] || []}
                    onSetActiveSection={onSetActiveSection}
                    onDeleteSection={onDeleteSection}
                    onUpdateSectionName={onUpdateSectionName}
                    onUpdateSectionStyle={onUpdateSectionStyle}
                    onSelectCard={onSelectCard}
                    onEditCard={onEditCard}
                    onDeleteCard={onDeleteCard}
                    onReorderNewsWithinSection={onReorderNewsWithinSection}
                />
            ))}
        </div>
    );
};

export default SectionsAdminList;
