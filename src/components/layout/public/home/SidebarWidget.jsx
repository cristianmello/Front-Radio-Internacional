import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSectionActions } from '../../../../hooks/useSectionActions';
import { SectionEditContext } from '../../../../context/SectionEditContext';

// Importa todos los posibles componentes visuales y modales del sidebar
import AudioNewsWidget from './AudioNewsWidget';
import AdBanner from './AdBanner';
import SidebarArticleList from './SidebarArticleList';
import AddAdvertisementModal from './AddAdvertisementModal';
import AddAudioModal from './AddAudioModal';
import AddArticleModal from './AddArticleModal';
// Importa los modales de edición que necesitarás
import EditAdvertisementModal from './EditAdvertisementModal';
import EditAudioModal from './EditAudioModal';
import EditArticleModal from './EditArticleModal';

// Hooks para la lógica de edición
import useAdvertisement from '../../../../hooks/useAdvertisement';
import useAudio from '../../../../hooks/UseAudio';
import useArticleActions from '../../../../hooks/useArticleActions';


// Mapeo de tipos de sección a componentes VISUALES
const componentMap = {
    'sideaudios': AudioNewsWidget,
    'sidebar': SidebarArticleList,
    'ad-small': AdBanner,
    'ad-skyscraper': AdBanner,
    'ad-verticalsm': AdBanner,

};

// Mapeo de tipos de sección a modales de "AÑADIR"
const addModalMap = {
    'sideaudios': AddAudioModal,
    'sidebar': AddArticleModal,
    'ad-small': AddAdvertisementModal,
    'ad-skyscraper': AddAdvertisementModal,
    'ad-verticalsm': AddAdvertisementModal,

};
/*
// Mapeo de tipos de sección a modales de "EDITAR"
const editModalMap = {
    'sideaudios': EditAudioModal,
    'sidebar': EditArticleModal,
    'ad-small': EditAdvertisementModal,
    'ad-skyscraper': EditAdvertisementModal,
    'ad-verticalsm': EditAdvertisementModal,
};
*/
const SidebarWidget = ({ section, onSectionDeleted, canEditGlobal }) => {
    const items = section.items || [];

    // 1) Llamamos SIEMPRE al hook, en primer lugar
    const {
        addItem: _addItem,
        removeItem: _removeItem,
        deleteSection: _deleteSection
    } = useSectionActions(section.section_slug, onSectionDeleted);

    // 2) Según canEditGlobal, usamos las funciones reales o no‑ops
    const addItem = canEditGlobal ? _addItem : () => Promise.resolve();
    const removeItem = canEditGlobal ? _removeItem : () => Promise.resolve();
    const deleteSection = canEditGlobal ? _deleteSection : () => Promise.resolve();

    const [isAdding, setIsAdding] = useState(false);

    const [editingArticle, setEditingArticle] = useState(null);
    const [editingAd, setEditingAd] = useState(null);
    const [editingAudio, setEditingAudio] = useState(null);

    // Inicializamos los hooks para tener sus funciones disponibles
    const { editArticle } = useArticleActions();
    const adHook = useAdvertisement();
    const audioHook = useAudio();

    const Component = componentMap[section.section_type];
    const AddModal = addModalMap[section.section_type];

    if (!Component) return null;

    // --- FUNCIÓN onEdit INTELIGENTE Y ESTANDARIZADA ---
    const handleEdit = (item) => {
        if (item.ad_id) {
            setEditingAd(item); // Guardamos el objeto completo del anuncio
        } else if (item.audio_code) {
            setEditingAudio(item); // Guardamos el objeto completo del audio
        } else if (item.article_code) {
            // Para artículos, creamos el objeto estandarizado que EditArticleModal espera
            setEditingArticle({ id: item.article_code, slug: item.article_slug });
        }
    };

    const contextValue = {
        canEdit: canEditGlobal,
        onAddItem: canEditGlobal && AddModal ? () => setIsAdding(true) : null,
        onRemove: canEditGlobal ? removeItem : null,
        onEdit: canEditGlobal ? handleEdit : null, // Pasamos la nueva función de manejo
        onDeleteSection: canEditGlobal && !section.is_protected ? deleteSection : null,
    };

    return (
        <SectionEditContext.Provider value={contextValue}>
            {/* Modal de Añadir (sin cambios) */}
            {isAdding && AddModal && (
                <AddModal
                    section={section}
                    onSelect={(code) => {
                        addItem(code).then(() => onSectionDeleted());
                    }} onCancel={() => setIsAdding(false)}
                />
            )}

            {/* --- RENDERIZADO DE MODALES DE EDICIÓN SEPARADO Y CORRECTO --- */}

            {editingArticle && (
                <EditArticleModal
                    article={editingArticle}
                    onSave={(formData) => editArticle(editingArticle.id, formData)}
                    onCancel={() => setEditingArticle(null)}
                    onUpdateSuccess={onSectionDeleted}
                />
            )}

            {editingAd && (
                <EditAdvertisementModal
                    advertisement={editingAd}
                    onSave={(formData) => adHook.editAdvertisement(editingAd.ad_id, formData)}
                    onCancel={() => setEditingAd(null)}
                    onUpdateSuccess={onSectionDeleted}
                />
            )}

            {editingAudio && (
                <EditAudioModal
                    // Pasamos el ID del audio. Asumimos que el modal lo usa para fetchear datos.
                    audioId={editingAudio.audio_code}
                    onSave={(formData) => audioHook.editAudio(editingAudio.audio_code, formData)}
                    onCancel={() => setEditingAudio(null)}
                    onUpdateSuccess={onSectionDeleted}
                />
            )}

            {/* Componente Visual */}
            <Component
                section={section}
                sectionTitle={section.section_title}
                data={items}
            />
        </SectionEditContext.Provider>
    );
};


SidebarWidget.propTypes = {
    section: PropTypes.object.isRequired,
    onSectionDeleted: PropTypes.func,
    canEditGlobal: PropTypes.bool,
};

export default SidebarWidget;
