import React, { useEffect, useState } from 'react';

const API_URL_CSV = 'https://backend-radio-internacional-production.up.railway.app/api/users/history/csv';

const RoleChangeCSV = () => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [userCodeFilter, setUserCodeFilter] = useState('');
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(false);

    // Genera el CSV y lo descarga
    const handleDownload = async () => {
        setError(null);
        setDownloading(true);

        const params = new URLSearchParams({
            user_code: userCodeFilter,
            from: fromDate,
            to: toDate,
        });

        try {
            const res = await fetch(`${API_URL_CSV}?${params.toString()}`, {
                credentials: 'include',
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Error al generar CSV');
            }
            const blob = await res.blob();
            // Obtener nombre de archivo desde headers o usar uno por defecto
            const disposition = res.headers.get('Content-Disposition');
            let fileName = 'historial-roles.csv';
            if (disposition && disposition.includes('filename=')) {
                fileName = disposition.split('filename=')[1].replace(/["']/g, '');
            }
            // Crear enlace de descarga
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="admin-container">
            <h1>Exportar Historial de Cambios de Rol (CSV)</h1>

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
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <button onClick={handleDownload} disabled={downloading}>
                {downloading ? 'Generando CSV...' : 'Descargar CSV'}
            </button>
        </div>
    );
};

export default RoleChangeCSV;
