// src/components/layout/private/admin/UserListPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import useAuth from '../../hooks/UseAuth';
import Url from '../../helpers/Url';
import useRoles from '../../hooks/useRoles';
import UpdateRoleModal from '../../components/modals/UpdateRoleModal';
import ConfirmDeleteModal from '../../components/modals/ConfirmDeleteModal';

const iconMap = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle',
};

const UserListPage = () => {
    const { authFetch } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { roles: rolesList, loading: rolesLoading } = useRoles();

    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // NUEVO: Estados y lógica para las notificaciones
    const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
    const notificationTimer = useRef(null);

    const showNotification = (message, type = 'info', duration = 4000) => {
        if (notificationTimer.current) {
            clearTimeout(notificationTimer.current);
        }
        setNotification({ show: true, message, type });
        notificationTimer.current = setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, duration);
    };

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await authFetch(`${Url.url}/api/users`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al cargar usuarios.');
            setUsers(data.data.users);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenRoleModal = (user) => {
        setSelectedUser(user);
        setIsRoleModalOpen(true);
    };

    const handleCloseRoleModal = () => {
        setIsRoleModalOpen(false);
        setSelectedUser(null);
    };

    const handleConfirmUpdateRole = async (userCode, newRoleCode) => {
        setLoading(true);
        try {
            const res = await authFetch(`${Url.url}/api/users/role/${userCode}`, {
                method: 'PUT',
                body: JSON.stringify({ new_role_code: newRoleCode }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setUsers(currentUsers => currentUsers.map(u =>
                u.user_code === userCode ? { ...u, role: { role_code: data.user.new_role_code, role_name: data.user.new_role_name } } : u
            ));
            showNotification('Rol actualizado con éxito', 'success');

            handleCloseRoleModal();
        } catch (err) {
            showNotification(err.message, 'error');
            handleCloseRoleModal();
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDeleteModal = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
    };

    const handleConfirmDelete = async () => {
        if (!selectedUser) return;
        setLoading(true);
        try {
            const res = await authFetch(`${Url.url}/api/users/${selectedUser.user_code}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            // Actualizar la lista de usuarios en el frontend para remover el eliminado
            setUsers(currentUsers => currentUsers.filter(u => u.user_code !== selectedUser.user_code));
            handleCloseDeleteModal();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && users.length === 0) return <p>Cargando usuarios...</p>;

    return (
        <div className="user-list-container">
            <h2>Gestión de Usuarios</h2>
            <p>Aquí puedes ver, editar y administrar todos los usuarios del sistema.</p>

            <table className="user-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.user_code}>
                            <td>{user.user_code}</td>
                            <td>{user.user_name} {user.user_lastname}</td>
                            <td>{user.user_mail}</td>
                            <td>{user.role?.role_name || 'N/A'}</td>
                            <td>
                                <button className="btn-action btn-edit" onClick={() => handleOpenRoleModal(user)}>
                                    Editar Rol
                                </button>
                                <button className="btn-action btn-delete" onClick={() => handleOpenDeleteModal(user)}>
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <UpdateRoleModal
                isOpen={isRoleModalOpen}
                onClose={handleCloseRoleModal}
                onConfirm={handleConfirmUpdateRole}
                user={selectedUser}
                rolesList={rolesList}
                loading={loading || rolesLoading}
            />
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que quieres eliminar al usuario "${selectedUser?.user_name} ${selectedUser?.user_lastname}"? Esta acción no se puede deshacer.`}
                loading={loading}
            />
            <div className={`notification ${notification.show ? 'show' : ''} notification-${notification.type}`}>
                {notification.type && <i className={iconMap[notification.type]}></i>}
                <span>{notification.message}</span>
            </div>
        </div>
    );
};

export default UserListPage;