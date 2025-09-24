// src/components/layout/public/PublicLayout.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AuthModal from '../modals/AuthModal';
import AddSectionModal from '../modals/AddSectionModal';
import useAuth from '../../hooks/UseAuth';
import useSections from '../../hooks/useSections'
import { EditModeContext } from '../../context/EditModeContext';
import GlobalAudioPlayer from '../ui/GlobalAudioPlayer';
import { SidebarContext } from '../../context/SidebarContext';
import NewsSidebar from '../ui/NewsSidebar';
import ProfileSidebar from '../ui/ProfileSidebar';
import { useNotification } from '../../context/NotificationContext';

const PublicLayout = React.memo(() => {
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authError, setAuthError] = useState('');
    const { sections, categories, loading, error, refresh: refreshSections, createSection } = useSections();
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const { showNotification } = useNotification();
    const { auth, roles, login, register, recoverPassword, resendVerificationEmail } = useAuth();
    const location = useLocation();

    const canManageSections = useMemo(() =>
        auth?.user_code &&
        roles?.some(r => ["editor", "admin", "superadmin"].includes(r)),
        [auth?.user_code, roles]
    );

    // 1. Definimos qué tipos de sección son para el sidebar.
    const sidebarWidgetTypes = useMemo(() =>
        ['sidebar', 'sideaudios', 'ad-small', 'ad-skyscraper', 'ad-verticalsm'],
        []
    );

    // 2. Filtramos y ordenamos las secciones del sidebar. Esto se hace una sola vez aquí.
    const sidebarWidgets = useMemo(() =>
        sections
            .filter(s => sidebarWidgetTypes.includes(s.section_type))
            .sort((a, b) => a.section_position - b.section_position),
        [sections, sidebarWidgetTypes]
    );

    // 3. Decidimos si la página actual debe tener el layout con sidebar.
    // Lo mostramos en la home ('/') y en las páginas de artículos ('/articulos/...').
    const showSidebarLayout = useMemo(() =>
        location.pathname === '/' || location.pathname.startsWith('/articulos/'),
        [location.pathname]
    );

    const sidebarComponent = useMemo(() =>
        showSidebarLayout && sidebarWidgets.length > 0 ? (
            <div className="persistent-sidebar">
                <NewsSidebar
                    sectionTitle="Widgets"
                    data={sidebarWidgets}
                    onSectionDeleted={refreshSections}
                    canEditGlobal={canManageSections && editMode}
                    categories={categories}
                />
            </div>
        ) : null,
        [showSidebarLayout, sidebarWidgets, refreshSections, canManageSections, editMode, categories]
    );

    const handleSectionDeleted = useCallback(() => {
        refreshSections();
    }, [refreshSections]);

    // LOGIN
    const handleLogin = useCallback(async ({ user_mail, user_password }) => {
        const result = await login({ user_mail, user_password });
        if (!result.success) {
            setAuthError(result.message);
        } else {
            setAuthError('');
            setIsAuthOpen(false);
        }
        return result;
    }, [login]);


    // REGISTER
    const handleRegister = useCallback(async (payload) => {
        const result = await register(payload);
        if (!result.success) {
            setAuthError(result.message);
        } else {
            setAuthError('');
        }
        return result;
    }, [register]);

    // RECOVER
    const handleRecover = useCallback(async ({ user_mail }) => {
        const result = await recoverPassword({ user_mail });
        if (!result.success) {
            setAuthError(result.message);
        } else {
            setAuthError('');
        }
        return result;
    }, [recoverPassword]);

    // CREAR NUEVA SECCIÓN
    const handleCreateSection = useCallback(async (payload) => {
        const result = await createSection(payload);

        if (result.success) {
            setShowSectionModal(false);
            showNotification('Sección creada con éxito.', 'success');
        } else {
            showNotification(result.message || 'Error al crear la sección.', 'error');
        }
        return result;
    }, [createSection, showNotification]);

    const handleOpenAuth = useCallback(() => setIsAuthOpen(true), []);

    const handleCloseAuth = useCallback(() => {
        setIsAuthOpen(false);
        setAuthError('');
    }, []);

    const handleToggleEditMode = useCallback(() => setEditMode(prev => !prev), []);

    const handleOpenSectionModal = useCallback(() => setShowSectionModal(true), []);

    const handleCloseSectionModal = useCallback(() => setShowSectionModal(false), []);

    // Memorizar contexto del outlet  
    const outletContext = useMemo(() => ({
        sections,
        categories,
        loading: loading,
        error: error,
        refresh: refreshSections,
        onOpenAuth: handleOpenAuth
    }), [sections, categories, loading, error, refreshSections, handleOpenAuth]);

    return (
        <SidebarContext.Provider value={sidebarComponent}>
            <EditModeContext.Provider value={editMode}>
                <Header
                    onOpenAuth={handleOpenAuth}
                    categories={categories}
                    categoriesLoading={loading}
                    categoriesError={error}
                    onCategoriesUpdate={refreshSections}
                />

                <AuthModal
                    isOpen={isAuthOpen}
                    onClose={handleCloseAuth}
                    onLogin={handleLogin}
                    onRegister={handleRegister}
                    onRecover={handleRecover}
                    onResendVerification={resendVerificationEmail}
                />

                <main>
                    {/* El page-wrapper ahora está en el CSS, no necesita div extra */}
                    <div className="page-wrapper">
                        <Outlet context={outletContext} />
                    </div>
                </main>

                <Footer categories={categories} loading={loading} error={error} />
                <ProfileSidebar />
                <GlobalAudioPlayer />

                {/* Botón Modo Editor */}
                {canManageSections && (
                    <button
                        className="admin-btn"
                        id="adminModeBtn"
                        onClick={handleToggleEditMode}
                    >
                        <i className="fas fa-cog"></i> Modo Editor
                    </button>
                )}


                {/* Toolbar de edición */}
                {canManageSections && (

                    <div className={`edit-toolbar ${editMode ? 'active' : ''}`}>
                        <div className="toolbar-title">Herramientas de Edición</div>
                        <div className="edit-actions">
                            <button id="saveChangesBtn">Guardar Cambios</button>
                            <button id="discardChangesBtn">Descartar Cambios</button>
                            <button
                                id="addSectionBtn"
                                onClick={handleOpenSectionModal}
                            >
                                Añadir Sección
                            </button>
                        </div>
                    </div>
                )}
                {/* Modal para crear sección */}
                {canManageSections && showSectionModal && (
                    <AddSectionModal
                        onConfirm={handleCreateSection}
                        onCancel={handleCloseSectionModal}
                    />
                )}

                {/* Opcional: mostrar estado de carga o error de secciones */}
                {loading && <p>Cargando secciones…</p>}
                {error && <p className="form-error">{error}</p>}
            </EditModeContext.Provider>
        </SidebarContext.Provider>

    );
});

export default PublicLayout;
