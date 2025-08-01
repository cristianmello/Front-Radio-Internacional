import React, { useState } from 'react';
import LogViewer from '../../components/ui/admin/LogViewer';

const LogsPage = () => {
    const [activeTab, setActiveTab] = useState('role_changes');

    const roleChangeColumns = [
        { header: 'Usuario Afectado', accessor: (log) => `${log.user.user_name} (${log.user.user_mail || 'N/A'})` },

        { header: 'Rol Anterior', accessor: 'oldRole.role_name' },
        { header: 'Rol Nuevo', accessor: 'newRole.role_name' },
        { header: 'Modificado por', accessor: (log) => `${log.changer.user_name} (${log.changer.user_mail || 'N/A'})` },
        { header: 'Fecha', accessor: 'changed_at' },
    ];

    // Columnas para "Inicios de Sesión"
    const loginColumns = [
        { header: 'Usuario', accessor: (log) => `${log.user?.user_name || 'N/A'} (${log.user?.user_mail || 'N/A'})` },
        { header: 'Email usado', accessor: 'user_mail' },
        { header: 'IP', accessor: 'ip_address' },
        { header: 'Fecha', accessor: 'login_time' },
    ];

    // NUEVO: Columnas para "Registros"
    const registerColumns = [
        { header: 'Usuario', accessor: (log) => `${log.user?.user_name || 'N/A'} (${log.user?.user_mail || 'N/A'})` },
        { header: 'IP', accessor: 'ip_address' },
        { header: 'Fecha de Registro', accessor: 'register_time' },
    ];

    return (
        <div className="logs-page-container">
            <h2>Logs del Sistema</h2>
            <div className="tabs-nav">
                <button onClick={() => setActiveTab('role_changes')} className={activeTab === 'role_changes' ? 'active' : ''}>Cambios de Rol</button>
                <button onClick={() => setActiveTab('logins')} className={activeTab === 'logins' ? 'active' : ''}>Inicios de Sesión</button>
                <button onClick={() => setActiveTab('registers')} className={activeTab === 'registers' ? 'active' : ''}>Registros</button>
            </div>

            <div className="tabs-content">
                {activeTab === 'role_changes' && (
                    <LogViewer
                        title="Historial de Cambios de Rol"
                        endpoint="/api/users/role-history"
                        columns={roleChangeColumns}
                        csvEndpoint="/api/users/role-history/export"
                    />
                )}
                {activeTab === 'logins' && (
                    <LogViewer
                        title="Historial de Inicios de Sesión"
                        endpoint="/api/users/login-history"
                        columns={loginColumns}
                        csvEndpoint="/api/users/login-history/export"
                    />
                )}
                {activeTab === 'registers' && (
                    <LogViewer
                        title="Historial de Registros de Usuarios"
                        endpoint="/api/users/register-history"
                        columns={registerColumns}
                        csvEndpoint="/api/users/register-history/export"
                    />
                )}
            </div>
        </div>
    );
};

export default LogsPage;