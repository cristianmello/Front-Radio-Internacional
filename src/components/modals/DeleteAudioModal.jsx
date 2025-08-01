// src/components/layout/public/home/DeleteAudioModal.jsx
import React, { useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import useAuth from "../../hooks/UseAuth";
import Url from "../../helpers/Url";
import { useNotification } from "../../context/NotificationContext";

// Hook especializado para gestionar borradores de audio
function useDraftAudios() {
    const [audios, setAudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authFetch } = useAuth();

    const fetchDrafts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await authFetch(`${Url.url}/api/audios/drafts`, { cache: 'no-cache' });
            if (!res.ok) {
                const errJson = await res.json().catch(() => ({}));
                throw new Error(errJson.message || 'Error cargando borradores de audio');
            }
            const json = await res.json();
            setAudios(json.items || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        fetchDrafts();
    }, [fetchDrafts]);

    // Devolvemos la función para que el componente pueda llamarla
    return { audios, loading, error, refresh: fetchDrafts };
}


export default function DeleteAudioModal({ onCancel }) {
    // Usamos el hook para obtener y refrescar la lista de borradores
    const { audios, loading, error, refresh } = useDraftAudios();
    const { authFetch } = useAuth();
    const { showNotification } = useNotification();

    const [deletingCode, setDeletingCode] = useState(null);
    const [confirmingDelete, setConfirmingDelete] = useState(null);

    const handleDelete = async (code) => {
        setDeletingCode(code);
        try {
            const res = await authFetch(`${Url.url}/api/audios/${code}`, {
                method: "DELETE",
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || "Error eliminando el borrador");

            showNotification('Borrador de audio eliminado con éxito.', 'success');
            refresh();

        } catch (err) {
            showNotification(err.message, 'error');
        } finally {
            setDeletingCode(null);
            setConfirmingDelete(null);
        }
    };

    return (
        <div className="modal-edit active" id="deleteAudioModal">
            <div className="modal-edit-content">
                <div className="modal-edit-title">Eliminar Borradores de Audio
                    <button onClick={refresh} disabled={loading} className="btn-refresh" title="Refrescar lista">
                        {loading ? 'Cargando...' : 'Refrescar'}
                    </button>
                </div>

                {loading && <p>Cargando borradores…</p>}
                {error && <p className="error">Error: {error}</p>}

                {!loading && !error && (
                    <>
                        {audios.length === 0 ? (
                            <p>No hay borradores de audio para eliminar.</p>
                        ) : (
                            <ul className="draft-list">
                                {audios.map((audio) => {
                                    const code = audio.audio_code;
                                    const isDeleting = deletingCode === code;
                                    const isConfirming = confirmingDelete === code;

                                    return (
                                        <li key={code} className="draft-item">
                                            <div className="draft-info">
                                                <strong>{audio.title}</strong>
                                                <small>
                                                    <span>Categoría: {audio.category || 'N/A'}</span> |
                                                    <span> Duración: {
                                                        typeof audio.duration === 'number'
                                                            ? `${Math.floor(audio.duration / 60)}:${String(audio.duration % 60).padStart(2, "0")}`
                                                            : 'N/A'
                                                    }</span>
                                                </small>
                                            </div>
                                            <div className="draft-item-actions">
                                                {isConfirming ? (
                                                    <>
                                                        <button
                                                            className="btn-delete"
                                                            onClick={() => handleDelete(code)}
                                                            disabled={isDeleting}
                                                        >
                                                            {isDeleting ? "Borrando..." : "Confirmar"}
                                                        </button>
                                                        <button
                                                            className="btn-cancel-inline"
                                                            onClick={() => setConfirmingDelete(null)}
                                                            disabled={isDeleting}
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => setConfirmingDelete(code)}
                                                        disabled={deletingCode !== null}
                                                    >
                                                        Eliminar
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </>
                )}

                <div className="edit-buttons">
                    <button className="btn-cancel" onClick={onCancel}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

DeleteAudioModal.propTypes = {
    onCancel: PropTypes.func.isRequired,
};
