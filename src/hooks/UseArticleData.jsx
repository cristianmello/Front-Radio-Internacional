// src/hooks/useArticleData.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

/**
 * Hook para cargar un artículo por su ID y obtener también
 * hasta 3 artículos relacionados de la misma categoría.
 */
export default function useArticleData() {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [relatedNews, setRelatedNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchArticle() {
            setLoading(true);
            try {
                // 1) Carga el artículo
                const res = await fetch(`/api/articles/${id}`);
                const json = await res.json();
                if (json.status === "success" && json.article) {
                    const art = json.article;
                    setArticle(art);

                    // 2) Busca hasta 3 relacionados en la misma categoría
                    //    suponiendo que tu endpoint /api/articles acepta filter por categoría:
                    const catSlug = art.category.category_slug;
                    const relRes = await fetch(`/api/articles?category=${catSlug}&limit=3`);
                    const relJson = await relRes.json();
                    if (relJson.status === "success" && Array.isArray(relJson.articles)) {
                        setRelatedNews(relJson.articles);
                    }
                } else {
                    setArticle(null);
                }
            } catch (err) {
                console.error("Error fetching article:", err);
                setArticle(null);
            } finally {
                setLoading(false);
            }
        }

        fetchArticle();
    }, [id]);

    return { article, relatedNews, loading };
}
