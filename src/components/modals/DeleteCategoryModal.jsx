// src/components/layout/public/DeleteCategoryModal.jsx
import React, { useState } from 'react';
import { useNotification } from '../../context/NotificationContext';

export default function DeleteCategoryModal({ categories, onConfirm, onCancel }) {
    const [selectedId, setSelectedId] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { showNotification } = useNotification();

    const handleDelete = async () => {
        if (!selectedId) {
            setError('Selecciona una categoría para eliminar.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await onConfirm(selectedId);

            if (result.success) {
                showNotification('Categoría eliminada con éxito.', 'success');
                // El padre (Header) se encarga de cerrar el modal
            } else {
                const errorMessage = result.message || 'No se pudo eliminar la categoría.';
                setError(errorMessage);
                showNotification(errorMessage, 'error');
            }
        } catch (err) {
            const errorMessage = err.message || 'Error inesperado.';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-edit active" id="deleteCategoryModal">
            <div className="modal-edit-content">
                <div className="modal-edit-title">Eliminar Categoría</div>
                <div className="edit-form">
                    {error && <p className="form-error">{error}</p>}

                    <div className="edit-field">
                        <label>Selecciona la categoría:</label>
                        <select
                            value={selectedId || ''}
                            onChange={e => {
                                setError('');
                                setSelectedId(e.target.value);
                            }}
                            disabled={isLoading}
                        >
                            <option value="" disabled>-- Elige una --</option>
                            {categories
                                .filter(cat => cat.category_slug !== 'inicio') // Opcional: filtrar "Inicio"
                                .map(cat => (
                                    <option key={cat.category_code} value={cat.category_code}>
                                        {cat.category_name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="edit-buttons">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="btn-save"
                            onClick={handleDelete}
                            disabled={isLoading || !selectedId}
                        >
                            {isLoading ? (
                                <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                                'Eliminar'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
