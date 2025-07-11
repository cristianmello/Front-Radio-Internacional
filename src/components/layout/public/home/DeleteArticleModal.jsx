// src/components/layout/public/home/DeleteContentModal.jsx
import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import useAuth from "../../../../hooks/UseAuth";
import Url from "../../../../helpers/Url";

// --- Hook Unificado para gestionar todos los borradores ---
function useDrafts() {
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authFetch } = useAuth();

    const fetchAllDrafts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [articlesRes, audiosRes] = await Promise.all([
                authFetch(`${Url.url}/api/articles/drafts`, { cache: 'no-cache' }),
                authFetch(`${Url.url}/api/audios/drafts`, { cache: 'no-cache' })
            ]);

            if (!articlesRes.ok || !audiosRes.ok) {
                throw new Error('Error al cargar uno o más tipos de borradores');
            }

            const articlesJson = await articlesRes.json();
            const audiosJson = await audiosRes.json();
            
            const mappedArticles = (articlesJson.items || []).map(item => ({ ...item, type: 'article', creationDate: item.date || item.created_at }));
            const mappedAudios = (audiosJson.items || []).map(item => ({ ...item, type: 'audio', creationDate: item.published_at || item.created_at }));

            const allDrafts = [...mappedArticles, ...mappedAudios]
                .sort((a, b) => new Date(b.creationDate || 0) - new Date(a.creationDate || 0));
            
            setDrafts(allDrafts);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    const deleteDraft = useCallback(async (type, code) => {
        try {
            const endpoint = type === 'article' ? 'articles' : 'audios';
            const res = await authFetch(`${Url.url}/api/${endpoint}/${code}`, { method: 'DELETE' });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message || "Error al eliminar");
            }
            await fetchAllDrafts();
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }, [authFetch, fetchAllDrafts]);

    useEffect(() => {
        fetchAllDrafts();
    }, [fetchAllDrafts]);

    return { drafts, loading, error, refresh: fetchAllDrafts, deleteDraft };
}
// --- FIN DEL HOOK ---

export default function DeleteContentModal({ onCancel }) {
    const { drafts, loading, error, deleteDraft, refresh } = useDrafts();
    
    const [filter, setFilter] = useState('all');
    const [deletingCode, setDeletingCode] = useState(null);
    const [localError, setLocalError] = useState(null);
    const [confirmingDelete, setConfirmingDelete] = useState(null); 

    const handleDelete = async (type, code) => {
        setDeletingCode(code);
        setLocalError(null);
        const result = await deleteDraft(type, code);
        if (!result.success) {
            setLocalError(result.message);
        }
        setDeletingCode(null);
        setConfirmingDelete(null);
    };
    
    const filteredDrafts = drafts.filter(draft => filter === 'all' || draft.type === filter);

    return (
        <div className="modal-edit active" id="deleteContentModal">
            <div className="modal-edit-content">
                <header className="modal-edit-header">
                    <div className="modal-edit-title">Eliminar Borradores</div>
                    <button onClick={refresh} disabled={loading} className="btn-refresh" title="Refrescar lista">
                        <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                    </button>
                </header>

                <div className="draft-filters">
                    <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>Todos</button>
                    <button onClick={() => setFilter('article')} className={filter === 'article' ? 'active' : ''}>Artículos</button>
                    <button onClick={() => setFilter('audio')} className={filter === 'audio' ? 'active' : ''}>Audios</button>
                </div>
                
                <main className="modal-edit-body">
                    {loading && <p className="loading-text">Cargando borradores…</p>}
                    {error && <p className="error-text">Error: {error}</p>}
                    {localError && <p className="error-text">Error al eliminar: {localError}</p>}
                    
                    {!loading && !error && (
                        <>
                            {filteredDrafts.length === 0 ? (
                                <p className="no-items-text">No hay borradores para mostrar con el filtro actual.</p>
                            ) : (
                                <ul className="item-list">
                                    {filteredDrafts.map((item) => {
                                        const code = item.article_code || item.audio_code;
                                        const isDeleting = deletingCode === code;
                                        const isConfirming = confirmingDelete && confirmingDelete.code === code;
                                        const creationDate = item.creationDate;

                                        return (
                                            <li key={`${item.type}-${code}`} className="item-list-entry">
                                                <div className="item-icon">
                                                    <i className={`fas ${item.type === 'article' ? 'fa-newspaper' : 'fa-headphones-alt'}`}></i>
                                                </div>
                                                <div className="item-info">
                                                    <h4 className="item-title">{item.title || 'Sin Título'}</h4>
                                                    <div className="item-meta">
                                                        <span><strong>Autor:</strong> {item.author || 'N/A'}</span>
                                                        <span className="separator">|</span>
                                                        <span><strong>Categoría:</strong> {item.category || 'N/A'}</span>
                                                        <span className="separator">|</span>
                                                        <span><strong>Creado:</strong> {creationDate ? format(new Date(creationDate), 'dd MMM yy', { locale: es }) : 'N/A'}</span>
                                                    </div>
                                                </div>
                                                <div className="item-actions">
                                                    {isConfirming ? (
                                                        <>
                                                            <button
                                                                className="btn-delete confirm"
                                                                onClick={() => handleDelete(item.type, code)}
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
                                                            onClick={() => setConfirmingDelete({ type: item.type, code })}
                                                            disabled={deletingCode !== null}
                                                            title="Eliminar"
                                                        >
                                                           <i className="fas fa-trash-alt"></i>
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
                </main>

                <footer className="edit-buttons">
                    <button className="btn-cancel" onClick={onCancel}>
                        Cerrar
                    </button>
                </footer>
            </div>
        </div>
    );
}

DeleteContentModal.propTypes = {
    onCancel: PropTypes.func.isRequired,
};


/*// src/components/layout/public/home/DeleteDraftsModal.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import useDraftArticles from "../../../../hooks/useDraftArticles";
import useAuth from "../../../../hooks/UseAuth";
import Url from "../../../../helpers/Url";

export default function DeleteDraftsModal({ onCancel }) {
    const { articles, loading, error } = useDraftArticles();
    const { authFetch } = useAuth();
    const [deletingCode, setDeletingCode] = useState(null);
    const [localError, setLocalError] = useState(null);

    const handleDelete = async (code) => {
        if (!window.confirm("¿Seguro que quieres eliminar este borrador?")) return;
        setDeletingCode(code);
        setLocalError(null);
        try {
            // borramos por article_code
            const res = await authFetch(`${Url.url}/api/articles/${code}`, {
                method: "DELETE",
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || "Error eliminando borrador");
            window.location.reload();
        } catch (err) {
            setLocalError(err.message);
        } finally {
            setDeletingCode(null);
        }
    };

    return (
        <div className="modal-edit active" id="deleteDraftsModal">
            <div className="modal-edit-content">
                <div className="modal-edit-title">Eliminar Borradores</div>

                {loading && <p>Cargando borradores…</p>}
                {error && <p className="error">Error: {error}</p>}
                {localError && <p className="error">Error: {localError}</p>}

                {!loading && !error && (
                    <>
                        {articles.length === 0 ? (
                            <p>No hay borradores para eliminar.</p>
                        ) : (
                            <ul className="draft-list">
                                {articles.map((art) => {
                                    const code = art.article_code;              // PK real
                                    const slug = art.article_slug || "";         // opcional
                                    return (
                                        <li key={code} className="draft-item">
                                            <div className="draft-info">
                                                <strong>{art.article_title}</strong><br />
                                                <small>Código: {code}{slug && ` | Slug: ${slug}`}</small>
                                            </div>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(code)}
                                                disabled={deletingCode === code}
                                            >
                                                {deletingCode === code ? "Eliminando…" : "Eliminar"}
                                            </button>
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

DeleteDraftsModal.propTypes = {
    onCancel: PropTypes.func.isRequired,
};
*/