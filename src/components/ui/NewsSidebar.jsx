// src/components/layout/public/home/NewsSidebar.jsx
import React from "react";
import PropTypes from 'prop-types';
import SidebarWidget from "./SidebarWidget";

/**
 * Componente de presentación puro que sirve como el contenedor principal 
 * para todos los widgets del sidebar.
 * @param {Array} data - Array de secciones a renderizar en el sidebar.
 * @param {Function} onSectionDeleted - Callback para refrescar al borrar.
 * @param {boolean} canEditGlobal - Flag para modo edición global.
 */
const NewsSidebar = ({
    sectionTitle = "Widgets",
    categories,
    data = [],
    onSectionDeleted,
    canEditGlobal
}) => {
    if (!data.length) return null;

    return (
        <aside className="sidebar">
            {data.map(section => (
                <SidebarWidget
                    key={section.section_slug}
                    section={section}
                    onSectionDeleted={onSectionDeleted}
                    canEditGlobal={canEditGlobal}
                    categories={categories}
                />
            ))}
        </aside>
    );
};

NewsSidebar.propTypes = {
    sectionTitle: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.object),
    onSectionDeleted: PropTypes.func,
    canEditGlobal: PropTypes.bool,
    categories: PropTypes.arrayOf(PropTypes.object)
};

export default NewsSidebar;