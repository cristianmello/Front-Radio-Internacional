/*import React, { useEffect, useState } from "react";
import useSections from "../../../../hooks/useSections";
import LazySection from "./LazySection";
import NewsLayout from "./NewsLayout";
import useAuth from "../../../../hooks/UseAuth";

const HomePage = () => {
    const { auth, roles } = useAuth();
    const [category, setCategory] = useState("inicio");
    const { sections, loading, error, setSections } = useSections();

    const canManageSections =
        auth?.user_code &&
        roles.some(r => ["editor", "admin", "superadmin"].includes(r));

    useEffect(() => {
        const handler = e => setCategory(e.detail);
        document.addEventListener("categoryChange", handler);
        return () => document.removeEventListener("categoryChange", handler);
    }, []);

    const handleSectionDeleted = (deletedSlug) => {
        setSections(prevSections => prevSections.filter(s => s.section_slug !== deletedSlug));
    };

    if (loading) return <div>Cargando secciones…</div>;
    if (error) return <div>Error al cargar secciones: {error}</div>;

    // --- LÓGICA DE PREPARACIÓN DE DATOS (MÁS INTELIGENTE) ---

    // 1. Ordenamos las secciones por posición, como ya hacías.
    const sorted = [...sections].sort((a, b) => a.section_position - b.section_position);

    // 2. Definimos qué tipos de sección pertenecen al sidebar. ¡Este es tu nuevo panel de control!
    const sidebarWidgetTypes = ['sidebar', 'sideaudios', 'ad-small', 'ad-skyscraper', 'ad-verticalsm'];

    // 3. Encontramos la única sección de contenido principal.
    const mainContentSection = sorted.find(s => s.section_type === 'maincontent');

    // 4. Filtramos TODAS las secciones que son widgets para el sidebar.
    const sidebarWidgets = sorted.filter(s => sidebarWidgetTypes.includes(s.section_type));

    // --- FIN DE LA LÓGICA DE PREPARACIÓN ---

    return (
        <div className="container">
            {sorted.map(sec => {

                // Si la sección es el contenido principal, renderizamos el layout completo
                if (sec.section_type === 'maincontent') {
                    return (
                        <NewsLayout
                            key={sec.section_slug}
                            category={category}
                            mainSection={mainContentSection} // Pasamos el objeto de la sección principal
                            sidebarWidgets={sidebarWidgets} // Pasamos el ARRAY de widgets del sidebar
                            canEdit={canManageSections}
                            onSectionDeleted={handleSectionDeleted}
                        />
                    );
                }

                // Si la sección es un tipo de widget del sidebar, ya la hemos pasado a NewsLayout.
                // No la renderizamos aquí para no duplicarla.
                if (sidebarWidgetTypes.includes(sec.section_type)) {
                    return null;
                }

                // Para cualquier otro tipo de sección (ej: 'breaking', 'trending', 'ad-banner' de ancho completo),
                // la renderizamos como una sección independiente.
                return (
                    <LazySection
                        key={sec.section_slug}
                        section={sec}
                        categoryFilter={category}
                        onSectionDeleted={handleSectionDeleted}
                    />
                );
            })}
        </div>
    );
};

export default HomePage;
*/

// src/components/layout/public/home/HomePage.jsx
import React, { useEffect, useState } from "react";
import useSections from "../../../../hooks/useSections";
import LazySection from "./LazySection";
import SectionWrapper from "./SectionWrapper";
import useAuth from "../../../../hooks/UseAuth";

const HomePage = () => {
    const { auth, roles } = useAuth();
    const [category, setCategory] = useState("inicio");
    const { sections, loading, error, setSections } = useSections();

    const canManageSections =
        auth?.user_code &&
        roles.some(r => ["editor", "admin", "superadmin"].includes(r));

    useEffect(() => {
        const handler = e => setCategory(e.detail);
        document.addEventListener("categoryChange", handler);
        return () => document.removeEventListener("categoryChange", handler);
    }, []);

    const handleSectionDeleted = deletedSlug => {
        setSections(prev => prev.filter(s => s.section_slug !== deletedSlug));
    };

    if (loading) return <div>Cargando secciones…</div>;
    if (error) return <div>Error al cargar secciones: {error}</div>;

    // Ordenar por posición
    const sorted = [...sections].sort((a, b) => a.section_position - b.section_position);

    // Tipos sidebar
    const sidebarWidgetTypes = [
        "sidebar",
        "sideaudios",
        "ad-small",
        "ad-skyscraper",
        "ad-verticalsm",
    ];

    // Sección principal
    const mainContentSection = sorted.find(s => s.section_type === "maincontent");

    // Widgets de sidebar
    const sidebarWidgets = sorted.filter(s => sidebarWidgetTypes.includes(s.section_type));

    // Tipos de anuncios full-width (no lazy)
    const adFullTypes = [
        "ad-banner",
        "ad-large",
        "ad-skyscraper",
        "ad-biglarge",
        "ad-verticalsm",
    ];

    return (
        <div className="container">
            {sorted.map(sec => {
                // Main layout
                if (sec.section_type === "maincontent") {
                    return (
                        <NewsLayout
                            key={sec.section_slug}
                            category={category}
                            mainSection={mainContentSection}
                            sidebarWidgets={sidebarWidgets}
                            canEdit={canManageSections}
                            onSectionDeleted={handleSectionDeleted}
                        />
                    );
                }

                // Sidebar widgets están en NewsLayout
                if (sidebarWidgetTypes.includes(sec.section_type)) {
                    return null;
                }

                // Anuncios full-width => render directo
                if (adFullTypes.includes(sec.section_type)) {
                    return (
                        <SectionWrapper
                            key={sec.section_slug}
                            section={sec}
                            onSectionDeleted={handleSectionDeleted}
                        />
                    );
                }

                // Resto: lazy-load
                return (
                    <LazySection
                        key={sec.section_slug}
                        section={sec}
                        categoryFilter={category}
                        onSectionDeleted={handleSectionDeleted}
                    />
                );
            })}
        </div>
    );
};

export default HomePage;
