import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import useAdvertisements from '../../hooks/useAdvertisements';
import { format } from 'date-fns';
import { useNotification } from '../../context/NotificationContext';

export default function AddAdvertisementModal({ onSelect, onCancel }) {
    const { showNotification } = useNotification()

    const modalContentRef = useRef(null);

    const [filters, setFilters] = useState({ page: 1, limit: 5, sortBy: 'updated_at', order: 'DESC' });
    const [searchTerm, setSearchTerm] = useState('');
    const [itemStates, setItemStates] = useState({});
    const { advertisements, pagination, loading, error } = useAdvertisements(filters);

    useEffect(() => {
        if (error && modalContentRef.current) {
            modalContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [error]);

    // Efecto "Debounce" para la búsqueda:
    // Solo se actualiza el filtro (y se llama a la API) 300ms después de que el usuario deja de escribir.
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, page: 1, search: searchTerm }));
        }, 300);

        return () => clearTimeout(timer); // Limpia el temporizador si el usuario sigue escribiendo
    }, [searchTerm]);

    // Handlers para la paginación
    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleSelect = async (adId) => {
        setItemStates(prev => ({
            ...prev,
            [adId]: { status: 'loading' }
        }));

        let result;
        try {
            result = await onSelect(adId);
        } catch (err) {
            result = { success: false, message: err.message || 'Error desconocido' };
        }
        if (result?.success || result?.status === 'success') {
            showNotification('¡Publicidad añadida a la sección correctamente!', 'success');

            setItemStates(prev => ({
                ...prev,
                [adId]: { status: 'idle' }
            }));
            onCancel();
        } else {
            setItemStates(prev => ({
                ...prev,
                [adId]: {
                    status: 'error',
                    message: result?.message || 'Error al añadir la publicidad'
                }
            }));
        }
    };

    return (
        <div className="modal-edit active" id="addAdModal">
            <div className="modal-edit-content" ref={modalContentRef}>
                <div className="modal-edit-title">Seleccionar Publicidad para Añadir</div>

                <div className="search-bar" style={{ marginBottom: '1rem' }}>
                    <input
                        type="search"
                        placeholder="Buscar anuncio por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>

                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                        <i className="fas fa-spinner fa-spin fa-2x"></i>
                    </div>
                )}
                {error && <p className="error-message">{error}</p>}

                {!loading && !error && (
                    <ul className="item-list">
                        {advertisements.length > 0 ? (
                            advertisements.map(ad => {
                                const itemState = itemStates[ad.ad_id];
                                return (
                                    <li key={ad.ad_id} className="item-list-entry">
                                        <div className="item-info">
                                            <strong>{ad.ad_name}</strong>
                                            <small> | Tipo: {ad.ad_type} | Estado: {ad.ad_is_active ? 'Activo' : 'Borrador'}</small>

                                            {(ad.ad_start_date || ad.ad_end_date) && (
                                                <small style={{ display: 'block', color: '#555', marginTop: '4px' }}>
                                                    <i className="fas fa-calendar-alt" style={{ marginRight: '5px' }}></i>
                                                    Vigencia:
                                                    {ad.ad_start_date ? ` ${format(new Date(ad.ad_start_date), 'dd/MM/yy HH:mm')}` : ' Indefinida'}
                                                    {ad.ad_end_date ? ` - ${format(new Date(ad.ad_end_date), 'dd/MM/yy HH:mm')}` : ''}
                                                </small>
                                            )}

                                            {/* Mostramos el mensaje de error si existe para este ítem */}
                                            {itemState?.status === 'error' && (
                                                <p style={{ color: '#D32F2F', fontSize: '0.8rem', margin: '4px 0 0 0', background: '#FFEBEE', padding: '4px 8px', borderRadius: '4px' }}>
                                                    {itemState.message}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            className="btn-select"
                                            onClick={() => handleSelect(ad.ad_id)}
                                            disabled={itemState?.status === 'loading'}
                                        >
                                            {itemState?.status === 'loading' ? (
                                                <i className="fas fa-spinner fa-spin"></i>
                                            ) : (
                                                'Seleccionar'
                                            )}
                                        </button>
                                    </li>
                                );
                            })
                        ) : (
                            <p>No se encontraron anuncios con los criterios de búsqueda.</p>
                        )}
                    </ul>
                )}

                {pagination && pagination.totalPages > 1 && (
                    <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                        {/*
                        <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>
                            Anterior
                        </button>
                        <span>Página {pagination.currentPage} de {pagination.totalPages}</span>
                        <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages}>
                            Siguiente
                        </button>
                        */}
                        <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1 || loading}
                        >
                            Anterior
                        </button>

                        <span>Página {pagination.currentPage} de {pagination.totalPages}</span>

                        <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages || loading}
                        >
                            Siguiente
                        </button>
                    </div>
                )}

                <div className="edit-buttons" style={{ marginTop: '1.5rem' }}>
                    <button type="button" className="btn-cancel" onClick={onCancel}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

AddAdvertisementModal.propTypes = {
    onSelect: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};