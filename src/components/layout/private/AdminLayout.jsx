import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import useAuth from '../../../hooks/UseAuth';

const AdminLayout = () => {
    const { auth, roles, loading } = useAuth();

    // Mientras se verifica la sesión, mostramos un mensaje de carga.
    if (loading) {
        return <p style={{ padding: '2rem' }}>Verificando permisos...</p>;
    }

    // Si no está logueado, lo mandamos a la página de login.
    if (!auth || !auth.user_code) {
        return <Navigate to="/login" replace />;
    }

    // Verificamos si tiene el rol adecuado.
    const isAdmin = roles && roles.some(role => ['admin', 'superadmin'].includes(role));

    // Si no es admin, lo mandamos a la página de inicio.
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    // Si es admin, mostramos el layout del panel.
    return (
        <div className="admin-panel-layout">
            <header className="admin-panel-header">
                <div className="container">
                    <h1>Panel de Administración</h1>
                    <nav>
                        <Link to="/admin/users">Usuarios</Link>
                        <Link to="/admin/logs">Logs</Link>
                        <Link to="/perfil">Volver a mi Perfil</Link>
                    </nav>
                </div>
            </header>
            <main className="admin-panel-content">
                <div className="container">
                    {/* Aquí se renderizarán UserListPage, LogsPage, etc. */}
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;