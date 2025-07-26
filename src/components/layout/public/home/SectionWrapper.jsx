// src/components/layout/public/home/SectionWrapper.jsx
import React, { useState } from "react";
import Url from "../../../../helpers/Url";
import { useSectionActions } from "../../../../hooks/useSectionActions";

// Componentes y Modales
import BreakingNews from "./BreakingNews";
import TrendingNews from "./TrendingNews";
import NewsMain from './NewsMain';
import FeaturedNews from "./FeaturedNews";
import WorldNews from "./WorldNews";
import MosaicNews from "./MosaicNews";
import VideoNews from "./VideoNews";
import ShortsSection from "./ShortSection";
import AddArticleModal from "./AddArticleModal";
import AddShortsModal from "./AddShortsModal";
import EditArticleModal from "./EditArticleModal";
import AdBanner from "./AdBanner";
import AddAdvertisementModal from "./AddAdvertisementModal"
import EditAdvertisementModal from "./EditAdvertisementModal";

// Context y Hooks
import { useEditMode } from "../../../../context/EditModeContext";
import useAuth from "../../../../hooks/UseAuth";
import { SectionEditContext } from "../../../../context/SectionEditContext";
import useAdvertisement from "../../../../hooks/useAdvertisement";
import useArticleActions from "../../../../hooks/useArticleActions";

const componentMap = {
    breaking: BreakingNews,
    trending: TrendingNews,
    maincontent: NewsMain,
    featured: FeaturedNews,
    world: WorldNews,
    mosaic: MosaicNews,
    video: VideoNews,
    shorts: ShortsSection,
    'ad-large': AdBanner,
    'ad-small': AdBanner,
    'ad-banner': AdBanner,
    'ad-skyscraper': AdBanner,
    'ad-biglarge': AdBanner,
    'ad-verticalsm': AdBanner,
};

export default function SectionWrapper({ section, onSectionDeleted, categoryFilter }) {
    const editMode = useEditMode();
    const { auth, roles } = useAuth();

    const canEdit =
        auth?.user_code &&
        roles.some(r => ["editor", "admin", "superadmin"].includes(r)) &&
        editMode;

    const items = section.items || [];

    // 1. Obtenemos la función 'refresh' del hook y la renombramos para evitar colisiones.
    const { setItems, reorderItems, addItem, removeItem, deleteSection } =
        useSectionActions(section.section_slug, onSectionDeleted);

    const [adding, setAdding] = useState(false);

    const [editingArticle, setEditingArticle] = useState(null);
    const [editingAdvertisement, setEditingAdvertisement] = useState(null);

    const { editArticle } = useArticleActions();
    const adHook = useAdvertisement(editingAdvertisement?.ad_id);

    const handleSelectAdvertisement = async (code) => {
        try {
            const result = await addItem(code);
            if (!result.success) {
                return { success: false, message: result.message };
            }
            setAdding(false);
            return { success: true };
        } catch (err) {
            console.error("Error al añadir publicidad:", err);
            return { success: false, message: err.message || "Error inesperado." };
        }
    };

    const handleSelectContent = (code) => {
        addItem(code);
        setAdding(false);
    };

    const handleDeleteSection = async () => {
        const result = await deleteSection();
        if (!result.success) {
            alert(result.message || "No se pudo eliminar la sección.");
        }
    };

    const Component = componentMap[section.section_type];
    if (!Component) return null;

    // <-- 3. LÓGICA MEJORADA PARA EL MODAL DE "AÑADIR"
    let ModalComponent;
    const adTypes = ['ad-large', 'ad-small', 'ad-banner', 'ad-skyscraper', 'ad-biglarge', 'ad-verticalsm'];

    if (adTypes.includes(section.section_type)) {
        ModalComponent = AddAdvertisementModal;
    } else if (section.section_type === "shorts") {
        ModalComponent = AddShortsModal;
    } else {
        ModalComponent = AddArticleModal;
    }

    //const canDeleteSection = canEdit && !section.is_protected;

    const editContextValue = {
        canEdit,
        onAddItem: canEdit ? () => setAdding(true) : null,
        onRemove: canEdit ? removeItem : null,
        onEdit: canEdit ? (item) => {
            if (item.ad_id) {
                setEditingAdvertisement(item);
            }
            else if (item.article_code) {
                setEditingArticle({ id: item.article_code, slug: item.article_slug });
            }
        } : null,
        onDeleteSection: canEdit && !section.is_protected ? handleDeleteSection : null,
        setItems: canEdit ? setItems : null,
        reorderItems: canEdit ? reorderItems : null
    };

    const onSelectHandler = adTypes.includes(section.section_type)
        ? handleSelectAdvertisement
        : handleSelectContent;

    return (
        <SectionEditContext.Provider value={editContextValue}>
            {adding && (
                <ModalComponent
                    section={section}
                    onSelect={onSelectHandler}
                    onCancel={() => setAdding(false)}
                />
            )}

            <Component
                section={section}
                sectionTitle={section.section_title?.trim() ? section.section_title : null}
                data={items}
                categoryFilter={categoryFilter}
            />

            {/* Modal para editar Artículos */}
            {editingArticle && (
                <EditArticleModal
                    article={editingArticle}
                    onSave={(formData) => editArticle(editingArticle.id, formData)}
                    onCancel={() => setEditingArticle(null)}
                    onUpdateSuccess={onSectionDeleted} 
                />
            )}

            {/* Modal para editar Publicidad (NUEVO) */}
            {editingAdvertisement && (
                <EditAdvertisementModal
                    advertisement={editingAdvertisement}
                    onSave={(formData) =>
                        adHook.editAdvertisement(editingAdvertisement.ad_id, formData)
                    }
                    onCancel={() => setEditingAdvertisement(null)}
                    onUpdateSuccess={onSectionDeleted}
                />
            )}
        </SectionEditContext.Provider>
    );
}
/*
// src/components/layout/public/home/SectionWrapper.jsx
import React, { useState } from "react";
import Url from "../../../../helpers/Url";
import { useSectionActions } from "../../../../hooks/useSectionActions";

// Componentes y Modales
import BreakingNews from "./BreakingNews";
import TrendingNews from "./TrendingNews";
import FeaturedNews from "./FeaturedNews";
import WorldNews from "./WorldNews";
import MosaicNews from "./MosaicNews";
import VideoNews from "./VideoNews";
import ShortsSection from "./ShortSection";
import AddArticleModal from "./AddArticleModal";
import AddShortsModal from "./AddShortsModal";
import EditArticleModal from "./EditArticleModal";
import AdBanner from "./AdBanner";
import AddAdvertisementModal from "./AddAdvertisementModal"
import EditAdvertisementModal from "./EditAdvertisementModal";

// Context y Hooks
import { useEditMode } from "../../../../context/EditModeContext";
import useAuth from "../../../../hooks/UseAuth";
import { SectionEditContext } from "../../../../context/SectionEditContext";
import useAdvertisement from "../../../../hooks/useAdvertisement";
import useArticleActions from "../../../../hooks/useArticleActions";

const componentMap = {
    breaking: BreakingNews,
    trending: TrendingNews,
    featured: FeaturedNews,
    world: WorldNews,
    mosaic: MosaicNews,
    video: VideoNews,
    shorts: ShortsSection,
    'ad-large': AdBanner,
    'ad-small': AdBanner,
    'ad-banner': AdBanner,
    'ad-skyscraper': AdBanner,
    'ad-biglarge': AdBanner,
    'ad-verticalsm': AdBanner,
};

export default function SectionWrapper({ section, onSectionDeleted }) {
    const editMode = useEditMode();
    const { auth, roles } = useAuth();

    const canEdit =
        auth?.user_code &&
        roles.some(r => ["editor", "admin", "superadmin"].includes(r)) &&
        editMode;

    // 1. Obtenemos la función 'refresh' del hook y la renombramos para evitar colisiones.
    const { items, addItem, removeItem, deleteSection, refresh: refreshSectionItems } =
        useSectionActions(section.section_slug, onSectionDeleted);

    const [adding, setAdding] = useState(false);

    const [editingArticle, setEditingArticle] = useState(null);
    const [editingAdvertisement, setEditingAdvertisement] = useState(null);

    const { editArticle } = useArticleActions();
    const adHook = useAdvertisement(editingAdvertisement?.ad_id);

    console.log(`%c[SectionWrapper] Renderizando slug: ${section.section_slug}. ¿Tengo la función onSectionDeleted?`, 'color: orange;', typeof onSectionDeleted === 'function');

    const handleDeleteSection = async () => {
        // ================= SENSOR 5 =================
        console.log(`%c[SectionWrapper] Botón de borrar presionado para: ${section.section_slug}`, 'color: red; font-weight: bold;');
        // ============================================
        const result = await deleteSection();
        if (!result.success) {
            alert(result.message || "No se pudo eliminar la sección.");
        }
    };

    const Component = componentMap[section.section_type];
    if (!Component) return null;

    // <-- 3. LÓGICA MEJORADA PARA EL MODAL DE "AÑADIR"
    let ModalComponent;
    const adTypes = ['ad-large', 'ad-small', 'ad-banner', 'ad-skyscraper', 'ad-biglarge', 'ad-verticalsm'];

    if (adTypes.includes(section.section_type)) {
        ModalComponent = AddAdvertisementModal;
    } else if (section.section_type === "shorts") {
        ModalComponent = AddShortsModal;
    } else {
        ModalComponent = AddArticleModal;
    }

    const canDeleteSection = canEdit && !section.is_protected;

    const editContextValue = {
        canEdit,
        onAddItem: canEdit ? () => setAdding(true) : null,
        onRemove: canEdit ? removeItem : null,
        onEdit: canEdit ? (item) => {
            if (item.ad_id) {
                setEditingAdvertisement(item);
            }
            else if (item.article_code) {
                setEditingArticle({ id: item.article_code, slug: item.article_slug });
            }
        } : null,
        onDeleteSection: canEdit && !section.is_protected ? handleDeleteSection : null,
    };

    return (
        <SectionEditContext.Provider value={editContextValue}>
            {adding && (
                <ModalComponent
                    section={section}
                    onSelect={code => {
                        addItem(code);
                        setAdding(false);
                    }}
                    onCancel={() => setAdding(false)}
                />
            )}

            <Component
                section={section}
                sectionTitle={section.section_title?.trim() ? section.section_title : null}
                data={items}
            />

            {editingArticle && (
                <EditArticleModal
                    article={editingArticle}
                    // Misma corrección: envolvemos la llamada
                    onSave={(formData) => editArticle(editingArticle.id, formData)}
                    onCancel={() => setEditingArticle(null)}
                    onUpdateSuccess={refreshSectionItems}
                />
            )}

            {editingAdvertisement && (
                <EditAdvertisementModal
                    advertisement={editingAdvertisement}
                    onSave={(formData) =>
                        adHook.editAdvertisement(editingAdvertisement.ad_id, formData)
                    }
                    onCancel={() => setEditingAdvertisement(null)}
                    onUpdateSuccess={refreshSectionItems}
                />
            )}
        </SectionEditContext.Provider>
    );
}
*/