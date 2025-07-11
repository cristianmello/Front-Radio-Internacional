// src/components/editing/EditModal.jsx
import React from "react";

const EditModal = ({
    isOpen, onClose, onSubmit, fields // fields: [{label,id,type,value},...]
}) => {
    if (!isOpen) return null;
    const handleSubmit = e => {
        e.preventDefault();
        const result = {};
        fields.forEach(f => {
            result[f.id] = e.target[f.id].value;
        });
        onSubmit(result);
    };

    return (
        <div className="modal-edit open" id="editModal">
            <div className="modal-edit-content">
                <div className="modal-edit-title">Editar Contenido</div>
                <form className="edit-form" onSubmit={handleSubmit}>
                    {fields.map(f => (
                        <div className="edit-field" key={f.id}>
                            <label htmlFor={f.id}>{f.label}:</label>
                            {f.type === "textarea" ? (
                                <textarea id={f.id} defaultValue={f.value}></textarea>
                            ) : (
                                <input
                                    type={f.type}
                                    id={f.id}
                                    defaultValue={f.value}
                                />
                            )}
                        </div>
                    ))}
                    <div className="edit-buttons">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditModal;
