// src/hooks/useRelatedArticles.js
import { useState, useEffect } from "react";
import Url from "../helpers/Url";

export default function useRelatedArticles(articleId) {
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [loadingRelated, setLoadingRelated] = useState(true);
    const [errorRelated, setErrorRelated] = useState(null);

    useEffect(() => {
        if (!articleId) {
            setLoadingRelated(false);
            return;
        }

        const fetchRelated = async () => {
            setLoadingRelated(true);
            setErrorRelated(null);
            try {
                const res = await fetch(
                    `${Url.url}/api/articles/${articleId}/related`,
                    { cache: "no-cache" }
                );
                const body = await res.json();
                if (!res.ok) throw new Error(body.message);
                if (body.status !== "success") throw new Error(body.message);
                setRelatedArticles(body.items);
            } catch (err) {
                setErrorRelated(err.message);
                setRelatedArticles([]);
            } finally {
                setLoadingRelated(false);
            }
        };

        fetchRelated();
    }, [articleId]);

    return { relatedArticles, loadingRelated, errorRelated };
}
