// src/components/layout/private/content/AdminHomePage.jsx
import React, {
    useState,
    useEffect,
    useCallback,
    useRef,
    useMemo,
} from "react";
import confetti from "canvas-confetti";
import { createSectionObject } from "../../../../helpers/Global";
import AdminControls from "./AdminControls";
import CategoryFilter from "./CategoryFilter";
import SectionsAdminList from "./SectionsAdminList";
import ArticlesAdminList from "./ArticlesAdminList";
import "../../../../assets/css/style.css";

const AdminHomePage = () => {
    // 1. Estado de todas las secciones (cada una tiene { id, name, news: [ ... ], backgroundColor, titleFontFamily, titleColor, articleTextColor })
    const [sections, setSections] = useState([]);
    // 2. Sección activa (su id)
    const [activeSectionId, setActiveSectionId] = useState(null);
    // 3. Filtro de categoría
    const [currentFilter, setCurrentFilter] = useState("all");
    // 4. Tarjetas seleccionadas por sección: { [sectionId]: [newsId, ...] }
    const [selectedCardIdsPerSection, setSelectedCardIdsPerSection] = useState({});

    // 5. Refs para exponer modales desde ArticlesAdminList
    const addModalRef = useRef(null);
    const editModalRef = useRef(null);

    // 6. Carga inicial (mock). Reemplaza por fetch a tu API cuando quieras.
    useEffect(() => {
        const initialNewsItems = [
            {
                id: "1",
                title: "Avance tecnológico en comunicación satelital",
                category: "Tecnología",
                summary:
                    "Nuevos satélites prometen revolucionar la conexión a internet global.",
                imageUrl: "news_image_1.png",
                link: "#",
                size: "small",
                orientation: "vertical",
            },
            {
                id: "2",
                title: "Cumbre económica mundial busca soluciones",
                category: "Economía",
                summary:
                    "Líderes globales se reúnen para discutir la inflación y el crecimiento.",
                imageUrl: "news_image_2.png",
                link: "#",
                size: "small",
                orientation: "vertical",
            },
            {
                id: "3",
                title: "Descubren nueva especie marina en el Pacífico",
                category: "Ciencia",
                summary:
                    "Una expedición científica revela una criatura bioluminiscente nunca antes vista.",
                imageUrl: "news_image_3.png",
                link: "#",
                size: "small",
                orientation: "vertical",
            },
            // … (puedes agregar el resto de items que quieras)
        ];

        // Creamos la primera sección con esas noticias iniciales
        const primeraSeccion = createSectionObject(
            "Noticias Principales",
            initialNewsItems
        );
        setSections([primeraSeccion]);
        setActiveSectionId(primeraSeccion.id);
    }, []);

    // 7. HANDLE PARA FILTRAR CATEGORÍA (remplaza handleCategoryFilterClick)
    const handleFilterChange = useCallback((categoria) => {
        setCurrentFilter(categoria);
        // Al cambiar de categoría, despejamos cualquier selección de tarjetas
        setSelectedCardIdsPerSection({});
    }, []);

    // 8. Cálculo de todas las categorías únicas (reemplaza populateCategories)
    const availableCategories = useMemo(() => {
        const allCats = new Set();
        sections.forEach((s) =>
            s.news.forEach((n) => {
                if (n.category) allCats.add(n.category);
            })
        );
        return Array.from(allCats).sort();
    }, [sections]);

    // 9. CALLBACKS PARA ADMINCONTROLS (reemplazan handleApplySize, handleApplyOrientation, handleConfirmAction)
    const handleSizeChange = (newSize) => {
        // Aplica newSize a todas las noticias seleccionadas en la sección activa
        setSections((prev) =>
            prev.map((s) => {
                if (s.id !== activeSectionId) return s;
                const updatedNews = s.news.map((n) => {
                    if (
                        selectedCardIdsPerSection[activeSectionId] &&
                        selectedCardIdsPerSection[activeSectionId].includes(n.id)
                    ) {
                        // Modificamos tamaño y, si es 'extralarge', forzamos orientation a null
                        const updated = { ...n, size: newSize };
                        if (newSize === "extralarge") {
                            updated.orientation = null;
                        } else {
                            // si venía extralarge, le ponemos vertical por defecto
                            if (!updated.orientation) updated.orientation = "vertical";
                        }
                        return updated;
                    }
                    return n;
                });
                return { ...s, news: updatedNews };
            })
        );
        // Una vez cambiados los tamaños, podemos deseleccionar todo
        setSelectedCardIdsPerSection((prev) => ({
            ...prev,
            [activeSectionId]: [],
        }));
    };

    const handleOrientationChange = (newOrientation) => {
        // Aplica newOrientation a todas las noticias seleccionadas (que no sean extralarge)
        setSections((prev) =>
            prev.map((s) => {
                if (s.id !== activeSectionId) return s;
                const updatedNews = s.news.map((n) => {
                    if (
                        selectedCardIdsPerSection[activeSectionId] &&
                        selectedCardIdsPerSection[activeSectionId].includes(n.id) &&
                        n.size !== "extralarge"
                    ) {
                        return { ...n, orientation: newOrientation };
                    }
                    return n;
                });
                return { ...s, news: updatedNews };
            })
        );
    };

    const handleDeselectAll = () => {
        setSelectedCardIdsPerSection({});
    };

    const handleConfirmAction = () => {
        // (aquí disparás confetti si quieres, como en el script original)
        if (
            selectedCardIdsPerSection[activeSectionId] &&
            selectedCardIdsPerSection[activeSectionId].length > 0
        ) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#D81921", "#FFFFFF", "#333333", "#FADEE0"],
            });
        }
        // luego deseleccionás todo
        setSelectedCardIdsPerSection({});
    };

    const handleAddSection = () => {
        const newName = `Nueva Sección ${sections.length + 1}`;
        const nueva = createSectionObject(newName);
        setSections((prev) => [...prev, nueva]);
        setActiveSectionId(nueva.id);
    };

    const handleAddNewsButton = () => {
        // Abre el modal de “Añadir noticia” que está en ArticlesAdminList
        if (addModalRef.current) {
            addModalRef.current.openAddModal();
        }
    };

    // 10. CALLBACKS PARA SECCIONES (reemplazan handleSetActiveSection, handleDeleteSection, handleUpdateSectionName, handleUpdateSectionStyle)
    const handleSetActiveSection = (sectionId) => {
        setActiveSectionId(sectionId);
        // Al cambiar de sección, limpia cualquier selección previa
        setSelectedCardIdsPerSection({});
    };

    const handleDeleteSection = (sectionIdToDelete) => {
        if (sections.length <= 1) {
            alert("No podés eliminar la última sección.");
            return;
        }
        const nombre = sections.find((s) => s.id === sectionIdToDelete)?.name;
        if (!window.confirm(`¿Eliminar la sección "${nombre}" y todas sus noticias?`)) {
            return;
        }
        setSections((prev) => prev.filter((s) => s.id !== sectionIdToDelete));
        setSelectedCardIdsPerSection((prev) => {
            const copy = { ...prev };
            delete copy[sectionIdToDelete];
            return copy;
        });
        if (activeSectionId === sectionIdToDelete) {
            const restantes = sections.filter((s) => s.id !== sectionIdToDelete);
            setActiveSectionId(restantes[0].id);
        }
    };

    const handleUpdateSectionName = (sectionId, newName) => {
        setSections((prev) =>
            prev.map((s) =>
                s.id === sectionId
                    ? {
                        ...s,
                        name: newName,
                    }
                    : s
            )
        );
    };

    const handleUpdateSectionStyle = (sectionId, changes) => {
        setSections((prev) =>
            prev.map((s) =>
                s.id === sectionId
                    ? {
                        ...s,
                        ...changes,
                    }
                    : s
            )
        );
    };

    // 11. CALLBACKS PARA NOTICIAS (reemplazan handleSelectCard, handleDeleteNews, handleEditNews, handleCreateNews)
    const handleSelectCard = (sectionId, newsId) => {
        setSelectedCardIdsPerSection((prev) => {
            const prevArr = prev[sectionId] || [];
            const isAlready = prevArr.includes(newsId);
            const newArr = isAlready
                ? prevArr.filter((id) => id !== newsId)
                : [...prevArr, newsId];
            return {
                ...prev,
                [sectionId]: newArr,
            };
        });
    };

    const handleDeleteNews = (sectionId, newsId) => {
        const section = sections.find((s) => s.id === sectionId);
        if (!section) return;
        const noticia = section.news.find((n) => n.id === newsId);
        if (!noticia) return;
        if (!window.confirm(`¿Eliminar la noticia "${noticia.title}"?`)) return;

        setSections((prev) =>
            prev.map((s) =>
                s.id === sectionId
                    ? { ...s, news: s.news.filter((n) => n.id !== newsId) }
                    : s
            )
        );
        setSelectedCardIdsPerSection((prev) => {
            const copy = { ...prev };
            copy[sectionId] = (copy[sectionId] || []).filter((id) => id !== newsId);
            return copy;
        });
        alert(`Noticia "${noticia.title}" eliminada.`);
    };

    const handleEditNews = (updatedNews) => {
        // updatedNews = { sectionId, newsId, title, summary, category, imageUrl, link, size, orientation }
        setSections((prev) =>
            prev.map((s) => {
                if (s.id !== updatedNews.sectionId) return s;
                return {
                    ...s,
                    news: s.news.map((n) =>
                        n.id === updatedNews.newsId ? { ...n, ...updatedNews } : n
                    ),
                };
            })
        );
        // Cada vez que se edita, si cambió categoría relevante, podemos alertar:
        alert(`Noticia "${updatedNews.title}" actualizada.`);
    };

    const handleCreateNews = (newNews) => {
        // newNews = { sectionId, title, summary, category, imageUrl, link, size, orientation }
        // Generamos un id único para la noticia:
        const id = `news-${new Date().getTime()}`;
        setSections((prev) =>
            prev.map((s) =>
                s.id === newNews.sectionId
                    ? {
                        ...s,
                        news: [
                            ...s.news,
                            {
                                ...newNews,
                                id,
                            },
                        ],
                    }
                    : s
            )
        );
        // Disparamos confetti al crear la noticia:
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#D81921", "#FFFFFF", "#333333", "#FADEE0"],
        });
        alert(`Noticia "${newNews.title}" añadida a la sección.`);
    };

    // 12. CALLBACK PARA REORDENAR DENTRO DE UNA SECCIÓN (reemplaza initSortableForSection → onEnd)
    const handleReorderNewsWithinSection = (sectionId, oldIndex, newIndex) => {
        setSections((prev) =>
            prev.map((s) => {
                if (s.id !== sectionId) return s;
                const arr = [...s.news];
                const [moved] = arr.splice(oldIndex, 1);
                arr.splice(newIndex, 0, moved);
                return { ...s, news: arr };
            })
        );
    };

    // 13. Cálculo: noticias filtradas para la sección activa → se lo pasamos a SectionsAdminList
    const filteredSections = useMemo(() => {
        return sections.map((s) => {
            if (s.id !== activeSectionId) return s;
            const filteredNews =
                currentFilter === "all"
                    ? s.news
                    : s.news.filter((n) => n.category === currentFilter);
            return { ...s, news: filteredNews };
        });
    }, [sections, activeSectionId, currentFilter]);

    return (
        <div className="admin-home-page">
            {/* 1. Controles generales (tamaño, orientación, deselect, añadir noticia/sección) */}
            <AdminControls
                onSizeChange={handleSizeChange}
                onOrientationChange={handleOrientationChange}
                onDeselectAll={handleConfirmAction}
                onAddSection={handleAddSection}
                onAddNews={handleAddNewsButton}
                disableDeselectAll={
                    !(selectedCardIdsPerSection[activeSectionId] || []).length > 0
                }
            />

            {/* 2. Filtro de categorías */}
            <CategoryFilter
                categories={availableCategories}
                currentFilter={currentFilter}
                onFilterChange={handleFilterChange}
            />

            {/* 3. Lista de secciones con sus noticias (filtradas) */}
            <SectionsAdminList
                sections={filteredSections}
                activeSectionId={activeSectionId}
                currentFilter={currentFilter}
                selectedCardIdsPerSection={selectedCardIdsPerSection}
                onSetActiveSection={handleSetActiveSection}
                onDeleteSection={handleDeleteSection}
                onUpdateSectionName={handleUpdateSectionName}
                onUpdateSectionStyle={handleUpdateSectionStyle}
                onSelectCard={handleSelectCard}
                onEditCard={(sectionId, newsItem) => {
                    if (editModalRef.current) {
                        editModalRef.current.openEditModal(newsItem);
                    }
                }}
                onDeleteCard={handleDeleteNews}
                onReorderNewsWithinSection={handleReorderNewsWithinSection}
            />

            {/* 4. Modales de “Añadir” y “Editar” noticias */}
            <ArticlesAdminList
                ref={addModalRef}
                onCreateArticle={handleCreateNews}
                onUpdateArticle={handleEditNews}
                activeSectionId={activeSectionId}
            />
        </div>
    );
};

export default AdminHomePage;
