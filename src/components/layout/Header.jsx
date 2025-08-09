// src/components/layout/public/Header.jsx
import React, { useEffect, useState } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/UseAuth";
import AddCategoryModal from "../modals/AddCategoryModal";
import DeleteCategoryModal from "../modals/DeleteCategoryModal";
import { useEditMode } from "../../context/EditModeContext";
import CreateArticleModal from "../modals/CreateArticleModal";
import CreateAudioModal from "../modals/CreateAudioModal";
import useArticleActions from "../../hooks/useArticleActions";
import DeleteDraftModal from "../modals/DeleteArticleModal";
import useAdvertisement from "../../hooks/useAdvertisement";
import CreateAdvertisementModal from "../modals/CreateAdvertisementModal";
import DeleteAdvertisementModal from "../modals/DeleteAdvertisementModal";
import SelectAdvertisementToEditModal from "../modals/SelectAdvertisementToEditModal";
import EditAdvertisementModal from "../modals/EditAdvertisementModal";
import EditContentArticleModal from "../modals/EditContentArticleModal";
import logoRealidadNacional from '../../assets/img/logo-realidad-nacional.png';
import useCategoryActions from "../../hooks/useCategoryActions";
import useAudio from "../../hooks/UseAudio";

const Header = ({ onOpenAuth, categories, categoriesLoading, categoriesError, onCategoriesUpdate }) => {
  const { auth, logout, roles } = useAuth();

  const editMode = useEditMode();
  const { addCategory, deleteCategory, isActionLoading } = useCategoryActions(onCategoriesUpdate);

  const { addArticle, deleteArticle } = useArticleActions();
  const { addAudio } = useAudio();
  const { addAdvertisement, deleteAdvertisement, editAdvertisement } = useAdvertisement();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [ShowAddArticleModal, setShowAddArticleModal] = useState(false);
  const [ShowDeleteArticleModal, setShowDeleteArticleModal] = useState(false);

  const [showAddAudioModal, setShowAddAudioModal] = useState(false);

  const [showAddAdModal, setShowAddAdModal] = useState(false);
  const [showDeleteAdModal, setShowDeleteAdModal] = useState(false);

  const [showSelectAdModal, setShowSelectAdModal] = useState(false);
  const [adToEdit, setAdToEdit] = useState(null);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [showSelectDraftModal, setShowSelectDraftModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // definimos si puede gestionar categorías
  const canManageCategories =
    auth?.user_code &&
    roles.some(r => ["editor", "admin", "superadmin"].includes(r));

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [mobileMenuOpen]);

  const handleCategoryClick = (e, { slug, path }) => {
    // Esto se mantiene igual
    const event = new CustomEvent("categoryChange", { detail: slug });
    document.dispatchEvent(event);

    navigate(path);

    // --- EL CAMBIO ESTÁ AQUÍ ---
    if (slug === "inicio") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // En lugar de buscar el ID, ahora disparamos un evento personalizado
      // para que la página que corresponda se encargue del scroll.
      const scrollEvent = new CustomEvent("scrollToSection", { detail: { targetId: "destacados" } });
      document.dispatchEvent(scrollEvent);
    }

    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  // Build mobile auth links


  // Add / Delete category buttons
  const openAddCategory = () => setShowAddModal(true);
  const cancelAdd = () => setShowAddModal(false);

  const openRemoveCategory = () => setShowDeleteModal(true);
  const cancelDelete = () => setShowDeleteModal(false);

  //Add /Delete Articlebuttons
  const openAddArticle = () => setShowAddArticleModal(true)
  const cancelAddArticle = () => setShowAddArticleModal(false);


  const openRemoveArticle = () => setShowDeleteArticleModal(true)
  const cancelRemoveArticle = () => setShowDeleteArticleModal(false);

  const openAddAudio = () => setShowAddAudioModal(true);
  const cancelAddAudio = () => setShowAddAudioModal(false);

  const openAddAd = () => setShowAddAdModal(true);
  const cancelAddAd = () => setShowAddAdModal(false);

  const openDeleteAd = () => setShowDeleteAdModal(true);
  const cancelDeleteAd = () => setShowDeleteAdModal(false);

  const openSelectAdToEdit = () => setShowSelectAdModal(true);
  const cancelSelectAdToEdit = () => setShowSelectAdModal(false);

  const openSelectDraft = () => setShowSelectDraftModal(true);
  const cancelSelectDraft = () => setShowSelectDraftModal(false);

  const handleConfirmAdd = async data => {
    const result = await addCategory(data);
    if (result.success) {
      cancelAdd();
    }
    return result;
  };

  const handleConfirmDelete = async slug => {
    const result = await deleteCategory(slug);
    if (result.success) {
      cancelDelete();
    }
    return result;
  };

  const handleConfirmAddArticle = async formData => {
    const result = await addArticle(formData);
    if (result.success) {
      cancelAddArticle();
    }
    return result;
  };

  const handleConfirmDeleteArticle = async articleCode => {
    const result = await deleteArticle(articleCode);
    if (result.success) {
      cancelRemoveArticle();
    }
    return result;
  };

  const handleConfirmAddAudio = async formData => {
    const result = await addAudio(formData);
    if (result.success) {
      cancelAddAudio();
    }
    return result;
  };

  const handleConfirmAddAd = async formData => {
    const result = await addAdvertisement(formData);
    if (result.success) {
      cancelAddAd();
    }
    return result;
  };

  const handleConfirmDeleteAd = async (adId) => {
    const result = await deleteAdvertisement(adId);
    return result;
  };

  const handleAdSelectedForEdit = (ad) => {
    setShowSelectAdModal(false);
    setAdToEdit(ad);
  };

  const handleLogoutClick = () => {
    // Si el menú móvil está abierto, ciérralo antes de mostrar el modal
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const handleSelectDraft = (code, slug) => {
    setShowSelectDraftModal(false);
    navigate(`/articulos/${code}/${slug}`);
  };

  const mobileAuthItems = !auth?.user_code
    ? [{ name: 'Ingresar', slug: 'login', action: onOpenAuth }]
    : [
      { name: 'Perfil', slug: 'perfil', action: () => navigate('/perfil') },
      { name: 'Cerrar sesión', slug: 'logout', action: handleLogoutClick }
    ];

  return (
    <header>
      <div className="header-top">
        <div className="container">
          <div className="logo">
            <Link to="/">
              <img
                src={logoRealidadNacional}
                alt="Realidad Nacional"
                className="logo-img"
              />
            </Link>
          </div>

          {/* Desktop auth buttons */}
          <div className="user-auth">
            {!auth?.user_code ? (
              <button className="auth-btn login-btn" onClick={onOpenAuth}>INGRESAR</button>
            ) : (
              <>
                <Link to="/perfil" className="user-greeting">
                  <img
                    src={auth.profile?.user_image || '/default-avatar.png'}
                    alt="Tu avatar"
                    className="user-greeting-avatar"
                  />
                  <span>Hola, {auth.user_name}</span>
                </Link>
                <button className="auth-btn" onClick={handleLogoutClick}>Cerrar sesión</button>
              </>
            )}
          </div>

          <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <i className="fas fa-bars"></i>
          </div>
        </div>
      </div>

      <nav className={`main-nav ${mobileMenuOpen ? "show-menu" : ""}`} onClick={toggleMobileMenu}>
        <div className="container" onClick={e => e.stopPropagation()}>
          {categoriesLoading ? (
            <p>Cargando categorías…</p>
          ) : categoriesError ? (
            <p className="error">Error: {categoriesError}</p>
          ) : (
            <>
              <ul className="nav-list">
                <li className="mobile-menu-header">
                  {auth ? (
                    <Link to="/perfil" onClick={() => setMobileMenuOpen(false)}>
                      <div className="user-info">
                        <img src={auth.profile?.user_image || '/default-avatar.png'} alt="Perfil" className="user-avatar" />
                        <span className="user-name">{auth.user_name} {auth.user_lastname}</span>
                      </div>
                    </Link>
                  ) : (
                    <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                      <img src={logoRealidadNacional} alt="Realidad Nacional" className="menu-logo" />
                    </Link>
                  )}
                </li>
                {categories.map(cat => {
                  // Si el slug de la categoría es 'inicio', la ruta es '/', si no, es '/categoria/...'
                  const linkPath = cat.category_slug === 'inicio' ? '/' : `/categoria/${cat.category_slug}`;
                  // Esta otra lógica es para marcar el link como "activo" correctamente
                  const isActive = location.pathname === linkPath;

                  return (
                    <li
                      key={cat.category_code}
                      data-category={cat.category_slug}
                      className={isActive ? "active" : ""}
                    >
                      <NavLink
                        to={linkPath}
                        onClick={e => handleCategoryClick(e, {
                          slug: cat.category_slug,
                          path: linkPath
                        })}
                        state={{ preventScrollReset: true }}
                      >
                        {cat.category_name}
                      </NavLink>
                    </li>
                  );
                })}

                <li className="nav-separator"></li>

                {mobileMenuOpen && mobileAuthItems.map(item => (
                  <li key={item.slug} className="mobile-auth-item mobile-only-item">
                    {item.path ? (
                      <NavLink
                        to={item.path}
                        onClick={() => { if (mobileMenuOpen) setMobileMenuOpen(false); }}
                      >
                        {item.name}
                      </NavLink>
                    ) : (
                      <button
                        className="mobile-auth-btn"
                        onClick={() => { item.action(); setMobileMenuOpen(false); }}
                      >
                        {item.name}
                      </button>
                    )}
                  </li>
                ))}
              </ul>


              {canManageCategories && editMode && (
                <ul className="nav-list actions-list">
                  <li className="mobile-action-item">
                    <button className="nav-list-btn-edit" onClick={openAddCategory}>
                      + Añadir categoría
                    </button>
                  </li>
                  <li className="mobile-action-item">
                    <button className="nav-list-btn-edit" onClick={openRemoveCategory}>
                      − Eliminar categoría
                    </button>
                  </li>
                  <li className="mobile-action-item">
                    <button className="nav-list-btn-edit" onClick={openAddArticle}>
                      + Crear articulo
                    </button>
                  </li>
                  <li className="mobile-action-item">
                    <button className="nav-list-btn-edit" onClick={openSelectDraft}>
                      ✏️ Editar contenido de Artículo
                    </button>
                  </li>
                  <li className="mobile-action-item">
                    <button className="nav-list-btn-edit" onClick={openAddAudio}>
                      + Crear Audio
                    </button>
                  </li>
                  <li className="mobile-action-item">
                    <button className="nav-list-btn-edit" onClick={openRemoveArticle}>
                      − Eliminar de todo
                    </button>
                  </li>
                  <li className="mobile-action-item">
                    <button className="nav-list-btn-edit" onClick={openAddAd}>
                      + Crear Publicidad
                    </button>
                  </li>
                  <li className="mobile-action-item">
                    <button className="nav-list-btn-edit" onClick={openDeleteAd}>
                      − Eliminar Publicidad
                    </button>
                  </li>
                  <li className="mobile-action-item">
                    <button className="nav-list-btn-edit" onClick={openSelectAdToEdit}>
                      <i className="fas fa-edit" style={{ marginRight: '5px' }}></i>
                      Editar Publicidad
                    </button>
                  </li>
                </ul>
              )}
            </>

          )}
        </div>
      </nav>
      {showAddModal && <AddCategoryModal onConfirm={handleConfirmAdd} onCancel={cancelAdd} />}
      {showDeleteModal && <DeleteCategoryModal categories={categories} onConfirm={handleConfirmDelete} onCancel={cancelDelete} />}
      {ShowAddArticleModal && <CreateArticleModal onSave={handleConfirmAddArticle} onCancel={cancelAddArticle} categories={categories} />}
      {ShowDeleteArticleModal && <DeleteDraftModal onConfirm={handleConfirmDeleteArticle} onCancel={cancelRemoveArticle} />}
      {showAddAudioModal && <CreateAudioModal onSave={handleConfirmAddAudio} onCancel={cancelAddAudio} categories={categories} />}
      {showAddAdModal && <CreateAdvertisementModal onSave={handleConfirmAddAd} onCancel={cancelAddAd} />}
      {showDeleteAdModal && <DeleteAdvertisementModal onConfirm={handleConfirmDeleteAd} onCancel={cancelDeleteAd} />}
      {showSelectAdModal && (<SelectAdvertisementToEditModal onSelect={handleAdSelectedForEdit} onCancel={cancelSelectAdToEdit} />)}
      {adToEdit && (<EditAdvertisementModal advertisement={adToEdit} onSave={(formData) => editAdvertisement(adToEdit.ad_id, formData)} onCancel={() => setAdToEdit(null)} onUpdateSuccess={() => { /* lógica para refrescar si es necesario */ }} />)}
      {showSelectDraftModal && <EditContentArticleModal onSelect={handleSelectDraft} onCancel={cancelSelectDraft} />}

      {showLogoutConfirm && (
        <div className="confirm-modal-backdrop">
          <div className="confirm-modal">
            <div className="confirm-modal-header">
              <h3>Confirmar Cierre de Sesión</h3>
            </div>
            <div className="confirm-modal-body">
              <p>¿Estás seguro de que quieres cerrar tu sesión?</p>
            </div>
            <div className="confirm-modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary logout-item"
                onClick={confirmLogout}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

    </header >
  );
};

export default Header;