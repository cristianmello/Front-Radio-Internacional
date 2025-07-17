import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { AD_FORMATS } from '../../../../helpers/adFormats.js';
import { compressImage  } from '../../../../helpers/ImageCompressor.jsx';

/**
 * Modal para crear un nuevo anuncio, con el estilo y funcionalidad del modal de artículos.
 * @param {function} onSave - Función que se llama con el FormData al guardar.
 * @param {function} onCancel - Función que se llama para cerrar el modal.
 */
const CreateAdvertisementModal = ({ onSave, onCancel }) => {
    const modalContentRef = useRef(null);

    const [adName, setAdName] = useState('');
    const [adType, setAdType] = useState('image');
    const [adFormat, setAdFormat] = useState('mrec');
    const [adImageFile, setAdImageFile] = useState(null);
    const [adTargetUrl, setAdTargetUrl] = useState('');
    const [adScriptContent, setAdScriptContent] = useState('');
    const [adStartDate, setAdStartDate] = useState('');
    const [adEndDate, setAdEndDate] = useState('');
    const [isAdActive, setIsAdActive] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (formError && modalContentRef.current) {
            modalContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [formError]);

    const handleImageFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            setAdImageFile(null);
            return;
        }

        setIsSubmitting(true); // Bloquea los botones mientras se procesa
        setFormError('');
        try {
            // Comprimimos la imagen ANTES de guardarla en el estado
            const compressedFile = await compressImage(file);
            setAdImageFile(compressedFile);
        } catch (error) {
            setFormError("Hubo un error al procesar la imagen.");
            setAdImageFile(null);
        } finally {
            setIsSubmitting(false); // Desbloquea los botones
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        // Validación del lado del cliente
        if (!adName.trim()) {
            setFormError("El nombre del anuncio es obligatorio.");
            return;
        }
        if (adType === 'image' && (!adImageFile || !adTargetUrl.trim())) {
            setFormError("Para anuncios de imagen, el archivo y la URL de destino son obligatorios.");
            return;
        }
        if (adType === 'script' && !adScriptContent.trim()) {
            setFormError("Para anuncios de script, el contenido es obligatorio.");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();

        // Construimos el FormData con los datos del estado
        formData.append('ad_name', adName);
        formData.append('ad_type', adType);
        formData.append('ad_is_active', 'true');

        if (adType === 'image') {
            formData.append('ad_format', adFormat);
            formData.append('ad_image_file', adImageFile);
            formData.append('ad_target_url', adTargetUrl);
        }
        if (adType === 'script') {
            formData.append('ad_script_content', adScriptContent);
        }
        if (adStartDate) formData.append('ad_start_date', adStartDate);
        if (adEndDate) formData.append('ad_end_date', adEndDate);

        const result = await onSave(formData);

        if (result && !result.success) {
            setFormError(result.message || "Ocurrió un error inesperado.");
        } else {
            onCancel(); // Cierra el modal en caso de éxito
        }
        setIsSubmitting(false);
    };

    return (
        <div className="modal-edit active" id="createAdModal">
            <div className="modal-edit-content" ref={modalContentRef}>
                <div className="modal-edit-title">Crear Nueva Publicidad</div>
                <form onSubmit={handleSubmit} className="edit-form" encType="multipart/form-data">

                    {formError && <p className="error-message">{formError}</p>}

                    <h4>Información Básica</h4>
                    <div className="edit-field">
                        <label>Nombre (interno):</label>
                        <input type="text" value={adName} onChange={(e) => setAdName(e.target.value)} required />
                    </div>
                    <div className="edit-field">
                        <label>Tipo de Anuncio:</label>
                        <div className="radio-group" style={{ display: 'flex', gap: '1rem', padding: '0.5rem 0' }}>
                            <label><input type="radio" value="image" checked={adType === 'image'} onChange={e => setAdType(e.target.value)} /> Imagen</label>
                            <label><input type="radio" value="script" checked={adType === 'script'} onChange={e => setAdType(e.target.value)} /> Script</label>
                        </div>
                    </div>

                    {adType === 'image' && (
                        <>
                            <h4>Detalles del Anuncio de Imagen</h4>
                            <div className="edit-field">
                                <label>Formato / Tamaño:</label>
                                <select value={adFormat} onChange={(e) => setAdFormat(e.target.value)} required>
                                    {Object.entries(AD_FORMATS).map(([key, { width, height }]) => (
                                        key !== 'default' && <option key={key} value={key}>{`${key.charAt(0).toUpperCase() + key.slice(1)} (${width}x${height})`}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="edit-field">
                                <label>Archivo de Imagen:</label>
                                <input type="file" name="ad_image_file" accept="image/*" onChange={handleImageFileChange} disabled={isSubmitting}
                                />
                            </div>
                            {adImageFile && (
                                <div className="image-preview">
                                    <img src={URL.createObjectURL(adImageFile)} alt="Vista previa" />
                                </div>
                            )}
                            <div className="edit-field">
                                <label>URL de Destino:</label>
                                <input type="url" placeholder="https://ejemplo.com" value={adTargetUrl} onChange={(e) => setAdTargetUrl(e.target.value)} />
                            </div>
                        </>
                    )}

                    {adType === 'script' && (
                        <>
                            <h4>Detalles del Anuncio de Script</h4>
                            <div className="edit-field">
                                <label>Contenido del Script:</label>
                                <textarea rows="6" placeholder="Pegar aquí el código del script, ej: de Google AdSense" value={adScriptContent} onChange={(e) => setAdScriptContent(e.target.value)} />
                            </div>
                        </>
                    )}

                    <h4>Programación y Estado</h4>
                    <div className="edit-field">
                        <label>Fecha de Inicio (Opcional):</label>
                        <input type="datetime-local" value={adStartDate} onChange={(e) => setAdStartDate(e.target.value)} />
                    </div>
                    <div className="edit-field">
                        <label>Fecha de Fin (Opcional):</label>
                        <input type="datetime-local" value={adEndDate} onChange={(e) => setAdEndDate(e.target.value)} />
                    </div>

                    <div className="edit-buttons">
                        <button type="button" className="btn-cancel" onClick={onCancel} disabled={isSubmitting}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <span style={{ marginLeft: '8px' }}>Guardando...</span>
                                </>
                            ) : "Guardar Anuncio"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

CreateAdvertisementModal.propTypes = {
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default CreateAdvertisementModal;