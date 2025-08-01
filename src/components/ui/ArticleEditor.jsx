import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import useArticleActions from '../../hooks/useArticleActions';
import useAuth from '../../hooks/UseAuth';
import Url from '../../helpers/Url';

export default function ArticleEditor({ article, refresh }) {
    // Hooks que SÍ necesitan autenticación. Como este componente solo se renderiza
    // para usuarios logueados, es seguro llamarlos aquí.
    const { editArticle } = useArticleActions();
    const { authFetch } = useAuth();

    // Estados locales para la edición
    const [isEditingContent, setIsEditingContent] = useState(false);
    const [editableContent, setEditableContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (article) {
            setEditableContent(article.article_content);
        }
    }, [article]);

    const imageUploadHandler = (blobInfo) => new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', blobInfo.blob(), blobInfo.filename());

        authFetch(`${Url.url}/api/upload/image`, {
            method: 'POST',
            body: formData
        })
        .then(res => {
            if (!res.ok) return res.json().then(err => Promise.reject(err));
            return res.json();
        })
        .then(json => {
            if (!json || !json.location) return Promise.reject("Respuesta de subida inválida");
            resolve(json.location);
        })
        .catch(err => reject("Fallo en la subida: " + (err.message || "Error desconocido")));
    });

    const handleSaveContent = async () => {
        if (!article) return;
        setIsSaving(true);
        const formData = new FormData();
        formData.append('article_content', editableContent);

        const result = await editArticle(article.article_code, formData);

        if (result.success) {
            alert('¡Contenido guardado exitosamente!');
            setIsEditingContent(false);
            refresh(); // Llama a la función de refresco del hook público
        } else {
            alert('Error al guardar el contenido: ' + (result.message || 'Error desconocido'));
        }
        setIsSaving(false);
    };

    const handleCancelEdit = () => {
        setEditableContent(article.article_content);
        setIsEditingContent(false);
    };

    return (
        <>
            <div className="article-admin-toolbar">
                {!isEditingContent ? (
                    <button onClick={() => setIsEditingContent(true)}>
                        <i className="fas fa-edit"></i> Editar Contenido
                    </button>
                ) : (
                    <>
                        <button onClick={handleSaveContent} className="btn-save" disabled={isSaving}>
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                        <button onClick={handleCancelEdit} className="btn-cancel" disabled={isSaving}>
                            Cancelar
                        </button>
                    </>
                )}
            </div>

            <div className="article-body">
                {isEditingContent ? (
                    <Editor
                        apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                        value={editableContent}
                        onEditorChange={(newContent) => setEditableContent(newContent)}
                        init={{
                            height: 600,
                            menubar: true,
                            plugins: 'lists link image table code help wordcount autoresize fullscreen preview emoticons media',
                            toolbar: 'undo redo | blocks | bold italic underline strikethrough | forecolor backcolor | bullist numlist outdent indent | alignleft aligncenter alignright alignjustify | link image media | table | removeformat | fullscreen preview | help',
                            image_uploadtab: true,
                            images_upload_handler: imageUploadHandler,
                            file_picker_types: 'image',
                            automatic_uploads: true,
                            extended_valid_elements: 'iframe[src|width|height|frameborder|allow|allowfullscreen|title]',
                            media_live_embeds: true,
                            content_style: `body {font-family:Helvetica,Arial,sans-serif; font-size:16px }iframe {width: 100% !important;max-width: 100%;height: auto !important;aspect-ratio: 16 / 9;border: none;}`
                        }}
                    />
                ) : (
                    <div dangerouslySetInnerHTML={{ __html: article.article_content }} />
                )}
            </div>
        </>
    );
}