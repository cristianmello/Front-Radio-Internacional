import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '../../../hooks/UseAuth';
import Url from '../../../helpers/Url';

// Helper para obtener el valor a mostrar, ya sea de un string de ruta o de una función.
const getDisplayValue = (log, accessor) => {
    if (typeof accessor === 'function') {
        return accessor(log);
    }
    return accessor.split('.').reduce((acc, part) => acc && acc[part], log);
};

const LogViewer = ({ title, endpoint, columns, csvEndpoint }) => {
    const { authFetch } = useAuth();
    const [data, setData] = useState({ logs: [], total: 0, totalPages: 1, page: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({ from: '', to: '' });

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({ page });
        if (filters.from) params.append('from', filters.from);
        if (filters.to) params.append('to', filters.to);

        try {
            const res = await authFetch(`${Url.url}${endpoint}?${params.toString()}`);
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Error al cargar los logs.');
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [authFetch, endpoint, page, filters]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleExport = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.from) params.append('from', filters.from);
        if (filters.to) params.append('to', filters.to);
        const queryString = params.toString();

        try {
            const res = await authFetch(`${Url.url}${csvEndpoint}?${queryString}`);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al generar el CSV.');
            }

            const disposition = res.headers.get('content-disposition');
            let filename = 'export.csv';
            if (disposition && disposition.includes('attachment')) {
                const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            alert(`Error al descargar: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="log-section">
            <h3>{title}</h3>
            <div className="log-filters">
                <label>Desde:</label>
                <input type="date" name="from" value={filters.from} onChange={handleFilterChange} />
                <label>Hasta:</label>
                <input type="date" name="to" value={filters.to} onChange={handleFilterChange} />
                <button className="btn btn-primary" onClick={fetchLogs} disabled={loading}>Filtrar</button>
                <button className="btn btn-secondary" onClick={handleExport} disabled={loading || !data.logs || data.logs.length === 0}>Exportar a CSV</button>
            </div>

            {/* Muestra "Cargando..." solo la primera vez */}
            {loading && (!data.logs || data.logs.length === 0) && <p>Cargando...</p>}

            {error && <p style={{ color: 'red' }}>Error: {error}</p>}

            {/* Muestra la tabla si hay datos, incluso si está cargando la página siguiente */}
            {data.logs && data.logs.length > 0 && (
                <>
                    <table className={`user-table ${loading ? 'stale-data' : ''}`}>
                        <thead>
                            <tr>
                                {columns.map(col => <th key={col.header}>{col.header}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {data.logs.map((log, index) => (
                                <tr key={log.log_id || index}>
                                    {columns.map(col => (
                                        <td key={col.header}>
                                            {getDisplayValue(log, col.accessor) || 'N/A'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="pagination-controls">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={loading || data.page === 1}>Anterior</button>
                        <span>Página {data.page} de {data.totalPages}</span>
                        <button onClick={() => setPage(p => p + 1)} disabled={loading || data.page >= data.totalPages}>Siguiente</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default LogViewer;