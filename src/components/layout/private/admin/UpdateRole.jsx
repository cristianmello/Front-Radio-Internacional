// src/components/admin/UpdateRole.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Base URL de tu backend
const API_BASE = 'https://backend-radio-internacional-production.up.railway.app/api';

const UpdateRole = () => {
    const { user_code } = useParams();
    const navigate = useNavigate();

    const [userData, setUserData] = useState(null);
    const [roles, setRoles] = useState([]);
    const [newRole, setNewRole] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1) Traer datos del usuario y lista de roles
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // a) GET /api/users/:user_code
                const resUser = await fetch(`${API_BASE}/users/${user_code}`, {
                    credentials: 'include',
                });
                const dataUser = await resUser.json();
                if (!resUser.ok) {
                    throw new Error(dataUser.message || 'Usuario no encontrado');
                }
                setUserData(dataUser.data); // Espera { data: user }

                // b) GET /api/roles  (asegúrate de tener este endpoint en tu backend)
                const resRoles = await fetch(`${API_BASE}/roles`, {
                    credentials: 'include',
                });
                const dataRoles = await resRoles.json();
                if (!resRoles.ok) {
                    throw new Error(dataRoles.message || 'No se pudo cargar lista de roles');
                }
                setRoles(dataRoles.roles); // Espera { roles: [ { role_code, role_name }, … ] }

                // c) Preseleccionar rol actual
                setNewRole(dataUser.data.role.role_code);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user_code]);

    // 2) Enviar formulario para cambiar rol
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // PUT /api/users/role/:user_code
            const res = await fetch(`${API_BASE}/users/role/${user_code}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ new_role_code: newRole }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'No se pudo cambiar el rol');
            }

            alert(data.message);
            navigate('/admin/usuarios');
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Cargando datos del usuario…</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!userData) return <p>Usuario no encontrado.</p>;

    return (
        <div className="admin-container">
            <h1>Editar Rol de Usuario</h1>
            <p>
                <strong>Código:</strong> {userData.user_code} <br />
                <strong>Nombre:</strong> {userData.user_name} {userData.user_lastname}
            </p>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Rol Actual:</label>
                    <input
                        type="text"
                        value={userData.role?.role_name || '—'}
                        disabled
                    />
                </div>
                <div className="form-group">
                    <label>Nuevo Rol:</label>
                    <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        required
                    >
                        <option value="">Seleccionar rol</option>
                        {roles.map((r) => (
                            <option key={r.role_code} value={r.role_code}>
                                {r.role_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <button type="submit" disabled={loading}>
                        {loading ? 'Guardando…' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateRole;

