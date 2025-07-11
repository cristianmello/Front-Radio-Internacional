// src/components/editing/EditModal.jsx
import React, { useState, useEffect, useRef } from 'react';

export default function EditModal({ isOpen, type, values = {}, options = {}, onSave, onClose }) {
    const [formState, setFormState] = useState(() => ({ ...values }));
    const modalRef = useRef(null);

    // Sincronizar estado del formulario cuando cambian los valores
    useEffect(() => {
        setFormState({ ...values });
    }, [values]);

    // Cerrar modal con tecla Esc
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    // Cerrar al hacer clic fuera del contenido
    const handleOverlayClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const handleChange = (field) => (e) => {
        setFormState(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handlePreset = (field, val) => {
        setFormState(prev => ({ ...prev, [field]: val }));
    };

    return (
        <div className="modal-edit open" onClick={handleOverlayClick}>
            <div className="modal-edit-content" ref={modalRef}>
                <h3>Editar {type}</h3>

                {type === 'image' && (
                    <>
                        <img src={formState.src || ''} className="edit-image-preview" alt={formState.alt || ''} onError={(e) => { e.target.src = ''; }} />
                        <div className="edit-field">
                            <label>URL de la imagen:</label>
                            <input type="text" value={formState.src || ''} onChange={handleChange('src')} />
                        </div>
                        <div className="edit-field">
                            <label>Texto alternativo:</label>
                            <input type="text" value={formState.alt || ''} onChange={handleChange('alt')} />
                        </div>
                        {Array.isArray(options.presets) && (
                            <div className="edit-field">
                                <label>Seleccionar tipo de imagen:</label>
                                <div className="image-presets">
                                    {options.presets.map(cat => (
                                        <button key={cat} type="button" onClick={() => handlePreset('src', `https://source.unsplash.com/random/800x500/?${cat}&${Date.now()}`)}>
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {type === 'category' && Array.isArray(options.categories) && (
                    <div className="edit-field">
                        <label>Categoría:</label>
                        <select value={formState.text || ''} onChange={handleChange('text')}>
                            {options.categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                )}

                {(type === 'date' || type === 'read-time' || type === 'duration') && (
                    <>
                        <div className="edit-field">
                            <label>{options.label || ''}</label>
                            <input type="text" value={formState.text || ''} onChange={handleChange('text')} />
                        </div>
                        {Array.isArray(options.quickDates) && (
                            <div className="edit-field quick-dates">
                                <label>Fechas rápidas:</label>
                                <div className="quick-options">
                                    {options.quickDates.map(val => (
                                        <button key={val} type="button" onClick={() => handlePreset('text', val)}>{val}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {type === 'text' && (
                    <div className="edit-field">
                        <label>Texto:</label>
                        <textarea value={formState.html || ''} onChange={handleChange('html')} />
                    </div>
                )}

                {type === 'link' && (
                    <div className="edit-field">
                        <label>{options.label || 'URL'}:</label>
                        <input type="text" value={formState.href || ''} onChange={handleChange('href')} />
                    </div>
                )}

                <div className="edit-buttons">
                    <button className="btn-cancel" type="button" onClick={onClose}>Cancelar</button>
                    <button className="btn-save" type="button" onClick={() => onSave(formState)}>Guardar</button>
                </div>
            </div>
        </div>
    );
}