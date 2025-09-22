import React, { useState, useEffect, useRef } from 'react';
import useAuth from '../hooks/UseAuth';
import useUser from '../hooks/useUser';
import { Link } from 'react-router-dom';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import Url from '../helpers/Url';

const countryCodes = [
    { name: 'Argentina', code: '+54', flag: '🇦🇷' },
    { name: 'Bolivia', code: '+591', flag: '🇧🇴' },
    { name: 'Brasil', code: '+55', flag: '🇧🇷' },
    { name: 'Chile', code: '+56', flag: '🇨🇱' },
    { name: 'Colombia', code: '+57', flag: '🇨🇴' },
    { name: 'Ecuador', code: '+593', flag: '🇪🇨' },
    { name: 'Paraguay', code: '+595', flag: '🇵🇾' },
    { name: 'Perú', code: '+51', flag: '🇵🇪' },
    { name: 'Uruguay', code: '+598', flag: '🇺🇾' },
    { name: 'Venezuela', code: '+58', flag: '🇻🇪' },
];

const iconMap = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle',
    warning: 'fas fa-exclamation-triangle',
};

function ProfilePage() {


    const { auth, authFetch, roles, setAuth, logout, loading: authLoading } = useAuth();
    const { profile, loading: userLoading, error: userError, updateUserProfile, updateUserImage } = useUser();

    // 2. Creamos una variable para verificar si es admin o superadmin
    const isAdmin = roles && roles.some(r => ['admin', 'superadmin'].includes(r));

    // 2. ESTADOS LOCALES DEL COMPONENTE (Solo para UI)
    const [isEditing, setIsEditing] = useState(false);

    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });


    const [formData, setFormData] = useState({
        user_name: '',
        user_lastname: '',
        user_birth: '',
        phone_code: '+598',
        user_phone: '',
    });

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [deleteError, setDeleteError] = useState('');


    const fileInputRef = useRef(null);
    const notificationTimer = useRef(null);

    const showNotification = (message, type = 'info', duration = 3000) => {
        if (notificationTimer.current) {
            clearTimeout(notificationTimer.current);
        }
        setNotification({ show: true, message, type });
        notificationTimer.current = setTimeout(() => {
            setNotification({ show: false, message: '', type });
        }, duration);
    };

    // 3. EFECTO PARA SINCRONIZAR DATOS
    // Cuando el perfil se carga desde el hook useUser, llenamos el formulario.
    useEffect(() => {
        if (profile) {
            let code = '+598';
            let number = profile.user_phone || '';

            // Intenta encontrar el código de país en el número guardado
            const foundCode = countryCodes.find(c => number.startsWith(c.code));
            if (foundCode) {
                code = foundCode.code;
                number = number.substring(foundCode.code.length);
            }
            setFormData({
                user_name: profile.user_name || '',
                user_lastname: profile.user_lastname || '',
                user_birth: profile.user_birth || '',
                phone_code: code,
                user_phone: number
            });
        }
    }, [profile]);

    // Efecto para mostrar errores del hook
    useEffect(() => {
        if (userError) {
            showNotification(userError, 'error');
        }
    }, [userError]);

    // 4. MANEJADORES DE EVENTOS
    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        if (profile) {
            let code = '+598';
            let number = profile.user_phone || '';
            const foundCode = countryCodes.find(c => number.startsWith(c.code));
            if (foundCode) {
                code = foundCode.code;
                number = number.substring(foundCode.code.length).trim();
            }
            setFormData({
                user_name: profile.user_name || '',
                user_lastname: profile.user_lastname || '',
                user_birth: profile.user_birth || '',
                phone_code: code,
                user_phone: number
            });
        }
    };

    const handleSaveClick = async () => {
        // Une el código y el número antes de enviar
        const fullPhoneNumber = formData.user_phone ? `${formData.phone_code}${formData.user_phone}` : '';

        // Prepara el payload para el backend
        const payload = {
            user_name: formData.user_name,
            user_lastname: formData.user_lastname,
            user_birth: formData.user_birth,
            user_phone: fullPhoneNumber,
        };

        const hasChanged = profile.user_name !== payload.user_name ||
            profile.user_lastname !== payload.user_lastname ||
            profile.user_birth !== payload.user_birth ||
            (profile.user_phone || '') !== payload.user_phone;

        if (!hasChanged) {
            showNotification("No se detectaron cambios.", "info");
            setIsEditing(false);
            return;
        }

        const result = await updateUserProfile(payload);

        if (result && result.success) {
            setIsEditing(false);
            // El componente actualiza el estado global
            setAuth(prevAuth => ({
                ...prevAuth,
                user: { ...prevAuth.user, ...payload },
            }));
            showNotification("Perfil actualizado con éxito", "success");
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const MAX_FILE_SIZE = 5 * 1024 * 1024;

        if (file.size > MAX_FILE_SIZE) {
            showNotification('La imagen es demasiado grande. El tamaño máximo es 5MB.', 'error');
            e.target.value = null;
            return;
        }

        const result = await updateUserImage(file);
        if (result && result.success) {
            setAuth(prevAuth => ({
                ...prevAuth,
                user: { ...prevAuth.user, user_image: result.imageUrl },
            }));
            showNotification("Imagen de perfil actualizada", "success");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };
    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        logout();
        setShowLogoutConfirm(false);
    };

    const handleConfirmSelfDelete = async () => {
        const result = await authFetch(`${Url.url}/api/users/${auth.user_code}`, {
            method: 'DELETE'
        });

        const data = await result.json();

        if (!result.ok) {
            setDeleteError(data.message || 'No se pudo eliminar la cuenta.');
            showNotification(data.message, 'error');
        } else {
            logout();
        }
    };

    if (authLoading || userLoading) {
        return <div>Cargando perfil...</div>;
    }

    if (!auth) {
        return <div>Debes iniciar sesión para ver esta página.</div>;
    }

    if (!profile) {
        return <div>No se pudo cargar el perfil. Error: {userError || 'Inténtalo de nuevo.'}</div>;
    }

    return (
        <div className="profile-container">
            {/* Sidebar */}
            <aside className="profile-sidebar">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {profile.user_image ? (
                            <img src={profile.user_image} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            <i className="fas fa-user"></i>
                        )}

                        {/* El nuevo botón de edición con el onClick */}
                        <button className="avatar-edit-button" onClick={() => fileInputRef.current.click()} title="Cambiar foto de perfil">
                            <i className="fas fa-pencil-alt"></i>
                        </button>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                        accept="image/png, image/jpeg, image/webp"
                        disabled={userLoading}
                    />

                    <div className="profile-name">{profile.user_name} {profile.user_lastname}</div>
                    <div className="profile-email">{profile.user_mail}</div>
                </div>
                <nav className="profile-nav">
                    <Link to="/perfil" className="nav-item active">
                        <i className="fas fa-user"></i>
                        <span className="nav-item-label">Mis datos personales</span>
                    </Link>
                    {isAdmin && (
                        <div className="admin-section">
                            <h4 className="admin-section-title">Panel de Admin</h4>
                            <Link to="/admin/users" className="nav-item">
                                <i className="fas fa-users-cog"></i>
                                <span className="nav-item-label">Gestión de Usuarios</span>
                            </Link>
                            <Link to="/admin/logs" className="nav-item">
                                <i className="fas fa-clipboard-list"></i>
                                <span className="nav-item-label">Logs del Sistema</span>
                            </Link>
                        </div>
                    )}
                    <a href="#" className="nav-item logout-item" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        <span className="nav-item-label">Cerrar sesión</span>
                    </a>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="profile-main">
                <div className="content-section active">
                    <div className="content-header">
                        <h1 className="content-title">Mis datos personales</h1>
                        <p className="content-subtitle">Administra tu información personal y de contacto</p>
                    </div>
                    <div className="content-body">
                        {isEditing ? (
                            <div>
                                <div className="data-grid">
                                    <div className="data-field">
                                        <label className="field-label">Nombre</label>
                                        <input type="text" name="user_name" value={formData.user_name} onChange={handleInputChange} className="field-input" />
                                    </div>
                                    <div className="data-field">
                                        <label className="field-label">Apellido</label>
                                        <input type="text" name="user_lastname" value={formData.user_lastname} onChange={handleInputChange} className="field-input" />
                                    </div>
                                    <div className="data-field">
                                        <label className="field-label">Fecha de Nacimiento</label>
                                        <input type="date" name="user_birth" value={formData.user_birth} onChange={handleInputChange} className="field-input" />
                                    </div>
                                    <div className="data-field">
                                        <label className="field-label">Teléfono</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <select
                                                name="phone_code"
                                                value={formData.phone_code}
                                                onChange={handleInputChange}
                                                className="field-input"
                                                style={{ flex: '0 0 120px' }}
                                            >
                                                {countryCodes.map(country => (
                                                    <option key={country.code} value={country.code}>
                                                        {country.flag} {country.code}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="tel"
                                                name="user_phone"
                                                value={formData.user_phone}
                                                onChange={handleInputChange}
                                                className="field-input"
                                                placeholder="Ej: 99123456"
                                                style={{ flex: '1' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="btn-group">
                                    <button className="btn btn-primary" onClick={handleSaveClick} disabled={userLoading}>
                                        {userLoading ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                    <button className="btn btn-secondary" onClick={handleCancelClick} disabled={userLoading}>
                                        Cancelar
                                    </button>
                                </div>
                                {userError && <p style={{ color: 'red', marginTop: '10px' }}>Error: {userError}</p>}
                            </div>
                        ) : (
                            <div>
                                <div className="data-grid">
                                    <div className="data-field">
                                        <label className="field-label">Nombre completo</label>
                                        <div className="field-value">{profile.user_name} {profile.user_lastname}</div>
                                    </div>
                                    <div className="data-field">
                                        <label className="field-label">Correo electrónico</label>
                                        <div className="field-value">{profile.user_mail}</div>
                                    </div>
                                    <div className="data-field">
                                        <label className="field-label">Fecha de Nacimiento</label>
                                        <div className="field-value">{profile.user_birth || 'No especificada'}</div>
                                    </div>
                                    <div className="data-field">
                                        <label className="field-label">Teléfono</label>
                                        <div className="field-value">{profile.user_phone || 'No especificado'}</div>
                                    </div>
                                </div>
                                <div className="btn-group">
                                    <button className="btn btn-primary" onClick={handleEditClick}>
                                        <i className="fas fa-edit"></i>
                                        Modificar mis datos
                                    </button>
                                </div>

                            </div>
                        )}
                    </div>
                </div>
                <div className="danger-zone">
                    <h2 className="danger-zone-title">Zona de Peligro</h2>
                    <div className="danger-zone-content">
                        <p>
                            Eliminar tu cuenta es una acción permanente e irreversible.
                            Se borrarán todos tus datos personales.
                        </p>
                        <button className="btn btn-delete" onClick={() => setIsDeleteConfirmOpen(true)}>
                            Eliminar mi cuenta
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmDeleteModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleConfirmSelfDelete}
                title="¿Estás absolutamente seguro?"
                message="Esta acción no se puede deshacer. Se eliminará tu perfil, y toda la información asociada."
                loading={userLoading}
            />
            <div className={`notification ${notification.show ? 'show' : ''} notification-${notification.type}`}>
                {notification.type && <i className={iconMap[notification.type]}></i>}
                <span>{notification.message}</span>
            </div>
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
        </div>
    );
}

export default ProfilePage;