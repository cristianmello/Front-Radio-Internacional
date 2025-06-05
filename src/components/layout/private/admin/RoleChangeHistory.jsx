import React, { useEffect, useState } from 'react';

const API_URL = 'https://backend-radio-internacional-production.up.railway.app/api/users/history';

const RoleChangeHistory = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [userCodeFilter, setUserCodeFilter] = useState('');
  const [changedByFilter, setChangedByFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para cargar historial desde backend
  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page,
      limit,
      user_code: userCodeFilter,
      changed_by: changedByFilter,
      from: fromDate,
      to: toDate,
    });

    try {
      const res = await fetch(`${API_URL}?${params.toString()}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al obtener historial');
      }
      setLogs(data.logs);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, fromDate, toDate, userCodeFilter, changedByFilter]);

  return (
    <div className="admin-container">
      <h1>Historial de Cambios de Rol</h1>

      {/* Filtros de fecha y usuario */}
      <div className="filters">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          placeholder="Desde"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          placeholder="Hasta"
        />
        <input
          type="number"
          placeholder="Filtrar por user_code"
          value={userCodeFilter}
          onChange={(e) => setUserCodeFilter(e.target.value)}
        />
        <input
          type="number"
          placeholder="Filtrar por changed_by (admin)"
          value={changedByFilter}
          onChange={(e) => setChangedByFilter(e.target.value)}
        />
        <button onClick={() => setPage(1)}>Aplicar filtros</button>
      </div>

      {loading ? (
        <p>Cargando historial...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Code</th>
                <th>Rol Anterior</th>
                <th>Nuevo Rol</th>
                <th>Modificado Por</th>
                <th>Fecha de Cambio</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5">No hay registros.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.user.user_code}</td>
                    <td>{log.oldRole?.role_name || '—'}</td>
                    <td>{log.newRole?.role_name || '—'}</td>
                    <td>{log.changer?.user_name || '—'}</td>
                    <td>{new Date(log.changed_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Paginación */}
          <div className="pagination">
            {Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setPage(pg)}
                className={pg === page ? 'active-page' : ''}
              >
                {pg}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button onClick={() => window.location.assign('/admin/usuarios/historial-roles/csv')}>
              Descargar CSV
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RoleChangeHistory;
