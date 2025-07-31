// src/components/layout/public/AddCategoryModal.jsx
import React, { useState } from 'react';
import { useNotification } from '../../../../context/NotificationContext';

export default function AddCategoryModal({ onConfirm, onCancel }) {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { showNotification } = useNotification();

    // Función para generar un slug a partir de un texto
    const generateSlug = (text) => {
        return text
            .toString()
            .normalize('NFD') // Normaliza caracteres unicode
            .replace(/[\u0300-\u036f]/g, '') // Elimina diacríticos (acentos)
            .toLowerCase() // Convierte a minúsculas
            .trim() // Elimina espacios al inicio y final
            .replace(/\s+/g, '-') // Reemplaza espacios con guiones
            .replace(/[^\w-]+/g, '') // Elimina caracteres no alfanuméricos excepto guiones
            .replace(/--+/g, '-'); // Reemplaza múltiples guiones con uno solo
    };

    const handleChangeName = (e) => {
        const newName = e.target.value;
        setName(newName);
        setSlug(generateSlug(newName)); // Genera el slug automáticamente
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!name.trim()) {
            setError('El nombre de la categoría es obligatorio');
            return;
        }

        setIsLoading(true);
        setError(''); // Limpiar errores previos

        try {
            const result = await onConfirm({
                category_name: name.trim(),
                category_slug: slug.trim()
            });

            if (result.success) {
                showNotification('¡Categoría creada exitosamente!', 'success');
                // onCancel() se llama desde el componente padre (Header)
            } else {
                // Muestra el error de la API en el formulario y en una notificación
                const errorMessage = result.message || 'No se pudo crear la categoría.';
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
        <div className="modal-edit active" id="categoryModal">
            <div className="modal-edit-content">
                <div className="modal-edit-title">Crear Nueva Categoría</div>
                <form id="categoryForm" className="edit-form" onSubmit={handleSubmit}>
                    {error && <p className="form-error">{error}</p>}

                    <div className="edit-field">
                        <label htmlFor="categoryName">
                            Nombre de la Categoría:
                        </label>
                        <input
                            type="text"
                            id="categoryName"
                            placeholder="Escribe el nombre"
                            value={name}
                            onChange={handleChangeName}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="edit-field">
                        <label htmlFor="categorySlug">
                            Slug:
                        </label>
                        <input
                            type="text"
                            id="categorySlug"
                            placeholder="Se generará automáticamente"
                            value={slug}
                            readOnly
                            disabled
                            className="disabled-input"
                        />
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
                            type="submit"
                            className="btn-save"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                                'Crear'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}