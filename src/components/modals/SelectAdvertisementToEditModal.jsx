import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import useAdvertisements from '../../hooks/useAdvertisements';
import { format } from 'date-fns';

/**
 * Modal para buscar y seleccionar una publicidad para editar.
 */
export default function SelectAdvertisementToEditModal({ onSelect, onCancel }) {
    const [filters, setFilters] = useState({ page: 1, limit: 10, sortBy: 'updated_at', order: 'DESC' });
    const [searchTerm, setSearchTerm] = useState('');
    const { advertisements, pagination, loading, error } = useAdvertisements(filters);

    // Efecto Debounce para la búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, page: 1, search: searchTerm }));
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    return (
        <div className="modal-edit active" id="selectAdModal">
            <div className="modal-edit-content">
                <div className="modal-edit-title">Seleccionar Publicidad para Editar</div>

                <div className="search-bar" style={{ marginBottom: '1rem' }}>
                    <input
                        type="search"
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>

                {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><i className="fas fa-spinner fa-spin fa-2x"></i></div>}
                {error && <p className="error-message">{error}</p>}

                {!loading && !error && (
                    <ul className="item-list">
                        {advertisements.length > 0 ? (
                            advertisements.map(ad => (
                                <li key={ad.ad_id} className="item-list-entry">
                                    <div className="item-info">
                                        <strong>{ad.ad_name}</strong>
                                        <small>ID: {ad.ad_id} | Tipo: {ad.ad_type} | Estado: {ad.ad_is_active ? 'Activo' : 'Borrador'}</small>
                                        {(ad.ad_start_date || ad.ad_end_date) && (
                                            <small style={{ display: 'block', color: '#555', marginTop: '4px' }}>
                                                <i className="fas fa-calendar-alt" style={{ marginRight: '5px' }}></i>
                                                Vigencia: 
                                                {ad.ad_start_date ? ` ${format(new Date(ad.ad_start_date), 'dd/MM/yy HH:mm')}` : ' Indefinida'}
                                                {ad.ad_end_date ? ` - ${format(new Date(ad.ad_end_date), 'dd/MM/yy HH:mm')}` : ''}
                                            </small>
                                        )}
                                    </div>
                                    <button className="btn-select" onClick={() => onSelect(ad)}>
                                        Editar
                                    </button>
                                </li>
                            ))
                        ) : (
                            <p>No se encontraron anuncios.</p>
                        )}
                    </ul>
                )}

                {pagination && pagination.totalPages > 1 && (
                    <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                        <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1 || loading}>Anterior</button>
                        <span>Página {pagination.currentPage} de {pagination.totalPages}</span>
                        <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages || loading}>Siguiente</button>
                    </div>
                )}

                <div className="edit-buttons" style={{ marginTop: '1.5rem' }}>
                    <button type="button" className="btn-cancel" onClick={onCancel}>Cerrar</button>
                </div>
            </div>
        </div>
    );
}

SelectAdvertisementToEditModal.propTypes = {
    onSelect: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};