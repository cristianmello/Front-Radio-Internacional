// src/components/layout/public/DeleteCategoryModal.jsx
import React, { useState } from 'react';

export default function DeleteCategoryModal({ categories, onConfirm, onCancel }) {
    const [selectedId, setSelectedId] = useState(null);
    const [error, setError] = useState('');

    const handleDelete = () => {
        if (!selectedId) {
            setError('Selecciona una categoría para eliminar.');
            return;
        }
        onConfirm(selectedId);
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
                        >
                            <option value="" disabled>-- Elige una --</option>
                            {categories.map(cat => (
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
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="btn-save"
                            onClick={handleDelete}
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
