import React, { useRef, useState } from "react";
import NewsMain from "./NewsMain";
import NewsSidebar from "./NewsSidebar";
import SidebarWidget from "./SidebarWidget";
import AddArticleModal from "./AddArticleModal";
import EditArticleModal from "./EditArticleModal";
import { useSectionActions } from "../../../../hooks/useSectionActions";
import { SectionEditContext } from "../../../../context/SectionEditContext";
import { useEditMode } from "../../../../context/EditModeContext";
import useArticleActions from "../../../../hooks/useArticleActions";
import useCategories from "../../../../hooks/UseCategories";

/**
 * Componente de layout principal que organiza el contenido principal y un sidebar dinámico.
 * @param {object} mainSection - El objeto de la sección de contenido principal.
 * @param {array} sidebarWidgets - Un array de objetos de sección para renderizar en el sidebar.
 */
const NewsLayout = ({
  category,
  mainSection,
  sidebarWidgets = [],
  canEdit,
  onSectionDeleted
}) => {
  const editMode = useEditMode();
  const canEditCombined = canEdit && editMode;

  const { categories } = useCategories();
  const currentCat = categories.find(c => c.category_slug === category);
  const currentCatName = currentCat ? currentCat.category_name : null;

  // --- LÓGICA PARA LA SECCIÓN PRINCIPAL ---
  const {
    items: mainItems,
    addItem: addMainItem,
    removeItem: removeMainItem,
    refresh: refreshMainItems
  } = useSectionActions(mainSection?.section_slug, onSectionDeleted);

  const [addingMain, setAddingMain] = useState(false);
  const [editingMain, setEditingMain] = useState(null);
  const { editArticle } = useArticleActions();

  const filteredMain = (category === "inicio" || !currentCatName)
    ? mainItems
    : mainItems.filter(item => item.category === currentCatName);

  // Este contexto es EXCLUSIVO para la sección principal (NewsMain)
  const mainContext = {
    canEdit: canEditCombined,
    onAddItem: canEdit ? () => setAddingMain(true) : null,
    onRemove: canEdit ? removeMainItem : null,
    onEdit: canEditCombined ? (article) => setEditingMain({ id: article.article_code, slug: article.article_slug }) : null,
    onDeleteSection: null // La sección principal no se borra desde aquí
  };

  const isInicio = category === "inicio";
  const containerStyle = { gridTemplateColumns: isInicio ? "3fr 1fr" : "1fr" };

  return (
    <div
      className={`news-layout ${isInicio ? "inicio" : ""}`}
      id="destacados"
      style={containerStyle}
    >
      {/* ================================================================== */}
      {/* ZONA 1: CONTEXTO Y COMPONENTES PARA EL CONTENIDO PRINCIPAL         */}
      {/* Este Provider asegura que NewsMain y sus modales funcionen bien.  */}
      {/* ================================================================== */}
      <SectionEditContext.Provider value={mainContext}>

        {addingMain && (
          <AddArticleModal
            section={mainSection}
            onSelect={code => { addMainItem(code); setAddingMain(false); }}
            onCancel={() => setAddingMain(false)}
          />
        )}

        {editingMain && (
          <EditArticleModal
            article={editingMain}
            onSave={(formData) => editArticle(editingMain.id, formData)}
            onCancel={() => setEditingMain(null)}
            onUpdateSuccess={refreshMainItems}
          />
        )}

        <NewsMain
          sectionTitle={isInicio ? "Destacados" : `Destacados: ${currentCatName}`}
          data={filteredMain}
        />
      </SectionEditContext.Provider>


      {/* ================================================================== */}
      {/* ZONA 2: SIDEBAR DINÁMICO                                          */}
      {/* Esta zona es independiente. Cada widget del sidebar tendrá      */}
      {/* su propio contexto interno gracias a SidebarWidget.             */}
      {/* ================================================================== */}
      {isInicio && (
        <NewsSidebar>
          {sidebarWidgets.map(widgetSection => (
            <SidebarWidget
              key={widgetSection.section_slug}
              section={widgetSection}
              onSectionDeleted={onSectionDeleted}
              canEditGlobal={canEditCombined}
            />
          ))}
        </NewsSidebar>
      )}
    </div>
  );
};

export default NewsLayout;

/*import React, { useRef, useState } from "react";
import NewsMain from "./NewsMain";
import NewsSidebar from "./NewsSidebar";
import SidebarWidget from "./SidebarWidget";
import AddArticleModal from "./AddArticleModal";
import EditArticleModal from "./EditArticleModal";
import { useSectionActions } from "../../../../hooks/useSectionActions";
import { SectionEditContext } from "../../../../context/SectionEditContext";
import { useEditMode } from "../../../../context/EditModeContext";
import useCategories from "../../../../hooks/useCategories";
import useArticle from "../../../../hooks/UseArticle";


const NewsLayout = ({
  category,
  mainSection,
  sidebarWidgets = [],
  canEdit,
  onSectionDeleted
}) => {
  const editMode = useEditMode();
  const canEditCombined = canEdit && editMode;

  const { categories } = useCategories();
  const currentCat = categories.find(c => c.category_slug === category);
  const currentCatName = currentCat ? currentCat.category_name : null;

  // --- LÓGICA PARA LA SECCIÓN PRINCIPAL ---
  const {
    items: mainItems,
    addItem: addMainItem,
    removeItem: removeMainItem,
    refresh: refreshMainItems
  } = useSectionActions(mainSection?.section_slug, onSectionDeleted);

  const [addingMain, setAddingMain] = useState(false);
  const [editingMain, setEditingMain] = useState(null);
  const articleHook = useArticle(editingMain?.id, editingMain?.slug);

  const filteredMain = (category === "inicio" || !currentCatName)
    ? mainItems
    : mainItems.filter(item => item.category === currentCatName);

  // Este contexto es EXCLUSIVO para la sección principal (NewsMain)
  const mainContext = {
    canEdit: canEditCombined,
    onAddItem: canEdit ? () => setAddingMain(true) : null,
    onRemove: canEdit ? removeMainItem : null,
    onEdit: canEditCombined ? (article) => setEditingMain({ id: article.article_code, slug: article.article_slug }) : null,
    onDeleteSection: null // La sección principal no se borra desde aquí
  };

  const isInicio = category === "inicio";
  const containerStyle = { gridTemplateColumns: isInicio ? "2fr 1fr" : "1fr" };

  return (
    <div
      className={`news-layout ${isInicio ? "inicio" : ""}`}
      id="destacados"
      style={containerStyle}
    >
 
      <SectionEditContext.Provider value={mainContext}>

        {addingMain && (
          <AddArticleModal
            section={mainSection}
            onSelect={code => { addMainItem(code); setAddingMain(false); }}
            onCancel={() => setAddingMain(false)}
          />
        )}

        {editingMain && (
          <EditArticleModal
            article={editingMain}
            // Envolvemos la llamada en una función flecha
            onSave={(formData) => articleHook.editArticle(editingMain.id, formData)}
            onCancel={() => setEditingMain(null)}
            onUpdateSuccess={refreshMainItems}
          />
        )}

        <NewsMain
          sectionTitle={isInicio ? "Destacados" : `Destacados: ${currentCatName}`}
          data={filteredMain}
        />
      </SectionEditContext.Provider>


      {isInicio && (
        <NewsSidebar>
          {sidebarWidgets.map(widgetSection => (
            <SidebarWidget
              key={widgetSection.section_slug}
              section={widgetSection}
              onSectionDeleted={onSectionDeleted}
              canEditGlobal={canEditCombined}
            />
          ))}
        </NewsSidebar>
      )}
    </div>
  );
};

export default NewsLayout;
*/