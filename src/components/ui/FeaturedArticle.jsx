// src/components/layout/public/home/FeaturedArticle.jsx
import React, { useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useSectionEdit } from "../../context/SectionEditContext";

const FeaturedArticle = React.memo(({ data = [] }) => {
    const { canEdit, onRemove, onEdit } = useSectionEdit();

    const navigate = useNavigate();

    const {
        article_code,
        slug,
        title,
        excerpt,
        image,
        category_name,
        author,
        date,
        readTime,
        url,
        is_premium,
    } = data;

    // Formatear fecha (p.ej. "13 de junio, 2025")
    const formattedDate = useMemo(() =>
        date ? format(new Date(date), "d 'de' MMMM, yyyy", { locale: es }) : "",
        [date]
    );

    const srcSetWebp = useMemo(() =>
        `${image}?width=600&height=400&fit=contain 600w, ${image}?width=1200&height=800&fit=contain 1200w`,
        [image]
    );

    const srcSetJpeg = useMemo(() =>
        `${image}?width=600&height=400&fit=contain 600w, ${image}?width=1200&height=800&fit=contain 1200w`,
        [image]
    );

    const handleArticleClick = useCallback(() => {
        if (canEdit) return;
        navigate(`/articulos/${article_code}/${slug}`, {
            state: { article: { ...data, article_published_at: date } },
        });
    }, [canEdit, navigate, article_code, slug, data, date]);

    const handleEdit = useCallback((e) => {
        e.stopPropagation();
        onEdit(data);
    }, [data, onEdit]);

    const handleRemove = useCallback((e) => {
        e.stopPropagation();
        onRemove(article_code);
    }, [article_code, onRemove]);
    if (!article_code) return null;

    return (
        <div className={`featured-article ${!canEdit ? 'clickable' : ''}`} onClick={handleArticleClick}>
            <div className="article-image">
                {is_premium && (
                    <div className="badge premium">Premium</div>
                )}
                <div className="badge breaking">ÚLTIMA HORA</div>
                <picture>
                    <source srcSet={srcSetWebp} sizes="(max-width: 600px) 600px, 1200px" type="image/webp" />
                    <source srcSet={srcSetJpeg} sizes="(max-width: 600px) 600px, 1200px" type="image/jpeg" />
                    <img src={image || "/placeholder.jpg"} alt={title} loading="lazy" className="news-card-image" />
                </picture>
            </div>
            <div className="article-content">
                <span
                    className="category"
                    data-editable-id={`cat-${article_code}`}>
                    {category_name}
                </span>
                <h3 data-editable-id={`title-${article_code}`}>
                    {title}
                </h3>
                <p className="excerpt" data-editable-id={`excerpt-${article_code}`} >
                    {excerpt}
                </p>
                <div className="article-meta">
                    {/*  <span className="author" data-editable-id={`author-${article_code}`}>
                        Por {author}
                    </span>
                    */}
                    <span className="date" data-editable-id={`date-${article_code}`}>
                        {formattedDate}
                    </span>
                    <span className="read-time" data-editable-id={`readtime-${article_code}`}>
                        {readTime}
                    </span>
                </div>

                <Link
                    to={`/articulos/${article_code}/${slug}`}
                    className="read-more"
                    // 👇 Añadimos el state para la carga optimista en ArticlePage
                    state={{
                        article: {
                            ...data, // Copia todas las propiedades de la noticia (title, image, etc.)
                            article_published_at: data.date, // Añade la propiedad que ArticlePage espera
                        },
                    }}
                >
                    Leer más
                </Link>

                {canEdit && (
                    <div className="item-actions">
                        {/* Botón editar artículo */}
                        <button className="edit-item-btn" title="Editar artículo" onClick={handleEdit}>

                            <i className="fas fa-pen"></i>
                        </button>

                        {/* Botón eliminar artículo */}
                        {onRemove && (
                            <button className="delete-item-btn" title="Eliminar elemento" onClick={handleRemove}>
                                <i className="fas fa-trash" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});
export default FeaturedArticle;
