import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://backend-radio-internacional-production.up.railway.app/api/users';

const UserList = () => {
    const navigate = useNavigate();

    // Estados para datos, paginación y filtros
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [isVipFilter, setIsVipFilter] = useState('');
    const [isVerifiedFilter, setIsVerifiedFilter] = useState('');
    const [sortField, setSortField] = useState('user_code');
    const [sortDir, setSortDir] = useState('ASC');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Función para cargar usuarios desde el backend
    const fetchUsers = async () => {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
            page,
            limit,
            search,
            sort: sortField,
            dir: sortDir,
            role_name: roleFilter,
            is_vip: isVipFilter,
            is_verified: isVerifiedFilter,
        });

        try {
            const res = await fetch(`${API_URL}?${params.toString()}`, {
                credentials: 'include', // si tu backend requiere cookies/jwt
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Error al obtener usuarios');
            }
            setUsers(data.data.users);
            setTotal(data.data.total);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Cargar usuarios cada vez que cambian filtros/página
    useEffect(() => {
        fetchUsers();
    }, [page, limit, search, roleFilter, isVipFilter, isVerifiedFilter, sortField, sortDir]);

    // Maneja cambio de página
    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    // Navega a la pantalla de “Editar rol” pasándole el user_code
    const goToUpdateRole = (userCode) => {
        navigate(`/admin/usuarios/${userCode}/actualizar-rol`);
    };

    return (
        <div className="admin-container">
            <h1>Lista de Usuarios</h1>

            {/* Filtros básicos */}
            <div className="filters">
                <input
                    type="text"
                    placeholder="Buscar por nombre, apellido o correo"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="">Todos los roles</option>
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="superadmin">Superadmin</option>
                    {/* Agrega más opciones según tu modelo de roles */}
                </select>
                <select value={isVipFilter} onChange={(e) => setIsVipFilter(e.target.value)}>
                    <option value="">VIP (cualquiera)</option>
                    <option value="true">VIP</option>
                    <option value="false">No VIP</option>
                </select>
                <select value={isVerifiedFilter} onChange={(e) => setIsVerifiedFilter(e.target.value)}>
                    <option value="">Verificado (cualquiera)</option>
                    <option value="true">Verificado</option>
                    <option value="false">No Verificado</option>
                </select>
                <button onClick={() => setPage(1)}>Aplicar filtros</button>
            </div>

            {loading ? (
                <p>Cargando usuarios...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : (
                <>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th onClick={() => { setSortField('user_code'); setSortDir(sortDir === 'ASC' ? 'DESC' : 'ASC'); }}>
                                    Código {sortField === 'user_code' && (sortDir === 'ASC' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => { setSortField('user_name'); setSortDir(sortDir === 'ASC' ? 'DESC' : 'ASC'); }}>
                                    Nombre {sortField === 'user_name' && (sortDir === 'ASC' ? '▲' : '▼')}
                                </th>
                                <th>Apellido</th>
                                <th>Correo</th>
                                <th>VIP</th>
                                <th>Verificado</th>
                                <th>Fecha creación</th>
                                <th>Rol actual</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="9">No se encontraron usuarios.</td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.user_code}>
                                        <td>{user.user_code}</td>
                                        <td>{user.user_name}</td>
                                        <td>{user.user_lastname}</td>
                                        <td>{user.user_mail}</td>
                                        <td>{user.is_vip ? 'Sí' : 'No'}</td>
                                        <td>{user.is_verified ? 'Sí' : 'No'}</td>
                                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td>{user.role?.role_name || '—'}</td>
                                        <td>
                                            <button onClick={() => goToUpdateRole(user.user_code)}>
                                                Editar Rol
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Paginación básica */}
                    <div className="pagination">
                        {Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1).map((pg) => (
                            <button
                                key={pg}
                                onClick={() => handlePageChange(pg)}
                                className={pg === page ? 'active-page' : ''}
                            >
                                {pg}
                            </button>
                        ))}
                    </div>

                    {/* Enlace a historial de cambios de rol */}
                    <div style={{ marginTop: '1rem' }}>
                        <button onClick={() => navigate('/admin/usuarios/historial-roles')}>
                            Ver Historial de Cambios de Rol
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserList;
