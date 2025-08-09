// src/components/layout/public/PublicLayout.jsx
import React, { useState } from 'react';
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

export default function PublicLayout() {
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authError, setAuthError] = useState('');
    const { sections, categories, loading, error, refresh: refreshSections, createSection } = useSections();
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const { auth, roles, login, register, recoverPassword, resendVerificationEmail } = useAuth();
    const location = useLocation();

    const canManageSections =
        auth?.user_code &&
        roles?.some(r => ["editor", "admin", "superadmin"].includes(r));

    // 1. Definimos qué tipos de sección son para el sidebar.
    const sidebarWidgetTypes = ['sidebar', 'sideaudios', 'ad-small', 'ad-skyscraper', 'ad-verticalsm'];

    // 2. Filtramos y ordenamos las secciones del sidebar. Esto se hace una sola vez aquí.
    const sidebarWidgets = sections
        .filter(s => sidebarWidgetTypes.includes(s.section_type))
        .sort((a, b) => a.section_position - b.section_position);

    // 3. Decidimos si la página actual debe tener el layout con sidebar.
    // Lo mostramos en la home ('/') y en las páginas de artículos ('/articulos/...').
    const showSidebarLayout = location.pathname === '/' || location.pathname.startsWith('/articulos/');

    const sidebarComponent = showSidebarLayout && sidebarWidgets.length > 0 ? (
        <div className="persistent-sidebar">
            <NewsSidebar
                sectionTitle="Widgets"
                data={sidebarWidgets}
                onSectionDeleted={refreshSections}
                canEditGlobal={canManageSections && editMode}
                categories={categories}
            />
        </div>
    ) : null;

    const handleSectionDeleted = () => {
        refreshSections();
    };

    // LOGIN
    const handleLogin = async ({ user_mail, user_password }) => {
        const result = await login({ user_mail, user_password });
        if (!result.success) {
            setAuthError(result.message);
        } else {
            setAuthError('');
            setIsAuthOpen(false);
        }
        return result;
    };


    // REGISTER
    const handleRegister = async (payload) => {
        const result = await register(payload);
        if (!result.success) {
            setAuthError(result.message);
        } else {
            setAuthError('');
        }
        return result;
    };

    // RECOVER
    const handleRecover = async ({ user_mail }) => {
        const result = await recoverPassword({ user_mail });
        if (!result.success) {
            setAuthError(result.message);
        } else {
            setAuthError('');
        }
        return result;
    };

    // CREAR NUEVA SECCIÓN
    const handleCreateSection = async (payload) => {
        // 1. Llama a la función del hook y guarda el resultado
        const result = await createSection(payload);

        // 2. Si tiene éxito, el layout se encarga de cerrar el modal
        if (result.success) {
            setShowSectionModal(false);
        }

        // 3. Retorna siempre el resultado para que el modal lo reciba
        return result;
    };

    return (
        <SidebarContext.Provider value={sidebarComponent}>
            <EditModeContext.Provider value={editMode}>
                <Header
                    onOpenAuth={() => setIsAuthOpen(true)}
                    categories={categories}
                    categoriesLoading={loading}
                    categoriesError={error}
                    onCategoriesUpdate={refreshSections}
                />

                <AuthModal
                    isOpen={isAuthOpen}
                    onClose={() => {
                        setIsAuthOpen(false);
                        setAuthError('');
                    }}
                    onLogin={handleLogin}
                    onRegister={handleRegister}
                    onRecover={handleRecover}
                    onResendVerification={resendVerificationEmail}
                />

                <main>
                    {/* El page-wrapper ahora está en el CSS, no necesita div extra */}
                    <div className="page-wrapper">
                        <Outlet context={{
                            sections,
                            categories,
                            loading: loading,
                            error: error,
                            refresh: refreshSections,
                            onOpenAuth: () => setIsAuthOpen(true)
                        }} />
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
                        onClick={() => setEditMode(prev => !prev)}
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
                                onClick={() => setShowSectionModal(true)}
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
                        onCancel={() => setShowSectionModal(false)}
                    />
                )}

                {/* Opcional: mostrar estado de carga o error de secciones */}
                {loading && <p>Cargando secciones…</p>}
                {error && <p className="form-error">{error}</p>}
            </EditModeContext.Provider>
        </SidebarContext.Provider>

    );
}
