// src/components/layout/public/PublicLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AuthModal from './AuthModal';
import AddSectionModal from './home/AddSectionModal';
import Url from '../../../helpers/Url';
import useAuth from '../../../hooks/UseAuth';
import useSections from '../../../hooks/useSections'
import { EditModeContext } from '../../../context/EditModeContext';

export default function PublicLayout() {
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authError, setAuthError] = useState('');
    const { sections, loading: secLoading, error: secError, refresh, createSection } = useSections();
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const { auth, roles, login, register, recoverPassword, resendVerificationEmail } = useAuth();

    const canManageSections =
        auth?.user_code &&
        roles?.some(r => ["editor", "admin", "superadmin"].includes(r));


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
    const handleCreateSection = async ({ title, type }) => {
        try {
            await createSection({ title, type });
            setShowSectionModal(false);
        } catch {
        }
    };

    return (
        <EditModeContext.Provider value={editMode}>
            <Header onOpenAuth={() => setIsAuthOpen(true)} />

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
                <Outlet context={{
                    sections,
                    loading: secLoading,
                    error: secError,
                    refresh
                }} />

            </main>

            <Footer />

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
            {secLoading && <p>Cargando secciones…</p>}
            {secError && <p className="form-error">{secError}</p>}
        </EditModeContext.Provider>
    );
}
