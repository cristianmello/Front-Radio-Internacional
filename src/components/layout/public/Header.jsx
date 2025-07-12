// src/components/layout/public/Header.jsx
import React, { useEffect, useState } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../../hooks/UseAuth";
import AddCategoryModal from "./home/AddCategoryModal";
import DeleteCategoryModal from "./home/DeleteCategoryModal";
import Url from "../../../helpers/Url";
import { useEditMode } from "../../../context/EditModeContext";
import CreateArticleModal from "./home/CreateArticleModal";
import CreateAudioModal from "./home/CreateAudioModal";
import useArticleActions from "../../../hooks/useArticleActions";
import useAudio from "../../../hooks/UseAudio";
import DeleteDraftModal from "./home/DeleteArticleModal";
import useAdvertisement from "../../../hooks/useAdvertisement";
import CreateAdvertisementModal from "./home/CreateAdvertisementModal";
import DeleteAdvertisementModal from "./home/DeleteAdvertisementModal";
import SelectAdvertisementToEditModal from "./home/SelectAdvertisementToEditModal";
import EditAdvertisementModal from "./home/EditAdvertisementModal";
import EditContentArticleModal from "./home/EditContentArticleModal";
import useCategories from "../../../hooks/UseCategories";

const Header = ({ onOpenAuth }) => {
  const { auth, logout, roles } = useAuth();

  const editMode = useEditMode();
  const { categories, loading, error, addCategory, deleteCategory } = useCategories();

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
    const event = new CustomEvent("categoryChange", { detail: slug });
    document.dispatchEvent(event);

    navigate(path);
    if (slug === "inicio") {
      // Scroll al tope
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Scroll a sección destacados
      setTimeout(() => {
        const target = document.getElementById("destacados");
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
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
    const { success, message } = await addCategory(data);
    if (!success) alert('Error al crear categoría: ' + message);
    else cancelAdd();
  };

  const handleConfirmDelete = async slug => {
    const { success, message } = await deleteCategory(slug);
    if (!success) alert('Error al eliminar categoría: ' + message);
    else cancelDelete();
  };

  const handleConfirmAddArticle = async formData => {
    // formData es un FormData con todos los campos del artículo
    const result = await addArticle(formData);
    if (!result.success) {
      alert('Error al crear artículo: ' + result.message);
    } else {
      cancelAddArticle();
    }
    return result;
  };

  const handleConfirmDeleteArticle = async articleCode => {
    const { success, message } = await deleteArticle(articleCode);
    if (!success) alert('Error al eliminar artículo: ' + message);
    else cancelRemoveArticle();
  };

  const handleConfirmAddAudio = async formData => {
    const result = await addAudio(formData);
    if (!result.success) {
      alert('Error al crear nota de audio: ' + result.message);
    } else {
      cancelAddAudio();
    }
    return result;
  };

  const handleConfirmAddAd = async formData => {
    // El hook se encarga de la lógica de la API
    const result = await addAdvertisement(formData);
    if (!result.success) {
      alert('Error al crear el anuncio: ' + result.message);
    } else {
      alert('Anuncio creado con éxito.');
      cancelAddAd(); // Cierra el modal si todo fue bien
    }
    return result;
  };

  const handleConfirmDeleteAd = async (adId) => {
    // La lógica de confirmación ya la tienes en el modal, aquí solo llamamos al hook
    const result = await deleteAdvertisement(adId);
    if (result.success) {
      alert('Anuncio eliminado con éxito.');
      // Opcional: si quieres que la lista del modal se refresque,
      // tendrías que añadir una función de 'refresh' al hook y llamarla aquí.
    } else {
      alert('Error al eliminar el anuncio: ' + result.message);
    }
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
            <Link to="/categoria/inicio">
              <h1>RealidadNacional</h1>
            </Link>
          </div>

          {/* Desktop auth buttons */}
          <div className="user-auth">
            {!auth?.user_code ? (
              <button className="auth-btn login-btn" onClick={onOpenAuth}>Ingresar</button>
            ) : (
              <>
                <button className="auth-btn" onClick={() => navigate('/perfil')}>Perfil</button>
                <button className="auth-btn" onClick={handleLogoutClick}>Cerrar sesión</button>
              </>
            )}
          </div>

          <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <i className="fas fa-bars"></i>
          </div>
        </div>
      </div>

      <nav className="main-nav">
        <div className="container">
          {loading ? (
            <p>Cargando categorías…</p>
          ) : error ? (
            <p className="error">Error: {error}</p>
          ) : (
            <>
              <ul className={`nav-list ${mobileMenuOpen ? "show" : ""}`}>
                {categories.map(cat => (
                  <li key={cat.category_code} data-category={cat.category_slug}
                    className={location.pathname === `/categoria/${cat.category_slug}` ? "active" : ""}
                  >
                    <NavLink
                      to={`/categoria/${cat.category_slug}`}
                      onClick={e => handleCategoryClick(e, {
                        slug: cat.category_slug,
                        path: `/categoria/${cat.category_slug}`
                      })}
                      state={{ preventScrollReset: true }}
                    >
                      {cat.category_name}
                    </NavLink>
                  </li>
                ))}

                {mobileMenuOpen && mobileAuthItems.map(item => (
                  <li key={item.slug} className="mobile-auth-item">
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
                    <button className="add-category-btn" onClick={openAddCategory}>
                      + Añadir categoría
                    </button>
                  </li>
                  <li className="mobile-action-item">
                    <button className="add-category-btn" onClick={openRemoveCategory}>
                      − Eliminar categoría
                    </button>
                  </li>
                  <li className="mobile-action-item">
                    <button className="add-category-btn" onClick={openAddArticle}>
                      + Crear articulo
                    </button>
                  </li>
                  <li className="mobile-action-item">
                    <button className="add-category-btn" onClick={openSelectDraft}>
                      ✏️ Editar contenido de Artículo
                    </button>
                  </li>
                  <li className="mobile-action-item">
                    <button className="add-category-btn" onClick={openAddAudio}>
                      + Crear Audio
                    </button>
                  </li>
                  <li className="mobile-action-item">
                    <button className="add-category-btn" onClick={openRemoveArticle}>
                      − Eliminar de todo
                    </button>
                  </li>
                  <li className="mobile-action-item">
                    <button className="add-category-btn" onClick={openAddAd}>
                      + Crear Publicidad
                    </button>
                  </li>
                  <li className="mobile-action-item">
                    <button className="add-category-btn" onClick={openDeleteAd}>
                      − Eliminar Publicidad
                    </button>
                  </li>
                  <li className="mobile-action-item">
                    <button className="add-category-btn" onClick={openSelectAdToEdit}>
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
      {ShowAddArticleModal && <CreateArticleModal onSave={handleConfirmAddArticle} onCancel={cancelAddArticle} />}
      {ShowDeleteArticleModal && <DeleteDraftModal onConfirm={handleConfirmDeleteArticle} onCancel={cancelRemoveArticle} />}
      {showAddAudioModal && <CreateAudioModal onSave={handleConfirmAddAudio} onCancel={cancelAddAudio} />}
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