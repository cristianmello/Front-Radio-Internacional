// src/components/ui/CommentItem.jsx
import React, { useState } from 'react';
import useAuth from '../../../hooks/UseAuth';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import CommentForm from './CommentForm';
import CommentsList from './CommentsList';
import ConfirmDeleteModal from '../../modals/ConfirmDeleteModal';
import { useProfileSidebar } from '../../../context/ProfileSidebarContext';

const INITIAL_REPLIES_TO_SHOW = 4;

export default function CommentItem({ comment, onPostReply, onDelete, onUpdate, onVote, onOpenAuth, toggleApproval }) {
    const { auth } = useAuth();
    
    const isAdmin = auth && auth.roles?.some(r => ["editor", "admin", "superadmin"].includes(r));
    const { openSidebar } = useProfileSidebar();

    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [visibleRepliesCount, setVisibleRepliesCount] = useState(INITIAL_REPLIES_TO_SHOW);

    const canModify = auth && (auth.user_code === comment.author?.user_code || auth.roles?.some(r => ["editor", "admin", "superadmin"].includes(r)));
    const upvotes = comment.votes?.filter(v => v.vote_type === 1).length || 0;
    const userVote = auth ? comment.votes?.find(v => v.user_id === auth.user_code) : null;
    const hasUpvoted = userVote?.vote_type === 1;
    const hasDownvoted = userVote?.vote_type === -1;

    const handlePostReply = (replyContent) => {
        onPostReply(replyContent, comment.comment_id);
        setIsReplying(false);
    };

    const handleUpdate = (newContent) => {
        onUpdate(comment.comment_id, newContent);
        setIsEditing(false);
    };

    const handleAction = (action) => {
        if (!auth) onOpenAuth();
        else action();
    };

    const handleDeleteConfirm = () => {
        onDelete(comment.comment_id);
        setIsDeleteModalOpen(false); // Cierra el modal
    };

    const hasReplies = comment.replies && comment.replies.length > 0;

    const handleShowMoreReplies = () => {
        setVisibleRepliesCount(comment.replies.length);
    };

    const visibleReplies = hasReplies ? comment.replies.slice(0, visibleRepliesCount) : [];
    const hasMoreReplies = hasReplies && comment.replies.length > visibleRepliesCount;

    return (
        <>
            <div className="comment-thread">
                <div className="comment">
                    <div className="comment-avatar">
                        <a href="#" onClick={(e) => { e.preventDefault(); openSidebar(comment.author.user_code); }}>
                            <img src={comment.author?.user_image || '/default-avatar.png'} alt={comment.author?.user_name} />
                        </a>
                    </div>
                    <div className="comment-body">
                        <div className="comment-header">
                            <span className="comment-author">{comment.author?.user_name || '[Usuario Eliminado]'}</span>
                            <span className="comment-date">
                                {/* Detalle: Quitamos 'addSuffix' para que no diga "hace" */}
                                {comment.created_at ? formatDistanceToNow(new Date(comment.created_at.replace(' ', 'T')), { locale: es }) : ''}
                            </span>
                        </div>

                        <div className="comment-text">
                            {isEditing ? (
                                <CommentForm
                                    userAvatar={auth?.user_image}
                                    initialText={comment.comment_content}
                                    onSubmit={handleUpdate}
                                    buttonLabel="Guardar"
                                    onCancel={() => setIsEditing(false)}
                                />
                            ) : (
                                <p>{comment.comment_content}</p>
                            )}
                        </div>

                        {!isEditing && (
                            /* --- CAMBIO 3: Estructura de acciones tipo Disqus --- */
                            <div className="comment-actions">
                                <div className="vote-actions">
                                    <button
                                        className={`vote-btn ${hasUpvoted ? 'active' : ''}`}
                                        onClick={() => handleAction(() => onVote(comment.comment_id, 1))}
                                    >
                                        {/* --- AHORA MOSTRAMOS UN ICONO DIFERENTE SI ESTÁ ACTIVO --- */}
                                        {hasUpvoted ? (
                                            <svg viewBox="0 0 24 24" className="vote-icon"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"></path></svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" className="vote-icon"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"></path></svg>
                                        )}
                                    </button>

                                    {upvotes > 0 && <span className="vote-count">{upvotes}</span>}

                                    <button
                                        className={`vote-btn ${hasDownvoted ? 'active' : ''}`}
                                        onClick={() => handleAction(() => onVote(comment.comment_id, -1))}
                                    >
                                        {hasDownvoted ? (
                                            <svg viewBox="0 0 24 24" className="vote-icon"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zM19 3v12h4V3h-4z"></path></svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" className="vote-icon"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"></path></svg>
                                        )}
                                    </button>
                                </div>

                                {/* Los otros botones no cambian */}
                                <button className="action-link" onClick={() => handleAction(() => setIsReplying(prev => !prev))}>Responder</button>
                                {canModify && <button className="action-link" onClick={() => setIsEditing(true)}>Editar</button>}
                                {canModify && <button className="action-link" onClick={() => setIsDeleteModalOpen(true)}>Borrar</button>}

                                {isAdmin && (
                                    <button className="action-link" onClick={() => toggleApproval(comment.comment_id)}>
                                        {comment.comment_is_approved ? 'Desaprobar' : 'Aprobar'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {/* El formulario de respuesta ahora también está dentro del 'comment-thread' */}
                {isReplying && (
                    <div className="reply-form">
                        <CommentForm
                            userAvatar={auth?.user_image}
                            onSubmit={(replyContent) => { onPostReply(replyContent, comment.comment_id); setIsReplying(false); }}
                            buttonLabel="Publicar Respuesta"
                            placeholder="Escribe tu respuesta..."
                            onCancel={() => setIsReplying(false)}
                        />
                    </div>
                )}

                {hasReplies && (
                    <div className="toggle-replies-container">
                        <button
                            className={`toggle-replies-btn ${!isCollapsed ? 'expanded' : ''}`}
                            onClick={() => setIsCollapsed(prev => !prev)}
                        >
                            <div className="toggle-replies-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false">
                                    <path d="m18 9.28-6.35 6.35-6.37-6.35.72-.71 5.64 5.65 5.65-5.65z"></path>
                                </svg>
                            </div>
                            <span>
                                {isCollapsed ? `Ver ${comment.replies.length} respuestas` : 'Ocultar respuestas'}
                            </span>
                        </button>
                    </div>
                )}

                {!isCollapsed && hasReplies && (
                    <div className="comment-replies">
                        {/* Pasamos la lista de 'visibleReplies' a CommentsList */}
                        <CommentsList comments={visibleReplies} onPostReply={onPostReply} onDelete={onDelete} onUpdate={onUpdate} onVote={onVote} onOpenAuth={onOpenAuth} />

                        {/* El botón "Cargar más" ahora se mostrará cuando sea necesario */}
                        {hasMoreReplies && (
                            <button className="load-more-replies-btn" onClick={handleShowMoreReplies}>
                                Cargar {comment.replies.length - visibleRepliesCount} respuestas más
                            </button>
                        )}
                    </div>
                )}
            </div>
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="¿Eliminar comentario?"
                message="Esta acción es permanente. ¿Estás seguro de que quieres eliminar este comentario?"
            />
        </>
    );
}