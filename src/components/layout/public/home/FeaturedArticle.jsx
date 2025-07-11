// src/components/layout/public/home/FeaturedArticle.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale"; // para formato en español
import { useSectionEdit } from "../../../../context/SectionEditContext";

const FeaturedArticle = ({ data = [] }) => {
    const { canEdit, onRemove, onEdit } = useSectionEdit();

    const navigate = useNavigate();

    const {
        article_code,
        article_slug,
        title,
        excerpt,
        image,
        category,
        author,
        date,
        readTime,
        url,
        is_premium,
    } = data;

    if (!article_code) return null;

    const handleArticleClick = () => {
        // Si estamos en modo edición, no hacemos nada
        if (canEdit) return;

        // Navegamos a la página del artículo
        navigate(`/articulos/${article_code}/${article_slug}`, {
            state: {
                article: {
                    ...data,
                    article_published_at: data.date,
                },
            },
        });
    };
    // Formatear fecha (p.ej. "13 de junio, 2025")
    const formattedDate = date
        ? format(new Date(date), "d 'de' MMMM, yyyy", { locale: es })
        : "";

    return (
        <div
            className={`featured-article ${!canEdit ? 'clickable' : ''}`}
            onClick={handleArticleClick}
        >
            <div className="article-image">
                {is_premium && (
                    <div className="badge premium">Premium</div>
                )}
                <div className="badge breaking">ÚLTIMA HORA</div>
                <picture>
                    <source
                        srcSet={`${image}?width=600&height=400&fit=contain 600w, ${image}?width=1200&height=800&fit=contain 1200w, ${image}?width=1800&height=1200&fit=contain 1800w`}
                        sizes="(max-width: 600px) 600px, (max-width: 1200px) 1200px, 1800px"
                        type="image/webp"
                    />
                    <source
                        srcSet={`${image}?width=600&height=400&fit=contain 600w, ${image}?width=1200&height=800&fit=contain 1200w, ${image}?width=1800&height=1200&fit=contain 1800w`}
                        sizes="(max-width: 600px) 600px, (max-width: 1200px) 1200px, 1800px"
                        type="image/jpeg"
                    />
                    <img
                        src={image || "/placeholder.jpg"}
                        alt={title}
                        data-editable-id={`img-${article_code}`}
                        loading="lazy" // Lazy load
                        className="news-card-image"
                    />
                </picture>


            </div>
            <div className="article-content">
                <span
                    className="category"
                    data-editable-id={`cat-${article_code}`}>
                    {category}
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
                    to={`/articulos/${article_code}/${article_slug}`}
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
                        <button
                            className="edit-item-btn"
                            title="Editar artículo"
                            onClick={() => onEdit(data)}
                        >
                            <i className="fas fa-pen"></i>
                        </button>

                        {/* Botón eliminar artículo */}
                        {onRemove && (
                            <button
                                className="delete-item-btn"
                                title="Eliminar elemento"
                                onClick={() => onRemove(article_code)}
                            >
                                <i className="fas fa-trash" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
export default FeaturedArticle;

{/*}
// Por ahora dejamos URL de imagen estática. Más adelante puedes pasarla por props.
const FeaturedArticle = () => {
    return (
        <div className="featured-article">
            <div className="article-image">
                <div className="badge breaking">ÚLTIMA HORA</div>
                <img
                    src="https://source.unsplash.com/random/1200x600/?news"
                    alt="Noticia principal"
                />
            </div>
            <div className="article-content">
                <span className="category">Política</span>
                <h3>Histórico acuerdo de paz firmado entre naciones en conflicto</h3>
                <p className="excerpt">
                    Tras décadas de tensiones, los líderes mundiales celebran el tratado
                    que promete estabilidad en la región y nuevas oportunidades de
                    cooperación internacional.
                </p>
                <div className="article-meta">
                    <span className="author">Por María González</span>
                    <span className="date">Hace 2 horas</span>
                    <span className="read-time">5 min lectura</span>
                </div>
                <a href="#" className="read-more" data-article-id="1">
                    Leer más
                </a>
            </div>
        </div>
    );
};

*/}

