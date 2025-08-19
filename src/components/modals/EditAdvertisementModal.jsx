import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import useAdvertisement from '../../hooks/useAdvertisement.js';
import { AD_FORMATS } from '../../helpers/adFormats.js';
import { compressImage } from '../../helpers/ImageCompressor.js';
import { useNotification } from '../../context/NotificationContext.jsx';

export default function EditAdvertisementModal({ advertisement: adToEdit, onSave, onCancel, onUpdateSuccess }) {
    const { showNotification } = useNotification();
    const modalContentRef = useRef(null);

    const { advertisement: initialAdData, loading, error } = useAdvertisement(adToEdit.ad_id);

    // Ref para guardar una "foto" de los datos iniciales y comparar qué ha cambiado.
    const initialDataRef = useRef(null);

    // 2. Estados para CADA campo del formulario.
    const [adName, setAdName] = useState('');
    const [adType, setAdType] = useState('image');
    const [adFormat, setAdFormat] = useState('');
    const [adImage, setAdImage] = useState(null); // Puede ser la URL existente (string) o un nuevo archivo (File).
    const [adTargetUrl, setAdTargetUrl] = useState('');
    const [adScriptContent, setAdScriptContent] = useState('');
    const [adStartDate, setAdStartDate] = useState('');
    const [adEndDate, setAdEndDate] = useState('');
    const [isAdActive, setIsAdActive] = useState(false);

    // Estados para la UI del modal.
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (formError && modalContentRef.current) {
            modalContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [formError]);

    // 3. Efecto para rellenar el formulario cuando los datos del hook llegan.
    useEffect(() => {
        if (initialAdData) {
            initialDataRef.current = initialAdData; // Guardamos la foto del estado inicial.

            // Rellenamos todos los estados del formulario.
            setAdName(initialAdData.ad_name || '');
            setAdType(initialAdData.ad_type || 'image');
            setAdFormat(initialAdData.ad_format || 'mrec');
            setAdImage(initialAdData.ad_image_url); // Al inicio, es la URL de la imagen que ya existe.
            setAdTargetUrl(initialAdData.ad_target_url || '');
            setAdScriptContent(initialAdData.ad_script_content || '');
            setIsAdActive(initialAdData.ad_is_active || false);

            const formatDateForInput = (utcDateString) => {
                if (!utcDateString) return '';

                // 1. Creamos un objeto Date desde el string UTC.
                const date = new Date(utcDateString);

                // 2. Obtenemos el offset de la zona horaria en minutos (ej: para UTC-3, devuelve 180).
                const timezoneOffset = date.getTimezoneOffset();

                // 3. Restamos ese offset a la fecha para "moverla" a la hora local correcta.
                date.setMinutes(date.getMinutes() - timezoneOffset);

                // 4. Ahora sí, convertimos a ISO y cortamos. El resultado será la hora local correcta.
                return date.toISOString().slice(0, 16);
            };

            setAdStartDate(formatDateForInput(initialAdData.ad_start_date));
            setAdEndDate(formatDateForInput(initialAdData.ad_end_date));
        }
    }, [initialAdData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        // --- LÓGICA SIMPLIFICADA Y ROBUSTA ---

        setIsSubmitting(true);
        const formData = new FormData();

        // 1. Añade TODOS los campos de texto y de estado al FormData.
        //    Esto asegura que el backend siempre reciba un payload completo y válido.
        formData.append('ad_name', adName);
        formData.append('ad_type', adType);
        formData.append('ad_is_active', String(isAdActive));

        if (adType === 'image') {
            formData.append('ad_format', adFormat);
            formData.append('ad_target_url', adTargetUrl);
            // 2. Si el usuario subió un archivo nuevo (un objeto 'File'), lo añadimos.
            //    Si no, no se añade nada y el backend sabrá que no debe cambiar la imagen.
            if (adImage instanceof File) {
                formData.append('ad_image_file', adImage);
            }
        }

        if (adType === 'script') {
            formData.append('ad_script_content', adScriptContent);
        }

        // 3. Manejo de fechas simplificado. Convierte las fechas a UTC o envía un string vacío.
        const toUTCString = (localDateString) => localDateString ? new Date(localDateString).toISOString() : '';
        formData.append('ad_start_date', toUTCString(adStartDate));
        formData.append('ad_end_date', toUTCString(adEndDate));

        // 4. Llamamos a la función onSave con el FormData completo.
        const result = await onSave(formData);

        // 5. Manejamos el resultado como antes.
        if (result?.success) {
            showNotification('Anuncio actualizado con éxito.', 'success');
            if (onUpdateSuccess) onUpdateSuccess();
            onCancel();
        } else {
            const errorMessage = result?.message || "Ocurrió un error inesperado.";
            setFormError(errorMessage);
        }

        setIsSubmitting(false);
    };

    if (loading) return <div className="modal-edit active"><div className="modal-edit-content">Cargando datos del anuncio...</div></div>;
    if (error) return <div className="modal-edit active"><div className="modal-edit-content"><p className="form-error">{error}</p></div></div>;

    // 5. El JSX del formulario, ahora completo y condicional.
    return (
        <div className="modal-edit active" id="editAdModal">
            <div className="modal-edit-content" ref={modalContentRef}>
                <div className="modal-edit-title">Editar Publicidad</div>
                <form onSubmit={handleSubmit} className="edit-form" encType="multipart/form-data">
                    {formError && <p className="error-message">{formError}</p>}

                    <h4>Información Básica</h4>
                    <div className="edit-field">
                        <label>Nombre (interno):</label>
                        <input type="text" name='ad_name' value={adName} onChange={(e) => setAdName(e.target.value)} required />
                    </div>
                    <div className="edit-field">
                        <label>Tipo de Anuncio:</label>
                        <div className="radio-group" style={{ display: 'flex', gap: '1rem', padding: '0.5rem 0' }}>
                            <label><input type="radio" name='ad_type' value="image" checked={adType === 'image'} onChange={e => setAdType(e.target.value)} /> Imagen</label>
                            <label><input type="radio" name='ad_type' value="script" checked={adType === 'script'} onChange={e => setAdType(e.target.value)} /> Script</label>
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
                                <label>Archivo de Imagen (opcional):</label>
                                <input type="file" name="ad_image_file" accept="image/*" onChange={handleImageChange} disabled={isSubmitting} />
                                <small>Sube una nueva imagen solo para reemplazar la actual.</small>
                            </div>
                            {adImage && (
                                <div className="image-preview">
                                    <img src={adImage instanceof File ? URL.createObjectURL(adImage) : adImage} alt="Vista previa" />
                                </div>
                            )}
                            <div className="edit-field">
                                <label>URL de Destino:</label>
                                <input type="url" placeholder="https://ejemplo.com" name='ad_target_url' value={adTargetUrl} onChange={(e) => setAdTargetUrl(e.target.value)} />
                            </div>
                        </>
                    )}

                    {adType === 'script' && (
                        <>
                            <h4>Detalles del Anuncio de Script</h4>
                            <div className="edit-field">
                                <label>Contenido del Script:</label>
                                <textarea rows="6" placeholder="Pegar aquí el código del script..." name='ad_script_content' value={adScriptContent} onChange={(e) => setAdScriptContent(e.target.value)} />
                            </div>
                        </>
                    )}

                    <h4>Programación y Estado</h4>
                    <div className="edit-field">
                        <label>Fecha de Inicio (Opcional):</label>
                        <input type="datetime-local" name="ad_start_date" value={adStartDate} onChange={(e) => setAdStartDate(e.target.value)} />
                    </div>
                    <div className="edit-field">
                        <label>Fecha de Fin (Opcional):</label>
                        <input type="datetime-local" name="ad_end_date" value={adEndDate} onChange={(e) => setAdEndDate(e.target.value)} />
                    </div>
                    <div className="edit-field checkbox-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" id="ad_is_active_edit_modal" name='ad_is_active' checked={isAdActive} onChange={(e) => setIsAdActive(e.target.checked)} />
                        <label htmlFor="ad_is_active_edit_modal">Activar este anuncio</label>
                    </div>
                    {!isAdActive && (
                        <div className="field-note warning-note">
                            <i className="fas fa-exclamation-triangle"></i>
                            <span>Esta publicidad se guardará como inactiva y no se mostrará en el sitio.</span>
                        </div>
                    )}
                    <div className="edit-buttons">
                        <button type="button" className="btn-cancel" onClick={onCancel} disabled={isSubmitting}>Cancelar</button>
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

EditAdvertisementModal.propTypes = {
    advertisement: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired }).isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onUpdateSuccess: PropTypes.func,
};