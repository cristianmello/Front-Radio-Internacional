import React, { useState, useCallback } from 'react';

const CommentForm = React.memo(({
    onSubmit,
    userAvatar, // Recibimos la URL del avatar del usuario
    initialText = '',
    buttonLabel = 'Comentar',
    isSubmitting = false,
    placeholder = 'Escribe tu comentario...',
    onCancel
}) => {
    const [content, setContent] = useState(initialText);
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (content.trim()) {
            onSubmit(content);
            if (!initialText) {
                setContent('');
                setIsFocused(false); // Reseteamos el foco al enviar
            }
        }
    }, [content, initialText, onSubmit]);

    const handleCancel = useCallback(() => {
        setContent('');
        setIsFocused(false);
        if (onCancel) {
            onCancel(); // Llama a la función onCancel del padre si existe
        }
    }, [onCancel]);

    return (
        <form onSubmit={handleSubmit} className="comment-form">
            <div className="textarea-container">
                <img src={userAvatar || '/default-avatar.png'} alt="Tu avatar" className="form-avatar" />
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onFocus={() => setIsFocused(true)} // 2. Activamos el estado al enfocar
                    placeholder={placeholder}
                    required
                />
            </div>

            <div className={`form-actions ${(isFocused || content) ? 'active' : ''}`}>
                <button type="button" className="btn-cancel" onClick={handleCancel}>
                    Cancelar
                </button>
                <button type="submit" className="btn-confirm" disabled={isSubmitting || !content.trim()}>
                    {isSubmitting ? 'Publicando...' : buttonLabel}
                </button>
            </div>
        </form>
    );
});

export default CommentForm;
