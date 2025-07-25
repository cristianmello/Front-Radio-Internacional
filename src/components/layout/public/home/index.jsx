import React, { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import LazySection from "./LazySection";
import { useSidebar } from "../../../../context/SidebarContext";

const HomePage = () => {
    const sidebar = useSidebar();
    const [category, setCategory] = useState("inicio");
    const { sections, loading, error, refresh } = useOutletContext();

    const destacadosRef = useRef(null);

    useEffect(() => {
        // El listener para el cambio de categoría se mantiene
        const handleCategoryChange = e => setCategory(e.detail);
        document.addEventListener("categoryChange", handleCategoryChange);

        // 👇 2. AÑADIMOS UN NUEVO LISTENER PARA EL SCROLL
        const handleScrollRequest = e => {
            if (e.detail.targetId === "destacados" && destacadosRef.current) {
                // Hacemos un pequeño timeout para dar tiempo a que la página se renderice
                setTimeout(() => {
                    destacadosRef.current.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        };
        document.addEventListener("scrollToSection", handleScrollRequest);

        // Limpiamos ambos listeners al desmontar
        return () => {
            document.removeEventListener("categoryChange", handleCategoryChange);
            document.removeEventListener("scrollToSection", handleScrollRequest);
        };
    }, []);


    if (loading) return <div>Cargando secciones…</div>;
    if (error) return <div>Error al cargar secciones: {error}</div>;

    // Definimos qué tipos de widgets vamos a ignorar en esta página.
    const sidebarWidgetTypes = ['sidebar', 'sideaudios', 'ad-small', 'ad-skyscraper', 'ad-verticalsm'];

    // 1. Obtenemos todas las secciones que NO son para el sidebar.
    const allMainSections = sections
        .filter(sec => !sidebarWidgetTypes.includes(sec.section_type));

    // 2. Encontramos la sección especial de 'maincontent' y las demás.
    const mainContentSection = allMainSections.find(s => s.section_type === 'maincontent');
    const fullWidthSections = allMainSections
        .filter(s => s.section_type !== 'maincontent')
        .sort((a, b) => a.section_position - b.section_position);

    // 3. Dividimos las secciones de ancho completo en "antes" y "después" de la principal
    //    para respetar el orden que tienes en tu administrador.
    const sectionsBeforeMain = fullWidthSections.filter(s => s.section_position < (mainContentSection?.section_position || Infinity));
    const sectionsAfterMain = fullWidthSections.filter(s => s.section_position > (mainContentSection?.section_position || -Infinity));

    return (
        <div className="homepage-content">
            {/* Renderiza las secciones de ancho completo que van ANTES de la principal */}
            {category === 'inicio' && sectionsBeforeMain.map(sec => (
                <LazySection key={sec.section_slug} section={sec} categoryFilter={category} onSectionDeleted={refresh} />
            ))}

            {/* Si existe la sección principal, crea el layout de dos columnas */}
            {mainContentSection && (
                sidebar ? (
                    // OPCIÓN 1: Si SÍ hay un sidebar, creamos el layout de dos columnas.
                    <div className="home-main-layout">
                        <LazySection
                            section={mainContentSection}
                            categoryFilter={category}
                            onSectionDeleted={refresh}
                        />
                        {sidebar}
                    </div>
                ) : (
                    // OPCIÓN 2: Si NO hay sidebar, renderizamos la sección principal directamente.
                    // Ocupará el 100% del ancho por defecto.
                    <LazySection
                        section={mainContentSection}
                        categoryFilter={category}
                        onSectionDeleted={refresh}
                    />
                )
            )}

            {category === 'inicio' && sectionsAfterMain.map(sec => (
                <LazySection key={sec.section_slug} section={sec} categoryFilter={category} onSectionDeleted={refresh} />
            ))}
        </div>
    );
};

export default HomePage;



/* Funciona antes de hacer los cambios /api/page/home
import React, { useEffect, useRef, useState } from "react";
import useSections from "../../../../hooks/useSections";
import LazySection from "./LazySection";
import NewsLayout from "./NewsLayout";
import useAuth from "../../../../hooks/UseAuth";
import { useOutletContext } from "react-router-dom";
import { useSidebar } from "../../../../context/SidebarContext";

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

