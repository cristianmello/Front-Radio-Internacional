import React, { useState, useEffect, useRef, useContext, useCallback, useMemo } from 'react';
import { Link, useParams, useLocation, useOutletContext } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import usePublicArticle from '../hooks/usePublicArticle';
import useArticleActions from '../hooks/useArticleActions';
import useRelatedArticles from '../hooks/useRelatedArticles';
import useAuth from '../hooks/UseAuth';
import { useEditMode } from '../context/EditModeContext';
import { Editor } from '@tinymce/tinymce-react';
import Url from '../helpers/Url';
import RenderArticleContent from '../components/ui/RenderArticleContent';
import useAdvertisements from '../hooks/useAdvertisements';
import { useNotification } from '../context/NotificationContext';
import { SidebarContext } from '../context/SidebarContext';
import CommentsSection from '../components/ui/comments/CommentsSection';

const iconMap = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle',
};

const ArticlePage = () => {
    const sidebar = useContext(SidebarContext);
    const { code, slug } = useParams();
    const { onOpenAuth } = useOutletContext();
    const location = useLocation();
    const initialData = location.state?.article;
    const { showNotification } = useNotification();

    const { article, loading, error, refresh } = usePublicArticle(code, slug);
    const { editArticle } = useArticleActions();
    const { relatedArticles, loadingRelated, errorRelated } = useRelatedArticles(code);

    const { auth, roles, authFetch } = useAuth();
    const editMode = useEditMode(); // Hook para saber si el modo editor global está activo
    const canEditArticle = auth?.user_code && roles.some(r => ["editor", "admin", "superadmin"].includes(r));

    // 2. Estados para controlar el modo de edición del contenido
    const [isEditingContent, setIsEditingContent] = useState(false);
    const [editableContent, setEditableContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const { advertisements, loading: adsLoading, error: adsError } = useAdvertisements();

    const [showInsertAdModal, setShowInsertAdModal] = useState(false);

    const editorRef = useRef(null);

    // 3. Cuando el artículo se carga, se inicializa el estado del contenido ditable
    useEffect(() => {
        if (article) {
            setEditableContent(article.article_content);
        }
    }, [article]);

    // Verificamos si el usuario actual tiene permisos para editar

    const imageUploadHandler = useCallback((blobInfo, progress) => new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', blobInfo.blob(), blobInfo.filename());

        // Usamos authFetch para enviar el archivo a una nueva ruta del backend
        authFetch(`${Url.url}/api/articles/upload-image`, {
            method: 'POST',
            body: formData
        })
            .then(res => {
                if (!res.ok) {
                    // Si la respuesta no es OK, rechazamos la promesa con un mensaje de error
                    res.json().then(err => reject(`Error de subida: ${err.message}`));
                    return;
                }
                return res.json();
            })
            .then(json => {
                if (!json || typeof json.location != 'string') {
                    reject("Respuesta de subida inválida: " + JSON.stringify(json));
                    return;
                }
                // Resolvemos la promesa con la URL de la imagen ya en nuestro CDN
                resolve(json.location);
            })
            .catch(err => {
                reject("Fallo en la subida de imagen: " + err.message);
            });
    }), [authFetch]);

    const handleSaveContent = useCallback(async () => {
        if (!article) return;
        // Comprobación para no guardar si no hay cambios
        if (editableContent === article.article_content) {
            showNotification("No se detectaron cambios en el contenido.", "info");
            setIsEditingContent(false);
            return;
        }

        setIsSaving(true);
        const formData = new FormData();
        formData.append('article_content', editableContent);

        const result = await editArticle(article.article_code, formData);

        if (result.success) {
            showNotification('¡Contenido guardado exitosamente!', 'success');
            setIsEditingContent(false);
            refresh();
        } else {
            showNotification('Error al guardar: ' + result.message, 'error');
        }
        setIsSaving(false);
    }, [article, editableContent, editArticle, refresh, showNotification]);

    const handleCancelEdit = useCallback(() => {
        // Restauramos el contenido original y salimos del modo edición
        setEditableContent(article.article_content);
        setIsEditingContent(false);
    }, [article]);

    // Después (Correcto y más simple)
    const handleOpenInsertAdModal = useCallback(() => {
        // Simplemente abre el modal. Los anuncios ya están en el estado 'advertisements'.
        if (adsError) {
            showNotification('No se pudieron cargar los anuncios.', 'error');
            return;
        }
        setShowInsertAdModal(true);
    }, [adsError, showNotification]);

    const handleInsertAd = useCallback((ad) => {
        if (editorRef.current) {
            // Este es el marcador de posición que se insertará en el editor.
            // Es HTML simple con un data-attribute para identificarlo después.
            const adHtml = `
                <div class="advertisement-placeholder" data-ad-id="${ad.ad_id}" contenteditable="false">
                    <div class="ad-placeholder-content">
                        <i class="fas fa-bullhorn"></i>
                        <strong>Publicidad:</strong> ${ad.ad_name}
                        <small>(${ad.ad_type})</small>
                    </div>
                </div>`;
            editorRef.current.insertContent(adHtml);
        }
        setShowInsertAdModal(false);
    }, []);

    // --- NUEVO: Memorización de la configuración del editor ---
    const editorConfig = useMemo(() => ({
        height: 600,
        menubar: true,
        plugins: 'lists link image table code help wordcount autoresize fullscreen preview emoticons media quickbars',
        toolbar: 'undo redo | blocks | bold italic underline strikethrough | ' +
            'forecolor backcolor | bullist numlist outdent indent blockquote | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'link image media insertAdButton| table | removeformat | fullscreen preview | help',
        object_resizing: true,
        quickbars_selection_toolbar: 'bold italic | quicklink blockquote',
        quickbars_insert_toolbar: 'quickimage quicktable',
        image_uploadtab: true,
        images_upload_handler: imageUploadHandler,
        file_picker_types: 'image',
        automatic_uploads: true,

        extended_valid_elements: 'iframe[src|width|height|frameborder|allow|allowfullscreen|title]',
        media_live_embeds: true,
        content_style: `
body { font-family:Helvetica,Arial,sans-serif; font-size:16px }
/* Para imágenes y videos */
img, iframe {
max-width: 100%; /* Usa max-width en lugar de width !important */
height: auto;    /* Permite que la altura se ajuste automáticamente */}
/* Mantenemos la proporción para iframes por defecto */iframe {
aspect-ratio: 16 / 9;
border: none;
}`
        , setup: (editor) => {
            editor.ui.registry.addButton('insertAdButton', {
                text: 'Publicidad',
                icon: 'bullhorn',
                tooltip: 'Insertar Publicidad',
                onAction: handleOpenInsertAdModal,
            });
        }
    }), [imageUploadHandler, handleOpenInsertAdModal]);

    const displayedArticle = article || initialData;

    if (loading && !displayedArticle) {
        return (
            <>
                <title>Cargando... - Realidad Nacional</title>
                <main className="article-main"><div className="container">Cargando artículo...</div></main>;
            </>
        )
    }

    if (error) {
        return (
            <>
                <title>Error - Realidad Nacional</title>
                <meta name="robots" content="noindex" />
                <main className="article-main"><div className="container">Error: {error}</div></main>;
            </>
        )
    }
    if (!displayedArticle) {
        return (
            <>
                <title>Artículo no encontrado - Realidad Nacional</title>
                <meta name="robots" content="noindex" />

                <main className="article-main"><div className="container">Artículo no encontrado.</div></main>
            </>
        );
    }

    const categoryName = displayedArticle?.category?.category_name || displayedArticle?.category_name || '—';

    // 3. Datos Estructurados (JSON-LD) para Google
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": displayedArticle.article_title,
        "image": [displayedArticle.article_image_url],
        "datePublished": displayedArticle.article_published_at,
        "dateModified": displayedArticle.updated_at || displayedArticle.article_published_at,
        "author": [{
            "@type": "Organization",
            "name": "Realidad Nacional",
            "url": "https://www.realidadnacional.net"
        }]
    };

    const handleFacebookClick = useCallback(() => {
        window.open('https://www.facebook.com/people/Ivan-Mourelle-II/pfbid035pdoERG4oXaNH4hUQzqnFMg9QYPMcxgz53BKrQDrgP3gBkqVxFu4ipSHCH2t54d2l', '_blank', 'noopener,noreferrer');
    }, []);

    return (
        <>
            <title>{`${displayedArticle.article_title} - Realidad Nacional`}</title>
            <meta name="description" content={displayedArticle.article_excerpt} />
            <main className="article-main">

                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
                {canEditArticle && editMode && (
                    // 1. Contenedor principal que SIEMPRE tiene la clase de posicionamiento.
                    <div className="article-admin-toolbar">

                        {!isEditingContent ? (
                            // 2. El botón de editar ya no necesita la clase 'article-admin-toolbar'
                            <button onClick={() => setIsEditingContent(true)}>
                                <i className="fas fa-edit"></i> Editar Contenido
                            </button>
                        ) : (
                            // 3. Los botones de guardar/cancelar están dentro del mismo contenedor
                            <div className="edit-actions">
                                <button onClick={handleSaveContent} disabled={isSaving}>
                                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                                <button onClick={handleCancelEdit} disabled={isSaving} className="btn-cancel-style"> {/* Clase opcional para estilo diferente */}
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="article-layout">
                    <article className="article-content">

                        {/* ... El encabezado del artículo (título, autor, fecha) no cambia ... */}
                        <div className="article-header">
                            <div className="breadcrumbs">
                                <Link to="/">Inicio</Link> &gt;{" "}
                                <span className="article-category">{categoryName}</span>
                            </div>
                            <div className="article-meta-top">
                                <span className="article-category-label">
                                    {categoryName}
                                </span>
                                <span className="article-date">
                                    {formatDistanceToNow(
                                        parseISO(displayedArticle.article_published_at),
                                        { locale: es, addSuffix: true }
                                    )}
                                </span>
                            </div>
                            <h1 className="article-title">{displayedArticle.article_title}</h1>
                            {displayedArticle.article_slug && (
                                <h2 className="article-subtitle">{displayedArticle.article_excerpt}</h2>
                            )}
                            {/* {article.author && (
                                <div className="article-author">
                                    <img
                                        src={displayedArticle.author.avatar}
                                        alt={displayedArticle.author.name}
                                        className="author-image"
                                    />
                                    <div className="author-info">
                                        <span className="author-name">{displayedArticle.author.name}</span>
                                        <span className="author-title">{displayedArticle.author.title}</span>
                                    </div>
                                </div>
                            )}*/}
                        </div>

                        {displayedArticle.article_image_url && (
                            <div className="article-featured-image">
                                <img src={displayedArticle.article_image_url} alt={displayedArticle.article_title} />
                            </div>
                        )}
                        <div className="social-share-sticky">
                            <button className="share-btn facebook" onClick={handleFacebookClick}>
                                <i className="fab fa-facebook-f"></i>
                            </button>
                            {/* <button class="share-btn twitter"><i class="fab fa-twitter"></i></button>
                                <button class="share-btn whatsapp"><i class="fab fa-whatsapp"></i></button>
                                <button class="share-btn telegram"><i class="fab fa-telegram-plane"></i></button>
                                <button class="share-btn email"><i class="fas fa-envelope"></i></button>*/}
                        </div>

                        {/* --- 6. CUERPO DEL ARTÍCULO EDITABLE --- */}
                        <div className="article-body">
                            {isEditingContent && canEditArticle ? (
                                <Editor
                                    apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                                    onInit={(evt, editor) => editorRef.current = editor}
                                    value={editableContent}
                                    onEditorChange={(newContent) => setEditableContent(newContent)}
                                    init={editorConfig}
                                />
                            ) : (
                                <div className="rendered-content">
                                    <RenderArticleContent htmlContent={displayedArticle.article_content} />
                                </div>
                            )}
                        </div>
                        <CommentsSection articleId={code} onOpenAuth={onOpenAuth} />
                    </article>

                    <aside className="article-sidebar">
                        <div className="widget related-news">
                            <h3>Noticias Relacionadas</h3>
                            {loadingRelated && <p>Cargando...</p>}
                            {error && <p className="error">{errorRelated}</p>}
                            {!loadingRelated && !errorRelated && (
                                <div className="related-news-list">
                                    {relatedArticles.map((related) => (
                                        // DESPUÉS (Recomendado)
                                        <Link
                                            to={`/articulos/${related.article_code}/${related.article_slug}`}
                                            className="related-news-item"
                                            key={related.article_code}
                                            state={{
                                                article: {
                                                    ...related,
                                                    article_published_at: related.date,
                                                },
                                            }}
                                        >
                                            <img src={related.image} alt={related.title} />
                                            <div className="related-news-info">
                                                <h4>{related.title}</h4>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                        {sidebar}

                        {/*
                        <div className="widget trending-now">
                            <h3>Trending Ahora</h3>
                            <div className="trending-list">
                                {trending.map((t, i) => (
                                    <div className="trending-item" key={t.id}>
                                        <span className="trending-number">{i + 1}</span>
                                        <h4>{t.title}</h4>
                                    </div>
                                ))}
                            </div>
                        </div>
                        */}
                    </aside>
                </div>

                <section className="more-to-read">
                    <h2>Más para leer</h2>
                    {loadingRelated && <p>Cargando...</p>}
                    {errorRelated && <p className="error">{errorRelated}</p>}
                    {!loadingRelated && !errorRelated && (
                        <div className="more-articles">
                            {relatedArticles.slice(0, 3).map((ma) => (
                                <Link
                                    to={`/articulos/${ma.article_code}/${ma.article_slug}`}
                                    className="more-article-card"
                                    key={ma.article_code}
                                >
                                    <img src={ma.image} alt={ma.title} />
                                    <div className="more-article-content">
                                        <span className="more-article-category">{ma.category}</span>
                                        <h3>{ma.title}</h3>
                                        <p>{ma.excerpt}</p>
                                        <span className="more-article-link">Leer más</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
                {showInsertAdModal && (
                    <div className="modal-backdrop" onClick={() => setShowInsertAdModal(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <h3>Insertar Publicidad en el Artículo</h3>
                                // Después (Correcto)
                            <div className="ad-selection-list">
                                {adsLoading && <p>Cargando anuncios...</p>}
                                {adsError && <p className="error">{adsError}</p>}
                                {!adsLoading && !adsError && (
                                    advertisements.length > 0 ? advertisements.map(ad => (
                                        <div key={ad.ad_id} className="ad-selection-item" onClick={() => handleInsertAd(ad)}>
                                            <img src={ad.ad_image_url} alt={ad.ad_name} />
                                            <span>{ad.ad_name} ({ad.ad_type})</span>
                                        </div>
                                    )) : <p>No hay anuncios disponibles para insertar.</p>
                                )}
                            </div>
                            <button className="btn btn-secondary" onClick={() => setShowInsertAdModal(false)}>Cancelar</button>
                        </div>
                    </div>
                )}
            </main >
        </>
    );
};

export default ArticlePage;
