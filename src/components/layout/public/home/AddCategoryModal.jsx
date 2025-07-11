// src/components/layout/public/AddCategoryModal.jsx
import React, { useState } from 'react';

export default function AddCategoryModal({ onConfirm, onCancel }) {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [error, setError] = useState('');

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

    const handleSubmit = e => {
        e.preventDefault();
        if (!name.trim()) {
            setError('El nombre de la categoría es obligatorio');
            return;
        }
        // Ya no es necesario validar la longitud mínima del slug si no es editable,
        // porque siempre se generará a partir del nombre y si el nombre es corto, el slug también lo será.
        // Si aún quisieras una validación de longitud para el slug, se podría hacer aquí.

        onConfirm({
            category_name: name.trim(),
            category_slug: slug.trim() || undefined
        });
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
                            readOnly // Hace el campo de solo lectura
                            disabled // Deshabilita el campo para interacción
                            className="disabled-input" // Opcional: para estilos CSS de deshabilitado
                        />
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
                            type="submit"
                            className="btn-save"
                        >
                            Crear
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}