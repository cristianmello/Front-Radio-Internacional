import { useState, useEffect, useCallback } from 'react';
import useAuth from './UseAuth';
import Url from '../helpers/Url';

export default function useComments(articleId, sortBy = 'best') {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { auth, authFetch } = useAuth();

    const fetchComments = useCallback(async () => {
        if (!articleId) return;
        setLoading(true);
        setError(null);

        try {
            const res = await authFetch(`${Url.url}/api/articles/${articleId}/comments?sort=${sortBy}`);
            if (!res.ok) throw new Error('No se pudieron cargar los comentarios.');

            const json = await res.json();
            setComments(json.data.comments || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [articleId, authFetch, sortBy]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const postComment = async (content, parentId = null) => {
        try {
            const res = await authFetch(`${Url.url}/api/articles/${articleId}/comments`, {
                method: 'POST',
                body: JSON.stringify({ content, parentId }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Error al publicar.');

            // --- ACTUALIZACIÓN LOCAL ---
            const newComment = json.data.comment;
            setComments(currentComments => {
                if (parentId) {
                    // Es una respuesta, la añadimos al padre
                    const addReplyRecursively = (commentsList) => {
                        return commentsList.map(c => {
                            if (c.comment_id === parentId) {
                                return { ...c, replies: [...(c.replies || []), newComment] };
                            }
                            if (c.replies) {
                                return { ...c, replies: addReplyRecursively(c.replies) };
                            }
                            return c;
                        });
                    };
                    return addReplyRecursively(currentComments);
                } else {
                    return [...currentComments, newComment];
                }
            });
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    const deleteComment = async (commentId) => {
        try {
            await authFetch(`${Url.url}/api/comments/${commentId}`, { method: 'DELETE' });
            // --- ACTUALIZACIÓN LOCAL ---
            setComments(currentComments => {
                const removeRecursively = (commentsList) => {
                    return commentsList
                        .filter(c => c.comment_id !== commentId)
                        .map(c => {
                            if (c.replies) {
                                return { ...c, replies: removeRecursively(c.replies) };
                            }
                            return c;
                        });
                };
                return removeRecursively(currentComments);
            });
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };


    const updateComment = async (commentId, content) => {
        try {
            const res = await authFetch(`${Url.url}/api/comments/${commentId}`, {
                method: 'PUT',
                body: JSON.stringify({ content }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Error al actualizar.');

            // --- ACTUALIZACIÓN LOCAL ---
            const updatedComment = json.data.comment;
            setComments(currentComments => {
                const updateRecursively = (commentsList) => {
                    return commentsList.map(c => {
                        if (c.comment_id === commentId) {
                            return { ...c, comment_content: updatedComment.comment_content };
                        }
                        if (c.replies) {
                            return { ...c, replies: updateRecursively(c.replies) };
                        }
                        return c;
                    });
                };
                return updateRecursively(currentComments);
            });
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    const voteOnComment = async (commentId, direction) => {
        try {
            const res = await authFetch(`${Url.url}/api/comments/${commentId}/vote`, {
                method: 'POST',
                body: JSON.stringify({ direction }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Error al registrar el voto.');

            const { upvotes, downvotes } = json.data;
            const userId = auth ? auth.user_code : null;

            setComments(currentComments => {
                const updateCommentInTree = (commentsList) => {
                    return commentsList.map(comment => {
                        if (comment.comment_id === commentId) {
                            const newVotes = updateMyVote(comment.votes || [], userId, direction);
                            return { ...comment, upvotes, downvotes, votes: newVotes };
                        }
                        if (comment.replies && comment.replies.length > 0) {
                            return { ...comment, replies: updateCommentInTree(comment.replies) };
                        }
                        return comment;
                    });
                };

                const updateMyVote = (votes, currentUserId, newDirection) => {
                    if (!currentUserId) return votes;
                    const existingVoteIndex = votes.findIndex(v => v.user_id === currentUserId);

                    if (existingVoteIndex > -1) {
                        if (votes[existingVoteIndex].vote_type === newDirection) {
                            return votes.filter(v => v.user_id !== currentUserId);
                        } else {
                            const updatedVotes = [...votes];
                            updatedVotes[existingVoteIndex] = { ...updatedVotes[existingVoteIndex], vote_type: newDirection };
                            return updatedVotes;
                        }
                    } else {
                        return [...votes, { user_id: currentUserId, vote_type: newDirection }];
                    }
                };

                return updateCommentInTree(currentComments);
            });

            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    const toggleApproval = async (commentId) => {
        try {
            await authFetch(`${Url.url}/api/comments/${commentId}/approve`, { method: 'PATCH' });
            // Recargamos los comentarios para que el comentario desaparezca/aparezca
            await fetchComments();
            return { success: true };
        } catch (err) {
            return { success: false, message: 'Error al moderar el comentario.' };
        }
    };

    // Devolvemos el estado y las funciones para que los componentes los usen
    return {
        comments,
        loading,
        error,
        postComment,
        deleteComment,
        updateComment,
        voteOnComment,
        toggleApproval
    };
}