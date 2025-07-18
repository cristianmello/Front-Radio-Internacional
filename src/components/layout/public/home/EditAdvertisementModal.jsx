import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import useAdvertisement from '../../../../hooks/useAdvertisement';
import { AD_FORMATS } from '../../../../helpers/adFormats.js';
import { compressImage } from '../../../../helpers/ImageCompressor.jsxa';
/**
 * Modal COMPLETO para editar un anuncio existente.
 * @param {object} advertisement - El objeto de anuncio a editar (contiene al menos el id).
 * @param {function} onSave - Función que se llama con el FormData de los campos cambiados.
 * @param {function} onCancel - Función para cerrar el modal.
 * @param {function} onUpdateSuccess - Función para refrescar la lista en el componente padre.
 */
export default function EditAdvertisementModal({ advertisement: adToEdit, onSave, onCancel, onUpdateSuccess }) {

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

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFormError('');
        setIsSubmitting(true);
        try {
            const compressed = await compressImage(file);
            setAdImage(compressed);
        } catch {
            setFormError('Error al procesar la imagen, se usará la original.');
            setAdImage(file);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 4. Lógica de guardado "inteligente": solo envía los campos modificados.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        const initial = initialDataRef.current;
        const formatChanged = adFormat !== initial.ad_format;
        const newImageUploaded = adImage instanceof File;

        if (formatChanged && !newImageUploaded) {
            setFormError("Has cambiado el formato. Por favor, sube la imagen de nuevo para que se ajuste al nuevo tamaño.");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();

        // Comparamos cada campo con su valor original y lo añadimos si cambió
        if (adName !== initial.ad_name) formData.append('ad_name', adName);
        if (adType !== initial.ad_type) formData.append('ad_type', adType);
        if (isAdActive !== initial.ad_is_active) formData.append('ad_is_active', String(isAdActive));

        if (adType === 'image') {
            if (adFormat !== initial.ad_format) formData.append('ad_format', adFormat);
            if (adTargetUrl !== initial.ad_target_url) formData.append('ad_target_url', adTargetUrl);
            if (adImage instanceof File) formData.append('ad_image_file', adImage);
        }

        if (adType === 'script') {
            if (adScriptContent !== initial.ad_script_content) formData.append('ad_script_content', adScriptContent);
        }

        // Función helper para convertir la fecha local del input a un string ISO UTC
        const toUTCString = (localDateString) => {
            if (!localDateString) return null; // Si no hay fecha, devuelve null
            return new Date(localDateString).toISOString();
        };

        // Comparamos la fecha de inicio
        if (adStartDate !== (initial.ad_start_date || '').slice(0, 16)) {
            // Si hay un valor, lo convertimos a UTC antes de añadirlo
            if (adStartDate) {
                formData.append('ad_start_date', toUTCString(adStartDate));
            } else {
                formData.append('ad_start_date', '');
            }
        }

        // Comparamos la fecha de fin
        if (adEndDate !== (initial.ad_end_date || '').slice(0, 16)) {
            if (adEndDate) {
                formData.append('ad_end_date', toUTCString(adEndDate));
            } else {
                formData.append('ad_end_date', '');
            }
        }


        // Si no se modificó ningún campo, cerramos el modal sin llamar a la API.
        if ([...formData.entries()].length === 0) {
            onCancel();
            setIsSubmitting(false);
            return;
        }

        const result = await onSave(formData);

        if (result && result.success) {
            if (onUpdateSuccess) onUpdateSuccess();
            onCancel();
        } else {
            setFormError(result?.message || "Ocurrió un error inesperado.");
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