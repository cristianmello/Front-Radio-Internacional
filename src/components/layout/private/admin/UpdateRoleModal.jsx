// src/components/layout/private/admin/UpdateRoleModal.jsx
import React, { useState, useEffect } from 'react';

const UpdateRoleModal = ({ isOpen, onClose, onConfirm, user, rolesList, loading }) => {
    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => {
        if (user && user.role) {
            setSelectedRole(user.role.role_code);
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const handleConfirm = () => {
        if (selectedRole && selectedRole !== user.role.role_code) {
            onConfirm(user.user_code, selectedRole);
        } else {
            onClose();
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h3>Cambiar Rol de Usuario</h3>
                <p>Estás editando el rol de <strong>{user.user_name} {user.user_lastname}</strong>.</p>

                <div className="form-group">
                    <label htmlFor="role-select">Nuevo Rol:</label>
                    <select
                        id="role-select"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(Number(e.target.value))}
                        disabled={loading || rolesList.length === 0}
                    >
                        {rolesList.map(role => (
                            <option key={role.role_code} value={role.role_code}>
                                {role.role_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
                    <button className="btn btn-primary" onClick={handleConfirm} disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateRoleModal;