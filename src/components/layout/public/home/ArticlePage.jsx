import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import usePublicArticle from '../../../../hooks/usePublicArticle';
import useArticleActions from '../../../../hooks/useArticleActions';
import useRelatedArticles from '../../../../hooks/useRelatedArticles';
import useAuth from '../../../../hooks/UseAuth';
import { useEditMode } from '../../../../context/EditModeContext';
import { Editor } from '@tinymce/tinymce-react';
import Url from '../../../../helpers/Url';
import NewsSidebar from './NewsSidebar';
import SidebarWidget from './SidebarWidget';
import RenderArticleContent from './RenderArticleContent';
import useSections from '../../../../hooks/useSections';
import useAdvertisements from '../../../../hooks/useAdvertisements';
import useCategories from '../../../../hooks/useCategories';

const iconMap = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle',
};

const ArticlePage = () => {
    const { code, slug } = useParams();
    const location = useLocation();
    const initialData = location.state?.article;

    const { article, loading, error, refresh } = usePublicArticle(code, slug);
    const { editArticle } = useArticleActions();
    const { relatedArticles, loadingRelated, errorRelated } = useRelatedArticles(code);
    const { categories, loading: loadingCats, error: errorCats } = useCategories();

    const { auth, roles, authFetch } = useAuth();
    const editMode = useEditMode(); // Hook para saber si el modo editor global está activo
    const canEditArticle = auth?.user_code && roles.some(r => ["editor", "admin", "superadmin"].includes(r));

    // —— SECTIONS FOR SIDEBAR ——  
    const { sections, loading: loadingSections, error: errorSections } = useSections();
    const sidebarWidgetTypes = ['sidebar', 'sideaudios', 'ad-small', 'ad-skyscraper'];
    const sidebarWidgets = (sections || [])
        .filter(s => sidebarWidgetTypes.includes(s.section_type))
        .sort((a, b) => a.section_position - b.section_position);
    const canEditGlobal = canEditArticle && editMode;

    // 2. Estados para controlar el modo de edición del contenido
    const [isEditingContent, setIsEditingContent] = useState(false);
    const [editableContent, setEditableContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const { advertisements, loading: adsLoading, error: adsError } = useAdvertisements();
    const [showInsertAdModal, setShowInsertAdModal] = useState(false);

    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const notificationTimer = useRef(null);
    const editorRef = useRef(null);


    // --- PASO 4: AÑADIR LA FUNCIÓN showNotification ---
    const showNotification = (message, type = 'info', duration = 3000) => {
        if (notificationTimer.current) {
            clearTimeout(notificationTimer.current);
        }
        setNotification({ show: true, message, type });
        notificationTimer.current = setTimeout(() => {
            setNotification({ show: false, message: '', type });
        }, duration);
    };

    // 3. Cuando el artículo se carga, se inicializa el estado del contenido editable
    useEffect(() => {
        if (article) {
            setEditableContent(article.article_content);
        }
    }, [article]);

    // Verificamos si el usuario actual tiene permisos para editar

    const imageUploadHandler = (blobInfo, progress) => new Promise((resolve, reject) => {
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
    });


    const handleSaveContent = async () => {
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
    };

    const handleCancelEdit = () => {
        // Restauramos el contenido original y salimos del modo edición
        setEditableContent(article.article_content);
        setIsEditingContent(false);
    };

    // Después (Correcto y más simple)
    const handleOpenInsertAdModal = () => {
        // Simplemente abre el modal. Los anuncios ya están en el estado 'advertisements'.
        if (adsError) {
            showNotification('No se pudieron cargar los anuncios.', 'error');
            return;
        }
        setShowInsertAdModal(true);
    };

    const handleInsertAd = (ad) => {
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
    };

    const displayedArticle = article || initialData;

    if (loading && !displayedArticle) {
        return <main className="article-main"><div className="container">Cargando artículo...</div></main>;
    }

    if (error) return <main className="article-main"><div className="container">Error: {error}</div></main>;

    if (!displayedArticle) {
        return <main className="article-main"><div className="container">Artículo no encontrado.</div></main>;
    }
    // Busca el nombre de la categoría
    const categoryObj = categories.find(
        (c) => c.category_code === displayedArticle.article_category_id
    );
    const categoryName = categoryObj
        ? categoryObj.category_name
        : '—';

    return (
        <main className="article-main">
            {/* 5. BARRA DE HERRAMIENTAS DE EDICIÓN */}
            {/* Solo es visible para usuarios con permisos y con el modo edición global activado */}
            {/* --- BARRA DE HERRAMIENTAS DE EDICIÓN (ESTRUCTURA CORREGIDA) --- */}
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

            <div className="container">
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

                        {/* --- 6. CUERPO DEL ARTÍCULO EDITABLE --- */}
                        <div className="article-body">
                            {isEditingContent && canEditArticle ? (
                                <Editor
                                    apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                                    onInit={(evt, editor) => editorRef.current = editor}
                                    value={editableContent}
                                    onEditorChange={(newContent) => setEditableContent(newContent)}
                                    init={{
                                        height: 600,
                                        menubar: true,
                                        plugins: 'lists link image table code help wordcount autoresize fullscreen preview emoticons media',
                                        toolbar: 'undo redo | blocks | bold italic underline strikethrough | ' +
                                            'forecolor backcolor | bullist numlist outdent indent | ' +
                                            'alignleft aligncenter alignright alignjustify | ' +
                                            'link image media insertAdButton| table | removeformat | fullscreen preview | help',
                                        image_uploadtab: true,
                                        images_upload_handler: imageUploadHandler,
                                        file_picker_types: 'image',
                                        automatic_uploads: true,

                                        extended_valid_elements: 'iframe[src|width|height|frameborder|allow|allowfullscreen|title]',
                                        media_live_embeds: true,
                                        content_style: `body {font-family:Helvetica,Arial,sans-serif; font-size:16px }iframe {width: 100% !important;max-width: 100%;height: auto !important;aspect-ratio: 16 / 9;border: none;}`,
                                        setup: (editor) => {
                                            editor.ui.registry.addButton('insertAdButton', {
                                                text: 'Publicidad',
                                                icon: 'bullhorn',
                                                tooltip: 'Insertar Publicidad',
                                                onAction: handleOpenInsertAdModal,
                                            });
                                        }
                                    }}

                                />
                            ) : (
                                <div className="rendered-content">
                                    <RenderArticleContent htmlContent={displayedArticle.article_content} />
                                </div>
                            )}
                        </div>


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
                        <NewsSidebar>
                            {loadingSections && <p>Cargando widgets…</p>}
                            {errorSections && <p className="form-error">{errorSections}</p>}
                            {!loadingSections && !errorSections && sidebarWidgets.map(widget => (
                                <SidebarWidget
                                    key={widget.section_slug}
                                    section={widget}
                                    canEditGlobal={canEditGlobal}
                                    onSectionDeleted={() => { /* refresh() si querés volver a cargar */ }}
                                />
                            ))}
                        </NewsSidebar>

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
            </div >
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
            {/* NOTIFICACIÓN TOAST */}
            <div className={`notification ${notification.show ? 'show' : ''} notification-${notification.type}`}>
                {notification.type && <i className={iconMap[notification.type]}></i>}
                <span>{notification.message}</span>
            </div>
        </main >
    );
};

export default ArticlePage;

/*
import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import usePublicArticle from '../../../../hooks/usePublicArticle';
import useArticleActions from '../../../../hooks/useArticleActions';
import useRelatedArticles from '../../../../hooks/useRelatedArticles';
import useCategories from '../../../../hooks/useCategories';
import useAuth from '../../../../hooks/UseAuth';
import { useEditMode } from '../../../../context/EditModeContext';
import { Editor } from '@tinymce/tinymce-react';
import Url from '../../../../helpers/Url';
import NewsSidebar from './NewsSidebar';
import SidebarWidget from './SidebarWidget';
import useSections from '../../../../hooks/useSections';


const ArticlePage = () => {
    const { code, slug } = useParams();
    const location = useLocation();
    const initialData = location.state?.article;

    const { article, loading, error, refresh } = usePublicArticle(code, slug);
    const { editArticle } = useArticleActions();
    const { relatedArticles, loadingRelated, errorRelated } = useRelatedArticles(code);
    const { categories, loading: loadingCats, error: errorCats } = useCategories();

    const { auth, roles, authFetch } = useAuth();
    const editMode = useEditMode(); // Hook para saber si el modo editor global está activo
    const canEditArticle = auth?.user_code && roles.some(r => ["editor", "admin", "superadmin"].includes(r));

    // —— SECTIONS FOR SIDEBAR ——  
    const { sections, loading: loadingSections, error: errorSections } = useSections();
    const sidebarWidgetTypes = ['sidebar', 'sideaudios', 'ad-small', 'ad-skyscraper'];
    const sidebarWidgets = (sections || [])
        .filter(s => sidebarWidgetTypes.includes(s.section_type))
        .sort((a, b) => a.section_position - b.section_position);
    const canEditGlobal = canEditArticle && editMode;

    // 2. Estados para controlar el modo de edición del contenido
    const [isEditingContent, setIsEditingContent] = useState(false);
    const [editableContent, setEditableContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // 3. Cuando el artículo se carga, se inicializa el estado del contenido editable
    useEffect(() => {
        if (article) {
            setEditableContent(article.article_content);
        }
    }, [article]);

    // Verificamos si el usuario actual tiene permisos para editar

    const imageUploadHandler = (blobInfo, progress) => new Promise((resolve, reject) => {
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
    });


    // 4. Función para guardar los cambios del contenido
    const handleSaveContent = async () => {
        if (!article) return;

        setIsSaving(true);
        const formData = new FormData();
        // Solo enviamos el campo que ha cambiado
        formData.append('article_content', editableContent);

        // Llamamos a la función de edición de nuestro hook
        const result = await editArticle(article.article_code, formData);

        if (result.success) {
            alert('¡Contenido guardado exitosamente!');
            setIsEditingContent(false); // Salimos del modo de edición
            refresh(); // Refrescamos los datos para ver la versión más reciente
        } else {
            alert('Error al guardar el contenido: ' + result.message);
        }
        setIsSaving(false);
    };

    const handleCancelEdit = () => {
        // Restauramos el contenido original y salimos del modo edición
        setEditableContent(article.article_content);
        setIsEditingContent(false);
    };

    const displayedArticle = article || initialData;

    if (loading && !displayedArticle) {
        return <main className="article-main"><div className="container">Cargando artículo...</div></main>;
    }

    if (error) return <main className="article-main"><div className="container">Error: {error}</div></main>;

    if (!displayedArticle) {
        return <main className="article-main"><div className="container">Artículo no encontrado.</div></main>;
    }
    // Busca el nombre de la categoría
    const categoryObj = categories.find(
        (c) => c.category_code === displayedArticle.article_category_id
    );
    const categoryName = categoryObj
        ? categoryObj.category_name
        : '—';

    const relatedNews = [
        {
            id: 1,
            title: 'Elecciones anticipadas sorprenden al panorama político',
            image: 'https://source.unsplash.com/random/120x80/?política',
            dateLabel: 'Hace 1 día',
            url: '/noticia/1'
        }
    ];

    const trending = [
        { id: 1, title: 'Retrocesos en negociaciones clave' },
        { id: 2, title: 'Impacto económico tras el acuerdo' },
        { id: 3, title: 'Reacciones de organismos internacionales' }
    ];

    const moreArticles = [
        {
            id: 1,
            title: 'Título de artículo recomendado',
            category: 'Deportes',
            excerpt: 'Breve descripción o extracto del artículo recomendado para lectura.',
            image: 'https://source.unsplash.com/random/400x250/?news',
            url: '/noticia/recomendado-1'
        },
        {
            id: 2,
            title: 'Otro artículo para leer',
            category: 'Tecnología',
            excerpt: 'Una vista previa de lo que trata este artículo interesante.',
            image: 'https://source.unsplash.com/random/400x250/?technology',
            url: '/noticia/recomendado-2'
        },
        {
            id: 3,
            title: 'Tercera recomendación interesante',
            category: 'Medio ambiente',
            excerpt: 'Un breve extracto que invita a seguir leyendo.',
            image: 'https://source.unsplash.com/random/400x250/?environment',
            url: '/noticia/recomendado-3'
        }
    ];
    return (
        <main className="article-main">
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
                            <button onClick={handleCancelEdit} disabled={isSaving} className="btn-cancel-style"> 
                                Cancelar
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="container">
                <div className="article-layout">
                    <article className="article-content">

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
                            
                        </div>

                        {displayedArticle.article_image_url && (
                            <div className="article-featured-image">
                                <img src={displayedArticle.article_image_url} alt={displayedArticle.article_title} />
                            </div>
                        )}

                        <div className="article-body">
                            {isEditingContent && canEditArticle ? (
                                <Editor
                                    apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                                    value={editableContent}
                                    onEditorChange={(newContent) => setEditableContent(newContent)}
                                    init={{
                                        height: 600,
                                        menubar: true,
                                        plugins: 'lists link image table code help wordcount autoresize fullscreen preview emoticons media',
                                        toolbar: 'undo redo | blocks | bold italic underline strikethrough | ' +
                                            'forecolor backcolor | bullist numlist outdent indent | ' +
                                            'alignleft aligncenter alignright alignjustify | ' +
                                            'link image media | table | removeformat | fullscreen preview | help',
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
                                <div className="rendered-content">
                                    <div dangerouslySetInnerHTML={{ __html: displayedArticle.article_content }} />
                                </div>)}
                        </div>


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
                        
                        <NewsSidebar>
                            {loadingSections && <p>Cargando widgets…</p>}
                            {errorSections && <p className="form-error">{errorSections}</p>}
                            {!loadingSections && !errorSections && sidebarWidgets.map(widget => (
                                <SidebarWidget
                                    key={widget.section_slug}
                                    section={widget}
                                    canEditGlobal={canEditGlobal}
                                    onSectionDeleted={() => {}
                                />
                            ))}
                        </NewsSidebar>

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
            </div >
        </main >
    );
};

export default ArticlePage;
*/