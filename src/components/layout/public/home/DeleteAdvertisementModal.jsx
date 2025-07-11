import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import useAdvertisements from '../../../../hooks/useAdvertisements';
import useAuth from '../../../../hooks/UseAuth';
import Url from '../../../../helpers/Url';

/**
 * Modal para listar y eliminar anuncios permanentemente.
 * Muestra el rango de fechas de la campaña en lugar del ID.
 */
export default function DeleteAdvertisementModal({ onCancel }) {
    const [filters, setFilters] = useState({ page: 1, limit: 10, sortBy: 'updated_at', order: 'DESC' });
    const { advertisements, pagination, loading, error, refresh } = useAdvertisements(filters);
    const { authFetch } = useAuth();

    const [deletingId, setDeletingId] = useState(null);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [localError, setLocalError] = useState(null);

    const handlePageChange = (newPage) => {
        if (pagination && newPage > 0 && newPage <= pagination.totalPages) {
            setFilters(prev => ({ ...prev, page: newPage }));
        }
    };

    const handleDelete = async (adId) => {
        setDeletingId(adId);
        setLocalError(null);
        try {
            const res = await authFetch(`${Url.url}/api/advertisements/${adId}`, {
                method: 'DELETE',
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || "Error eliminando el anuncio");
            refresh();
        } catch (err) {
            setLocalError(err.message);
        } finally {
            setDeletingId(null);
            setConfirmingDeleteId(null);
        }
    };

    return (
        <div className="modal-edit active" id="itemModal">
            <div className="modal-edit-content">
                <div className="modal-edit-title">
                    Eliminar Publicidad
                    <button onClick={refresh} disabled={loading} className="btn-refresh" title="Refrescar lista">
                        {loading && deletingId === null ? 'Cargando...' : 'Refrescar'}
                    </button>
                </div>

                {loading && !deletingId && <p>Cargando anuncios…</p>}
                {error && <p className="form-error">Error: {error}</p>}
                {localError && <p className="form-error">Error al eliminar: {localError}</p>}

                {!loading && !error && (
                    <ul className="item-list">
                        {advertisements.length > 0 ? (
                            advertisements.map((ad) => {
                                const id = ad.ad_id;
                                const isDeleting = deletingId === id;
                                const isConfirming = confirmingDeleteId === id;

                                return (
                                    <li key={id} className="item-list-entry">
                                        <div className="item-info">
                                            <h4 className="item-title">{ad.ad_name}</h4>

                                            {/* --- 2. LÍNEA MODIFICADA --- */}
                                            <small className="item-meta">
                                                {ad.ad_start_date && ` | Vigencia: ${format(new Date(ad.ad_start_date), 'dd/MM/yy - HH:mm')}`}
                                                {ad.ad_end_date && ` - ${format(new Date(ad.ad_end_date), 'dd/MM/yy - HH:mm')}`}
                                            </small>

                                        </div>

                                        <div className="draft-item-actions">
                                            {isConfirming ? (
                                                <>
                                                    <button className="btn-delete" onClick={() => handleDelete(id)} disabled={isDeleting}>
                                                        {isDeleting ? "Borrando..." : "Confirmar"}
                                                    </button>
                                                    <button className="btn-cancel-inline" onClick={() => setConfirmingDeleteId(null)} disabled={isDeleting}>
                                                        Cancelar
                                                    </button>
                                                </>
                                            ) : (
                                                <button className="btn-delete" onClick={() => setConfirmingDeleteId(id)} disabled={deletingId !== null}>
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                );
                            })
                        ) : (
                            <li className="no-items">No hay anuncios disponibles</li>
                        )}
                    </ul>
                )}

                {pagination && pagination.totalPages > 1 && (
                    <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                        <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1 || loading}>
                            Anterior
                        </button>
                        <span>Página {pagination.currentPage} de {pagination.totalPages}</span>
                        <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages || loading}>
                            Siguiente
                        </button>
                    </div>
                )}

                <div className="edit-buttons">
                    <button type="button" className="btn-cancel" onClick={onCancel}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

DeleteAdvertisementModal.propTypes = {
    onCancel: PropTypes.func.isRequired,
};