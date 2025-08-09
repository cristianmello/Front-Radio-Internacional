// src/components/ui/CommentsSection.jsx

import React, { useState } from 'react'; // Importa useState
import useComments from '../../../hooks/useComments';
import useAuth from '../../../hooks/UseAuth';
import CommentsList from './CommentsList';
import CommentForm from './CommentForm';

export default function CommentsSection({ articleId, onOpenAuth }) {
    const { auth } = useAuth();
    const [sortBy, setSortBy] = useState('most-liked');
    const {
        comments,
        loading,
        error,
        postComment,
        deleteComment,
        updateComment,
        voteOnComment
    } = useComments(articleId, sortBy);

    if (loading && comments.length === 0) return <h3>Cargando comentarios...</h3>;
    if (error) return <p style={{ color: 'red' }}>Error al cargar comentarios: {error}</p>;

    // 1. Usamos una función recursiva para un conteo más preciso de todos los comentarios y respuestas
    const countComments = (commentList) => {
        return commentList.reduce((acc, comment) => {
            return acc + 1 + (comment.replies ? countComments(comment.replies) : 0);
        }, 0);
    };
    const totalComments = countComments(comments);

    return (
        <div className={`article-comments ${loading ? 'loading' : ''}`}>
            {loading && <div className="comments-loading-overlay"><div className="loader"></div></div>}

            <div className="comments-header">
                <h3>{totalComments} Comentarios</h3>
            </div>

            {auth ? (
                <CommentForm userAvatar={auth?.user_image} onSubmit={(content) => postComment(content, null)} />
            ) : (
                <p className="login-prompt">
                    Debes <button className="link-button" onClick={onOpenAuth}>iniciar sesión</button> o
                    <button className="link-button" onClick={onOpenAuth}>registrarte</button> para poder comentar.
                </p>)}

            {/* 3. Añadimos la barra de herramientas para que coincida con el diseño */}
            <div className="comments-toolbar">
                {/* --- 2. AÑADIMOS LAS NUEVAS PESTAÑAS --- */}
                <ul className="sort-tabs">
                    <li className={sortBy === 'most-liked' ? 'active' : ''} onClick={() => setSortBy('most-liked')}>
                        Más me gusta
                    </li>
                    <li className={sortBy === 'most-replies' ? 'active' : ''} onClick={() => setSortBy('most-replies')}>
                        Más respuestas
                    </li>
                    <li className={sortBy === 'newest' ? 'active' : ''} onClick={() => setSortBy('newest')}>
                        Más recientes
                    </li>
                    <li className={sortBy === 'oldest' ? 'active' : ''} onClick={() => setSortBy('oldest')}>
                        Más antiguos
                    </li>
                </ul>
                {/*}  <div className="toolbar-actions">
                    <span>Compartir</span>
                    <i className="fas fa-cog"></i>
                </div>
                */}
            </div>

            <CommentsList
                comments={comments}
                onPostReply={postComment}
                onDelete={deleteComment}
                onUpdate={updateComment}
                onVote={voteOnComment}
                onOpenAuth={onOpenAuth}
            />
        </div>
    );
}